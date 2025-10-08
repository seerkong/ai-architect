import { ChatCompletionMessageParam } from "openai/resources/index";
import { MessageEntityType, ProjectEntityType } from "../../../../shared/contract/model/EntityDef";
import { ArchitectAgentDbSnapshot, ArchitectAgentRuntime } from "../../aiagent/architect/ArchitectAgentRuntime";
import { ConversationAndMsgResult } from "../../crud/ConversationService";
import { HttpCtx } from "../../http/HttpCtx";
import { SSEChatData, SSEChatEventType } from "../../../../shared/contract/api/SSEApi";
import { Logger } from "../../helper/logger";
import { SnapshotService } from "../../crud/SnapshotService";

export async function makeAgentRuntime(
  httpCtx: HttpCtx,
  logger: Logger,
  conversationAndMsgResult: ConversationAndMsgResult,
  dbSnapshot: ArchitectAgentDbSnapshot,
  historyMessages: MessageEntityType[]
): Promise<ArchitectAgentRuntime> {
  let chatHistoryOld = historyMessages.map((message) => {
    return {
      role: message.role,
      content: message.content,
    };
  }) as ChatCompletionMessageParam[];
  let agentRuntime: ArchitectAgentRuntime = {
    logger: logger,
    chatHistoryOld: chatHistoryOld,
    callback: {
      onMessage: (msg) => {
        let onMessageSSEChatData: SSEChatData = {
          event: SSEChatEventType.message,
          conversationId: conversationAndMsgResult.conversationUniqueId,
          messageId: '' + conversationAndMsgResult.answerMessageId,
          content: msg,
        };
        httpCtx.emitData(JSON.stringify(onMessageSSEChatData));
      }
    },
    dbSnapshot: dbSnapshot,
  }

  return agentRuntime;
}

export async function makeDbSnapshot(project: ProjectEntityType,
  currentSnapshotId: number
): Promise<ArchitectAgentDbSnapshot> {
  let prdContentInDb = project?.transformedPrdContent;
  let techConstraintsContentInDb = project?.sourceTechConstraintsContent;

  let currentDslStateObj = await SnapshotService.getDslBySnapshotId(currentSnapshotId);

  return {
    prdContent: prdContentInDb || '',
    techConstraintsContent: techConstraintsContentInDb || '',
    currentDslState: currentDslStateObj,
    chatHistoryOld: [],
  }
}