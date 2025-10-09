import type {
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions';

import { AiClientOptions, AgentClientCallback, callCustomAI, makeCustomAIClient, OpenAiChatRequest } from '../../helper/CustomAiAgentClient';
import { readPromptFile } from '../helper/PromptHelper';
import { initRJS } from '../../helper/StrTplHelper';
import { ArchitectAgentRuntime, ChatAiAnswer } from './ArchitectAgentRuntime';
import { extractConfirmForm, extractMutationPatch } from './GenTechDocRespHelper';
import { AiToHumanConfirmItem } from '../../../../shared/contract';
import { configManager } from '../../config';

// 声明 RJS 变量
let rjs: any;

export class GenTechDocAiAgent {
  public static async init() {
    if (!rjs) {
      rjs = await initRJS();
    }
  }

  public static makeChatMessageParams(
    systemMessages: string[],
    prevDynamicMessages: string[],
    historyDynamicMessages: ChatCompletionMessageParam[],
    postDynamicMessages: string[]
  ): ChatCompletionMessageParam[] {

    let targetMessages: ChatCompletionMessageParam[] = [];
    for (const message of systemMessages) {
      targetMessages.push({
        role: 'system',
        content: message
      });
    }

    for (const message of prevDynamicMessages) {
      targetMessages.push({
        role: 'user',
        content: message
      });
    }
    for (const message of historyDynamicMessages) {
      targetMessages.push(message);
    }
    for (const message of postDynamicMessages) {
      targetMessages.push({
        role: 'user',
        content: message
      });
    }
    return targetMessages;
  }

  public static async addDynamicMessages(
    agentRuntime: ArchitectAgentRuntime,
    systemMessages: string[],
    prdContent: string,
    techConstraintsContent: string,
    postDynamicMessages: string[]
  ): Promise<ChatCompletionMessageParam[]> {

    let initModulePrompt = `
      --------------------------------
      需求文档如下
      --------------------------------
      ${prdContent}
    `;
    if (techConstraintsContent && techConstraintsContent.trim() !== '') {
      initModulePrompt += `
      --------------------------------
      技术约束文档如下
      ${techConstraintsContent}
      --------------------------------
      `;
    }
    if (agentRuntime.chatHistoryOld) {
      initModulePrompt += `
      过往会话历史见后续消息
      `;
    }
    let prevDynamicMessages: string[] = [
      initModulePrompt,
    ]

    let historyDynamicMessages: ChatCompletionMessageParam[] = [];

    if (agentRuntime.chatHistoryOld) {
      for (const message of agentRuntime.chatHistoryOld) {
        historyDynamicMessages.push(message);
      }
    }

    return GenTechDocAiAgent.makeChatMessageParams(
      systemMessages,
      prevDynamicMessages,
      historyDynamicMessages,
      postDynamicMessages
    );
  }

  public static async initProjectV1(
    runtime: ArchitectAgentRuntime
  ): Promise<ChatAiAnswer> {
    await GenTechDocAiAgent.init();

    // 组装响应结构规范
    let techDocXmlRespSpecPromptTpl = readPromptFile('TechDocXmlRespSpecPrompt.md');
    // 模块初始化阶段，暂不允许提出待确认项
    let techDocXmlRespSpecPrompt = rjs.compile(techDocXmlRespSpecPromptTpl, {
      DetailDesignSequencePrompt: '',
      DetailDesignExplainPrompt: ''
    });

    const systemMessages: string[] = [
      readPromptFile('TechDocDslDefPrompt.md') as string,
      techDocXmlRespSpecPrompt,
      readPromptFile('TechDocDslBackendDemoPromptV1.md') as string
    ]

    let dslStateBeforeJsonStr = JSON.stringify(runtime.dbSnapshot.currentDslState);
    let currentDslStateTpl = readPromptFile('TechDocCurrentDslStatePrompt.md');
    let currentDslStatePrompt = rjs.compile(currentDslStateTpl, {
      currentDslState: dslStateBeforeJsonStr
    });

    let commandPrompt =
      `请根据需求文档，进行模块拆分初始化（填充模块设计的businessDesc、dependency）。不需要设计除Module以外的其他类别的内容`;
    let postDynamicMessages: string[] = [
      currentDslStatePrompt,
      commandPrompt,
    ]

    let paramMessages = await GenTechDocAiAgent.addDynamicMessages(
      runtime,
      systemMessages,
      runtime.dbSnapshot.prdContent || '',
      runtime.dbSnapshot.techConstraintsContent || '',
      postDynamicMessages
    );

    let r = await GenTechDocAiAgent.kickChatLoop(runtime, paramMessages);
    return r;
  }

  public static async moduleDesign(
    runtime: ArchitectAgentRuntime,
    userQuestion: string,
  ): Promise<ChatAiAnswer> {
    await this.init();

    // 组装响应结构规范
    let techDocXmlRespSpecPromptTpl = readPromptFile('TechDocXmlRespSpecPrompt.md');
    let respSpecDetailDesignSequencePrompt = readPromptFile('TechDocXmlRespSpecDetailDesignSequencePrompt.md');
    let respSpecDetailDesignExplainPrompt = readPromptFile('TechDocXmlRespSpecDetailDesignExplainPrompt.md');

    let techDocXmlRespSpecPrompt = rjs.compile(techDocXmlRespSpecPromptTpl, {
      DetailDesignSequencePrompt: respSpecDetailDesignSequencePrompt,
      DetailDesignExplainPrompt: respSpecDetailDesignExplainPrompt
    });

    const systemMessages: string[] = [
      readPromptFile('TechDocDslDefPrompt.md') as string,
      techDocXmlRespSpecPrompt,
      readPromptFile('TechDocDslBackendDemoPromptV1.md') as string,
      readPromptFile('TechDocDslFrontendDemoPrompt.md') as string
    ]

    let dslStateBeforeJsonStr = JSON.stringify(runtime.dbSnapshot.currentDslState);
    let currentDslStateTpl = readPromptFile('TechDocCurrentDslStatePrompt.md');
    let currentDslStatePrompt = rjs.compile(currentDslStateTpl, {
      currentDslState: dslStateBeforeJsonStr
    });

    let intentRecognitionPromptTpl = readPromptFile('TechDocIntentRecognitionPrompt.md');
    let commandPrompt = rjs.compile(intentRecognitionPromptTpl, {
      userQuestion: userQuestion
    });

    let postDynamicMessages: string[] = [
      currentDslStatePrompt,
      commandPrompt,
    ]

    let paramMessages = await GenTechDocAiAgent.addDynamicMessages(
      runtime,
      systemMessages,
      runtime.dbSnapshot.prdContent || '',
      runtime.dbSnapshot.techConstraintsContent || '',
      postDynamicMessages
    );

    let r = await GenTechDocAiAgent.kickChatLoop(runtime, paramMessages);
    return r;
  }



  public static async updateModifiedTechDoc(
    runtime: ArchitectAgentRuntime,
    userQuestion: string,
    techDocContent: string,
  ): Promise<ChatAiAnswer> {
    await this.init();

    const systemMessages: string[] = [
      readPromptFile('TechDocDslDefPrompt.md') as string,
      readPromptFile('TechDocXmlRespSpecPrompt.md') as string,
      readPromptFile('TechDocDslBackendDemoPromptV1.md') as string
    ]

    let dslStateBeforeJsonStr = JSON.stringify(runtime.dbSnapshot.currentDslState);
    let currentDslStateTpl = readPromptFile('TechDocCurrentDslStatePrompt.md');
    let currentDslStatePrompt = rjs.compile(currentDslStateTpl, {
      currentDslState: dslStateBeforeJsonStr
    });

    let commandPrompt =
      `
由于用户手动修改了技术文档，需要将修改后的技术文档，转换为对原来技术文档结构化的dsl的修改指令
为了防止传入空文档导致过往工作丢失，你应当只去识别，在原来的dsl基础上，新增和修改操作。不可以生成删除操作

当前最新的技术文档，使用html表示如下
<TechDocHtml>
${techDocContent}
</TechDocHtml>
    `;
    let postDynamicMessages: string[] = [
      currentDslStatePrompt,
      commandPrompt,
    ]

    let paramMessages = await GenTechDocAiAgent.addDynamicMessages(
      runtime,
      systemMessages,
      runtime.dbSnapshot.prdContent || '',
      runtime.dbSnapshot.techConstraintsContent || '',
      postDynamicMessages
    );

    let r = await GenTechDocAiAgent.kickChatLoop(runtime, paramMessages);
    return r;
  }

  public static async kickChatLoop(
    agentRuntime: ArchitectAgentRuntime,
    paramMessages: ChatCompletionMessageParam[]
  ): Promise<ChatAiAnswer> {


    let callback: AgentClientCallback = {
      onMessage: (msg: string) => {
        if (agentRuntime.callback && agentRuntime.callback.onMessage) {
          agentRuntime.callback.onMessage(msg);
        }
      }
    };

    // 根据配置选择AI客户端
    let makeClientFn, callClientFn, clientConfig, model;
    const aiProviderConfig = configManager.getAiProviderConfig();

    let aiClientOptions: AiClientOptions = {
      stream: true,
    };
    // 检查是否使用Claude
    if (aiProviderConfig.provider === 'claude') {
      const claudeConfig = configManager.getClaudeConfig();
      makeClientFn = makeCustomAIClient;
      callClientFn = callCustomAI;
      clientConfig = {
        baseURL: claudeConfig.base_url,
        apiKey: claudeConfig.api_key,
      };
      model = claudeConfig.tech_doc_gen_model;
      aiClientOptions.claudeCompatible = true;
    } else {
      // 默认使用OpenAI客户端
      const openaiConfig = configManager.getOpenaiConfig();

      makeClientFn = makeCustomAIClient;
      callClientFn = callCustomAI;
      clientConfig = {
        baseURL: openaiConfig.base_url,
        apiKey: openaiConfig.api_key,
      };
      model = openaiConfig.tech_doc_gen_model;
    }

    const aiClient = makeClientFn(clientConfig);

    let apiParam = {
      model: model,
      messages: paramMessages,
    };
    let message: any = await callClientFn(
      callback, aiClient, apiParam as OpenAiChatRequest,
      aiClientOptions);

    let patch = {};
    let confirmItems: AiToHumanConfirmItem[] = [];
    if (message.content) {
      // 使用 fast-xml-parser 解析大模型返回的xml内容
      patch = extractMutationPatch(message.content);
      confirmItems = extractConfirmForm(message.content);
    }
    if (Object.keys(patch).length === 0) {
      console.error("------ai resonpse structured data is empty, full content is:\n", message.content);
    }

    // 返回结构化结果
    console.log("------ai resonpse structured data:\n", JSON.stringify(patch, null, 2));
    return {
      content: (message.content || ''),
      mutation: patch,
      confirmItems: confirmItems
    };;
  }
}

