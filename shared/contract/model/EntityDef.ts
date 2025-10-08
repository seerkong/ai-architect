// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI请求类型
export interface AIRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

// AI响应类型
export interface AIResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | undefined;
  model: string;
}

// 文档类型
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// 健康检查响应类型
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}


// 项目状态枚举
export enum ProjectStatus {
  Init = 'Init',
  PRDTransformed = 'PRDTransformed',
  ModuleInitialized = 'ModuleInitialized',
}

// 实体类型定义 - 这些类型现在与 TypeORM 实体保持一致
export interface ProjectEntityType {
  id: number;
  projectKey: string;
  status: ProjectStatus;
  dslSnapshotId: number | null;
  sourcePrdContent: string | null;
  transformedPrdContent: string | null;
  sourceTechConstraintsContent: string | null;
}

export interface ConversationEntityType {
  id: number;
  uniqueId: string;
  projectKey: string;
  dslSnapshotBeforeId: number | null;
  dslSnapshotAfterId: number | null;
  dslMutationFinal: string;
}

export interface MessageEntityType {
  id: number;
  projectKey: string;
  conversationUniqueId: string;
  dslSnapshotBeforeId: number | null;
  dslSnapshotAfterId: number | null;
  deleted: boolean;
  role: string;
  content: string;
  dslMutation: string;
}

export interface SnapshotEntityType {
  id: number;
  projectKey: string;
  dsl: string;
}