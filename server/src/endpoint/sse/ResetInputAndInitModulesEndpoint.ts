import { ConversationAndMsgResult, ConversationService } from "../../crud/ConversationService";
import { ProjectService } from "../../crud/ProjectService";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { ProjectPushWs } from "../ws/ProjectPushWs";
import { extractImgUrlAndMarkSlots, getDocIdByLink, getDocsContentByLink, replaceImgSlotsWithText, getAccessTokenPublic, getDocsContentWithToken } from "../../helper/DocsApiHelper";
import { makeAgentRuntime, makeDbSnapshot } from "../helper/AgentRuntimeHelper";
import { ArchitectAgentRuntime, ChatAiAnswer } from "../../aiagent/architect/ArchitectAgentRuntime";
import { GenTechDocAiAgent } from "../../aiagent/architect/GenTechDocAiAgent";
import { diffSnapshot, patchDslState } from "../../aiagent/architect/GenTechDocRespHelper";
import { ImgRecognitionAgent, ImgRecognitionAgentRuntime } from "../../aiagent/image/ImgRecognitionAgent";
import { saveDocImageUrl, saveDocImageUrlWithToken } from "../../helper/SaveImageHelper";
import path from "path";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";
import { ProjectEntityType, ProjectStatus, ResetInputAndInitModulesRequest, SSEChatData, SSEChatEventType } from "@shared/contract";

export class ResetInputAndInitModulesEndpoint {
  /**
   * 同时发送SSE和WebSocket消息
   * @param httpCtx HTTP上下文
   * @param projectKey 项目键
   * @param sseData SSE数据
   */
  private static emitSSEAndPush(httpCtx: HttpCtx, projectKey: string, sseData: SSEChatData): void {
    // 发送SSE消息
    httpCtx.emitData(JSON.stringify(sseData));

    // 同时推送到WebSocket连接
    ProjectPushWs.pushToProject(projectKey, sseData);
  }

  public static async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let typedRequest = request.body as ResetInputAndInitModulesRequest;

    let project = await ProjectService.upsert(typedRequest.projectKey);

    if (!project) {
      httpCtx.emitErrorAndEnd(JSON.stringify({ error: "project not found" }));
      return;
    }

    // 获取公用token，用于整个请求过程中的所有API调用
    let accessToken: string | null = null;
    if (typedRequest.prdLink != null && typedRequest.prdLink.trim().length > 0) {
      try {
        accessToken = await getAccessTokenPublic();
        httpCtx.logger.info('成功获取访问令牌，将用于所有API调用');
      } catch (error) {
        httpCtx.logger.error('获取访问令牌失败:', error);
        httpCtx.emitErrorAndEnd(JSON.stringify({
          error: "获取访问令牌失败"
        }));
        return;
      }
    }

    let prdDocId = "";
    let prdContent = "";
    if (typedRequest.prdLink != null && typedRequest.prdLink.trim().length > 0) {
      prdDocId = getDocIdByLink(typedRequest.prdLink);
      if (accessToken) {
        prdContent = await getDocsContentWithToken(prdDocId, accessToken);
      } else {
        prdContent = await getDocsContentByLink(typedRequest.prdLink);
      }
    } else if (typedRequest.prdContent != null && typedRequest.prdContent.trim().length > 0) {
      prdContent = typedRequest.prdContent;
    } else {
      httpCtx.emitErrorAndEnd(JSON.stringify({
        error: "prdContent and prdLink are both empty"
      }));
      return;
    }

    let techConstraintsContent = '';
    if (typedRequest.techConstraintsLink != null && typedRequest.techConstraintsLink.trim().length > 0) {
      if (accessToken) {
        const techConstraintsDocId = getDocIdByLink(typedRequest.techConstraintsLink);
        techConstraintsContent = await getDocsContentWithToken(techConstraintsDocId, accessToken);
      } else {
        techConstraintsContent = await getDocsContentByLink(typedRequest.techConstraintsLink);
      }
    } else if (typedRequest.techConstraintsContent != null && typedRequest.techConstraintsContent.trim().length > 0) {
      techConstraintsContent = typedRequest.techConstraintsContent;
    } else {
      // 暂不报错
      techConstraintsContent = "";
    }

