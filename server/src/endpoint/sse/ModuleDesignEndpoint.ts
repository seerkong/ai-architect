import { ArchitectAgentRuntime, ChatAiAnswer } from "../../aiagent/architect/ArchitectAgentRuntime";
import { GenTechDocAiAgent } from "../../aiagent/architect/GenTechDocAiAgent";
import { diffSnapshot, patchDslState } from "../../aiagent/architect/GenTechDocRespHelper";
import { ConversationService } from "../../crud/ConversationService";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { makeAgentRuntime, makeDbSnapshot } from "../helper/AgentRuntimeHelper";
import { ProjectService } from "../../crud/ProjectService";
import { SnapshotService } from "../../crud/SnapshotService";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";
import { ModuleDesignRequest, ProjectEntityType, ProjectStatus, SSEChatData, SSEChatEventType } from "@shared/contract";

export class ModuleDesignEndpoint implements ReqRespEndpoint {
  constructor(
    private logger: Logger) { }

  public async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let initRequest = request.body as ModuleDesignRequest;
    console.log('ModuleDesignRequest: ', initRequest);

    let project = await ProjectService.findOne(initRequest.projectKey) as ProjectEntityType | null;

    if (!project) {
      httpCtx.emitErrorAndEnd(JSON.stringify({ error: "project not found" }));
      return;
    }

    // 如果没会话，创建新的会话。否则在原来的会话后面添加消息
    let conversationAndMsgResult = await ConversationService
      .createOrUpdateConversationAndMsg(
        project, initRequest.userCommand, initRequest.conversationId);

    let historyMessages = await ConversationService.listHistoryMessages(conversationAndMsgResult.conversationUniqueId);

    // 构造agent消息所需要的数据
    let dbSnapshot = await makeDbSnapshot(project, conversationAndMsgResult.conversationAfterSnapshotId || 0);
    // 构造agent运行时
    let agentRuntime: ArchitectAgentRuntime = await makeAgentRuntime(
      httpCtx,
      this.logger,
      conversationAndMsgResult,
      dbSnapshot,
      historyMessages
    );

    // 向浏览器发送开始事件
    let startSSEChatData: SSEChatData = {
      event: SSEChatEventType.start,
      conversationId: conversationAndMsgResult.conversationUniqueId,
      messageId: '' + conversationAndMsgResult.answerMessageId,
      content: '',
    };
    httpCtx.emitData(JSON.stringify(startSSEChatData));

    // 执行模块设计指令
    const chatResult: ChatAiAnswer = await GenTechDocAiAgent.moduleDesign(
      agentRuntime, initRequest.userCommand
    );

    // 完全创建新的dslState, 基于这个版本做patch
    let dslStateConversationBefore = await SnapshotService.getDslBySnapshotId(conversationAndMsgResult.conversationBeforeSnapshotId);
    let dslStateAfter = JSON.parse(JSON.stringify(dbSnapshot.currentDslState));
    let dslNewState = patchDslState(dslStateAfter, chatResult.mutation);
    console.log('after init, dslState: ', dslNewState);
    // 这个会话最开始的版本到当前版本总计的变更
    let conversationDiff = diffSnapshot(dslStateConversationBefore, dslNewState);

    let dslSnapshotAfterId = await ConversationService.updateConversationAndMsgSnapshot(
      project.projectKey,
      conversationAndMsgResult.conversationUniqueId,
      conversationAndMsgResult.answerMessageId,
      chatResult.content, dslNewState
    );

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
    httpCtx.emitData(JSON.stringify(doneSSEChatData));

    httpCtx.emitDoneAndEnd();
  }

}