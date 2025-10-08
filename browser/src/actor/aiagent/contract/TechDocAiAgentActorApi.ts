import { TechDesignSnapshotDsl } from "@shared/contract";
import { ActorApi } from "../../../framework/ActorApi";
import { TechDocAIAgentRuntime } from "./TechDocAIAgentRuntime";

export interface TechDocAIAgentActorApi extends ActorApi<TechDocAIAgentRuntime> {
  getTechDocDsl(): TechDesignSnapshotDsl;
}