    // TODO 完善转换需求文档的提示词
    let userCommand = `请转换需求文档`;
    // 初始化模块时，创建新会话
    let conversationAndMsgResult = await ConversationService
      .createOrUpdateConversationAndMsg(
        project as unknown as ProjectEntityType, userCommand);

    // 向浏览器发送开始事件
    let startSSEChatData: SSEChatData = {
      event: SSEChatEventType.start,
      conversationId: conversationAndMsgResult.conversationUniqueId,
      messageId: '' + conversationAndMsgResult.answerMessageId,
      content: '',
    };
    this.emitSSEAndPush(httpCtx, typedRequest.projectKey, startSSEChatData);

    let prdContentAfterTransform = prdContent;
    // 开启需求文档转换
    if (typedRequest.enablePrdTransform) {
      httpCtx.logger.info(`开始进行需求文档图片识别等转换!`);
      prdContentAfterTransform = await this.transformPrdContent(
        httpCtx,
        httpCtx.logger,
        typedRequest.cookie || '',
        conversationAndMsgResult,
        prdDocId,
        prdContent,
        accessToken
      );
    }


    // PRD文档解析完毕，更新到数据库
    await ProjectService.updateProjectContent(project as ProjectEntityType, {
      status: ProjectStatus.PRDTransformed,
      sourcePrdContent: prdContent,
      transformedPrdContent: prdContentAfterTransform,
      sourceTechConstraintsContent: techConstraintsContent
    });

    await this.initModules(httpCtx, ProjectService, ConversationService, conversationAndMsgResult, project as unknown as ProjectEntityType);

    let doneSSEChatData: SSEChatData = {
      event: SSEChatEventType.done,
      conversationId: conversationAndMsgResult.conversationUniqueId,
      messageId: '' + conversationAndMsgResult.answerMessageId,
      content: '[DONE]',
    };
    this.emitSSEAndPush(httpCtx, typedRequest.projectKey, doneSSEChatData);

