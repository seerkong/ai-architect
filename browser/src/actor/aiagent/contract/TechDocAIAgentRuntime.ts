
import { TechDesignSnapshotDsl, AiAgentMode } from "@shared/contract";

export interface TechDocAIAgentRuntime {
  data: TechDocAIAgentData;
}

export interface TechDocAIAgentData {
  chatReader: ReadableStreamDefaultReader<Uint8Array> | null;

  currentSSEUrl: string;
  currentAiAgentMode: AiAgentMode;

  techDocDsl: TechDesignSnapshotDsl;

  conversationMutation: any;
  answerMutation: any;
  // 大模型返回的建议内容
  suggestion: any[]

  // 聊天输出富文本编辑器实例（通过全局对象访问）
  chatOutputEditor: any;
}