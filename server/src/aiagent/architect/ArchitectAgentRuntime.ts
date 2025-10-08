import { ChatCompletionMessageParam } from "openai/resources/chat";
import { Logger } from "../../helper/logger";
import { AiToHumanConfirmItem } from "../../../../shared/contract";

export interface ArchitectAgentRuntime {
  callback: ArchitectAgentCallback;
  logger: Logger;
  chatHistoryOld: ChatCompletionMessageParam[];
  dbSnapshot: ArchitectAgentDbSnapshot;
}

export interface ArchitectAgentCallback {
  onMessage: (msg: string) => void;
}

export interface ChatAiAnswer {
  // 大模型返回的原始内容
  content: string;
  // 大模型返回的结构化的，对数据的变更内容
  mutation: any;
  // 大模型返回的待确认项
  confirmItems: AiToHumanConfirmItem[];
}

export interface ArchitectAgentDbSnapshot {
  prdContent: string;
  techConstraintsContent: string;
  currentDslState: any;
  chatHistoryOld: ChatCompletionMessageParam[];
}