    httpCtx.emitDoneAndEnd();
  }


  private static async initModules(
    httpCtx: HttpCtx,
    projectService: typeof ProjectService,
    conversationService: typeof ConversationService,
    conversationAndMsgResult: ConversationAndMsgResult,
    project: ProjectEntityType): Promise<void> {
    let userCommand = `请根据需求文档，进行模块拆分初始化（填充模块设计的businessDesc、dependency）`;
    let dbSnapshot = await makeDbSnapshot(project, project.dslSnapshotId || 0);
    // 构造agent运行时
    let agentRuntime: ArchitectAgentRuntime = await makeAgentRuntime(
      httpCtx,
      httpCtx.logger,
      conversationAndMsgResult,
      dbSnapshot,
      []
    );

    const chatResult: ChatAiAnswer = await GenTechDocAiAgent.moduleDesign(
      agentRuntime, userCommand
    );
    // 完全创建新的dslState, 基于这个版本做patch
    let dslStateAfter = JSON.parse(JSON.stringify(dbSnapshot.currentDslState));
    let dslNewState = patchDslState(dslStateAfter, chatResult.mutation);
    console.log('after init, dslState: ', dslNewState);
    // 这个会话最开始的版本到当前版本总计的变更
    let conversationDiff = diffSnapshot(dbSnapshot.currentDslState, dslNewState);

    let dslSnapshotAfterId = await ConversationService.updateConversationAndMsgSnapshot(
      project.projectKey,
      conversationAndMsgResult.conversationUniqueId,
      conversationAndMsgResult.answerMessageId,
      chatResult.content, dslNewState
    );
    if (dslSnapshotAfterId) {
      await ConversationService.updateConversationBaseSnapshotId(conversationAndMsgResult.conversationUniqueId, dslSnapshotAfterId);
      await ProjectService.updateSnapshotId(project, dslSnapshotAfterId);

      // AI结果直接更新到project表
      await ProjectService.updateSnapshotId(project, dslSnapshotAfterId);

    }
    if (project.status == ProjectStatus.Init || project.status == ProjectStatus.PRDTransformed) {
      await ProjectService.updateStatus(project, ProjectStatus.ModuleInitialized);
    }

    let resultContent = {
      answerMutation: chatResult.mutation,
      conversationMutation: conversationDiff,
      newState: dslNewState,
      suggestion: [],
    }

    let resultSSEChatData: SSEChatData = {
      event: SSEChatEventType.result,
      conversationId: conversationAndMsgResult.conversationUniqueId,
      messageId: '' + conversationAndMsgResult.answerMessageId,
      data: resultContent,
    };
    httpCtx.emitData(JSON.stringify(resultSSEChatData));


    let doneSSEChatData: SSEChatData = {
      event: SSEChatEventType.done,
      conversationId: conversationAndMsgResult.conversationUniqueId,
      messageId: '' + conversationAndMsgResult.answerMessageId,
      content: '[DONE]',
    };
    this.emitSSEAndPush(httpCtx, project.projectKey, doneSSEChatData);

  }


  private static async transformPrdContent(
    httpCtx: HttpCtx,
    logger: Logger,
    cookie: string,
    conversationAndMsgResult: ConversationAndMsgResult,
    prdDocId: string,
    prdContent: string,
    accessToken: string | null): Promise<string> {
    let runtime: ImgRecognitionAgentRuntime = {
      callback: {
        onMessage: (msg: string) => {
          let onMessageSSEChatData: SSEChatData = {
            event: SSEChatEventType.message,
            conversationId: conversationAndMsgResult.conversationUniqueId,
            messageId: '' + conversationAndMsgResult.answerMessageId,
            content: msg,
          };
          httpCtx.emitData(JSON.stringify(onMessageSSEChatData));
        }
      },
      logger: logger,
      cookie: cookie
    };

    // 提取图片链接，并替换为槽位
    let markImgSlotText = extractImgUrlAndMarkSlots(prdContent);
    let slotKeyToImgReplaceText = await this.getImgUrlAndReplaceText(runtime, prdDocId, markImgSlotText.slotKeyToImgUrl, accessToken);
    return replaceImgSlotsWithText(markImgSlotText, slotKeyToImgReplaceText);
  }

  private static async getImgUrlAndReplaceText(
    runtime: ImgRecognitionAgentRuntime,
    docId: string,
    slotKeyToImgUrl: { [key: string]: string },
    accessToken: string | null): Promise<{ [key: string]: string }> {
    const imgCount = Object.keys(slotKeyToImgUrl).length;

    if (imgCount === 0) {
      return {};
    }

    runtime.callback.onMessage(`开始提取图片链接，个数:${imgCount}\n`);

    // 第一步：批量下载图片
    const downloadResults = await this.batchDownloadImages(runtime, docId, slotKeyToImgUrl, accessToken);

    // 第二步：批量理解图片
    const recognitionResults = await this.batchRecognizeImages(runtime, downloadResults);

    return recognitionResults;
  }

  // 批量下载图片
  private static async batchDownloadImages(
    runtime: ImgRecognitionAgentRuntime,
    docId: string,
    slotKeyToImgUrl: { [key: string]: string },
    accessToken: string | null
  ): Promise<{ [key: string]: { success: boolean; imagePath?: string; error?: string; originalUrl: string } }> {
    const BATCH_SIZE = 10;
    const imgEntries = Object.entries(slotKeyToImgUrl);
    const downloadResults: { [key: string]: { success: boolean; imagePath?: string; error?: string; originalUrl: string } } = {};
    let totalDownloadSuccess = 0;
    let totalDownloadFailure = 0;

    runtime.callback.onMessage(`开始批量下载图片...\n`);

    // 分批下载图片
    for (let i = 0; i < imgEntries.length; i += BATCH_SIZE) {
      const batch = imgEntries.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(imgEntries.length / BATCH_SIZE);

      runtime.callback.onMessage(`开始下载第 ${batchNumber}/${totalBatches} 批图片 (${batch.length} 张)...\n`);

      // 创建当前批次的并行下载任务
      const downloadTasks = batch.map(async ([slotKey, imgUrl]) => {
        const startTime = Date.now();
        try {
          const imagePath = await this.downloadSingleImage(docId, imgUrl, runtime.cookie, accessToken);
          const downloadTime = (Date.now() - startTime) / 1000;

          runtime.callback.onMessage(`图片下载成功: ${slotKey}, 耗时: ${downloadTime.toFixed(2)}秒\n`);
          console.log(`图片下载成功: ${slotKey}, 耗时: ${downloadTime.toFixed(2)}秒`);

          return { slotKey, success: true, imagePath, originalUrl: imgUrl };
        } catch (error) {
          const downloadTime = (Date.now() - startTime) / 1000;
          const errorMsg = error instanceof Error ? error.message : String(error);

          runtime.callback.onMessage(`图片下载失败: ${slotKey}, 原始URL: ${imgUrl}, 错误: ${errorMsg}, 耗时: ${downloadTime.toFixed(2)}秒\n`);
          console.log(`图片下载失败: ${slotKey}, 原始URL: ${imgUrl}, 错误: ${errorMsg}, 耗时: ${downloadTime.toFixed(2)}秒`);

          return { slotKey, success: false, error: errorMsg, originalUrl: imgUrl };
        }
      });

      // 并行执行当前批次的图片下载任务
      const batchResults = await Promise.all(downloadTasks);

      // 收集当前批次的结果
      let batchSuccessCount = 0;
      let batchFailureCount = 0;
      for (const result of batchResults) {
        downloadResults[result.slotKey] = {
          success: result.success,
          imagePath: result.imagePath,
          error: result.error,
          originalUrl: result.originalUrl
        };

        if (result.success) {
          batchSuccessCount++;
          totalDownloadSuccess++;
        } else {
          batchFailureCount++;
          totalDownloadFailure++;
        }
      }

      // 输出下载批次统计信息
      const batchStatsMsg = `第 ${batchNumber} 批下载完成: 成功 ${batchSuccessCount}/${batch.length} 张, 失败 ${batchFailureCount}/${batch.length} 张`;
      runtime.callback.onMessage(`${batchStatsMsg}\n`);
      console.log(batchStatsMsg);

      // 输出总体下载进度
      const totalProgressMsg = `下载进度: 已处理 ${Math.min(i + BATCH_SIZE, imgEntries.length)}/${imgEntries.length} 张, 总成功 ${totalDownloadSuccess} 张, 总失败 ${totalDownloadFailure} 张`;
      runtime.callback.onMessage(`${totalProgressMsg}\n`);
      console.log(totalProgressMsg);

      // 如果不是最后一批，等待一小段时间再处理下一批
      if (i + BATCH_SIZE < imgEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const downloadFinalMsg = `所有图片下载完成: 总成功 ${totalDownloadSuccess}/${imgEntries.length} 张, 总失败 ${totalDownloadFailure}/${imgEntries.length} 张`;
    runtime.callback.onMessage(`${downloadFinalMsg}\n`);
    console.log(downloadFinalMsg);

    return downloadResults;
  }

  // 批量理解图片
  private static async batchRecognizeImages(
    runtime: ImgRecognitionAgentRuntime,
    downloadResults: { [key: string]: { success: boolean; imagePath?: string; error?: string; originalUrl: string } }
  ): Promise<{ [key: string]: string }> {
    const BATCH_SIZE = 10;
    const slotKeyToImgReplaceText: { [key: string]: string } = {};

    // 分离成功下载和失败的图片
    const successfulDownloads = Object.entries(downloadResults).filter(([_, result]) => result.success);
    const failedDownloads = Object.entries(downloadResults).filter(([_, result]) => !result.success);

    // 对于下载失败的图片，直接设置为img标签
    for (const [slotKey, result] of failedDownloads) {
      slotKeyToImgReplaceText[slotKey] = `<img src="${result.originalUrl}" />`;
    }

    if (successfulDownloads.length === 0) {
      runtime.callback.onMessage(`没有成功下载的图片，跳过理解阶段\n`);
      return slotKeyToImgReplaceText;
    }

    runtime.callback.onMessage(`开始批量理解图片，成功下载的图片: ${successfulDownloads.length} 张\n`);

    let totalRecognitionSuccess = 0;
    let totalRecognitionFailure = 0;

    // 分批理解图片
    for (let i = 0; i < successfulDownloads.length; i += BATCH_SIZE) {
      const batch = successfulDownloads.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(successfulDownloads.length / BATCH_SIZE);

      runtime.callback.onMessage(`开始理解第 ${batchNumber}/${totalBatches} 批图片 (${batch.length} 张)...\n`);

      // 创建当前批次的并行理解任务
      const recognitionTasks = batch.map(async ([slotKey, result]) => {
        const startTime = Date.now();
        try {
          const recognitionResult = await this.recognizeSingleImage(runtime, result.imagePath!, slotKey, result.originalUrl);
          const recognitionTime = (Date.now() - startTime) / 1000;

          runtime.callback.onMessage(`图片理解成功: ${slotKey}, 耗时: ${recognitionTime.toFixed(2)}秒\n`);
          console.log(`图片理解成功: ${slotKey}, 耗时: ${recognitionTime.toFixed(2)}秒`);

          return { slotKey, success: true, content: recognitionResult };
        } catch (error) {
          const recognitionTime = (Date.now() - startTime) / 1000;
          const errorMsg = error instanceof Error ? error.message : String(error);

          runtime.callback.onMessage(`图片理解失败: ${slotKey}, 原始URL: ${result.originalUrl}, 错误: ${errorMsg}, 耗时: ${recognitionTime.toFixed(2)}秒\n`);
          console.log(`图片理解失败: ${slotKey}, 原始URL: ${result.originalUrl}, 错误: ${errorMsg}, 耗时: ${recognitionTime.toFixed(2)}秒`);

          return { slotKey, success: false, content: `<img src="${result.originalUrl}" />` };
        }
      });

      // 并行执行当前批次的图片理解任务
      const batchResults = await Promise.all(recognitionTasks);

      // 收集当前批次的结果
      let batchSuccessCount = 0;
      let batchFailureCount = 0;
      for (const result of batchResults) {
        slotKeyToImgReplaceText[result.slotKey] = result.content;

        if (result.success) {
          batchSuccessCount++;
          totalRecognitionSuccess++;
        } else {
          batchFailureCount++;
          totalRecognitionFailure++;
        }
      }

      // 输出理解批次统计信息
      const batchStatsMsg = `第 ${batchNumber} 批理解完成: 成功 ${batchSuccessCount}/${batch.length} 张, 失败 ${batchFailureCount}/${batch.length} 张`;
      runtime.callback.onMessage(`${batchStatsMsg}\n`);
      console.log(batchStatsMsg);

      // 输出总体理解进度
      const totalProgressMsg = `理解进度: 已处理 ${Math.min(i + BATCH_SIZE, successfulDownloads.length)}/${successfulDownloads.length} 张, 总成功 ${totalRecognitionSuccess} 张, 总失败 ${totalRecognitionFailure} 张`;
      runtime.callback.onMessage(`${totalProgressMsg}\n`);
      console.log(totalProgressMsg);

      // 如果不是最后一批，等待一小段时间再处理下一批
      if (i + BATCH_SIZE < successfulDownloads.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const recognitionFinalMsg = `所有图片理解完成: 总成功 ${totalRecognitionSuccess}/${successfulDownloads.length} 张, 总失败 ${totalRecognitionFailure}/${successfulDownloads.length} 张`;
    runtime.callback.onMessage(`${recognitionFinalMsg}\n`);
    console.log(recognitionFinalMsg);

    return slotKeyToImgReplaceText;
  }

  // 下载单张图片
  private static async downloadSingleImage(docId: string, imgUrl: string, cookie?: string, accessToken?: string | null): Promise<string> {
    if (accessToken) {
      return await saveDocImageUrlWithToken(docId, imgUrl, accessToken, cookie);
    } else {
      return await saveDocImageUrl(docId, imgUrl, cookie);
    }
  }

  // 理解单张图片
  private static async recognizeSingleImage(
    runtime: ImgRecognitionAgentRuntime,
    imagePath: string,
    slotKey: string,
    originalUrl: string
  ): Promise<string> {
    // 获取图片的绝对路径
    const absoluteImagePath = path.join(process.cwd(), imagePath);

    let beforeLogMsg = `开始进行图片识别! 图片链接：${originalUrl}`;
    runtime.logger.info(beforeLogMsg);
    runtime.callback.onMessage(beforeLogMsg);

    const recognitionResult = await ImgRecognitionAgent.recognizeImage(
      absoluteImagePath,
      undefined,
      undefined
    );

    runtime.logger.info('图片识别完成');
    return recognitionResult.content;
  }
}
