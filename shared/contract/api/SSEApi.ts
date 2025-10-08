import { TechDesignSnapshotDsl } from "../dsl/TechDesignDslDef";
import { TechDesignDslMutationItem } from "../dsl/TechDesignMutationDef";

export enum SSEChatEventType {
  start = 'start',
  message = 'message',
  result = 'result',
  ping = 'ping',
  done = 'done',
}


export interface SSEChatData {
  event: SSEChatEventType;
  conversationId: string; // 当前会话id.
  messageId: string; // 当前ai回答的消息id.
  content?: string; // 文本内容. 当event为message时，content为文本内容
  data?: any; // json数据. 当event为result时，data为json数据
}


export interface SSEChatDataResultData {
  answerMutation: { [key: string]: { [key: string]: TechDesignDslMutationItem } };
  conversationMutation: { [key: string]: { [key: string]: TechDesignDslMutationItem } };
  newState: TechDesignSnapshotDsl;
  // AI生成的，待用户确认的单选多选题等
  // 用于AI决策如何细化、下一步做什么等等
  confirmForm: any[];
}


export interface ResetInputAndInitModulesRequest {
  projectKey: string;
  // 优先使用需求文档的链接
  prdLink: string;
  // 需求文档
  prdContent: string;

  // 优先使用技术选型约束文档的链接
  techConstraintsLink: string;
  // 技术选型约束文档
  techConstraintsContent: string;
  // 是否启用需求文档转换
  enablePrdTransform?: boolean;
  // 用户cookie
  cookie?: string;
}


export interface ResetInputDocRequest {
  projectKey: string;
  // 优先使用需求文档的链接
  prdLink: string;
  // 需求文档
  prdContent: string;

  // 优先使用技术选型约束文档的链接
  techConstraintsLink: string;
  // 技术选型约束文档
  techConstraintsContent: string;
}

export interface InitProjectModuleRequest {
  projectKey: string;
  userCommand: string;
}



export interface ModuleDesignRequest {
  projectKey: string;
  // 如果没有会话，则创建新会话
  conversationId?: string;
  userCommand: string;
}

export interface UpdateModifiedTechDocRequest {
  projectKey: string;
  // 优先使用技术文档的链接
  techDocLink: string;
  // 在前端手动修改后的技术文档
  techDocContent: string;

}
