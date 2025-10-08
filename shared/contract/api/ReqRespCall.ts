import { TechDesignSnapshotDsl } from "../dsl/TechDesignDslDef";

export interface FetchDocContentRequest {
  docLink: string;
}

export interface FetchDocContentResponse {
  markdownContent: string;
  htmlContent: string;
}

export interface ImgRecognitionRequest {
  docLink: string;
  imageUrl: string;
  cookie?: string;
  systemPrompt?: string;
}

export interface ImgRecognitionResponse {
  success: boolean;
  imagePath: string;
  message: string;
  recognitionResult?: {
    content: string;
    xmlContent: string;
  };
}

export interface UpdateTechDocDslRequest {
  projectKey: string;
  // 如果传入了会话id, 则更新到会话级的after state
  // 如果没传或者为空，则更新到项目级的after state
  conversationUniqueId: string;
  techDocDsl: TechDesignSnapshotDsl;
}