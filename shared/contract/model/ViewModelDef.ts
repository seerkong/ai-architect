import { ProjectStatus } from "./EntityDef";
import { TechDesignSnapshotDsl } from "../dsl/TechDesignDslDef";

export interface ProjectDetailViewModel {
  id: number;
  projectKey: string;
  status: ProjectStatus;
  // 当前生效的dsl快照
  dslSnapshot: TechDesignSnapshotDsl;
  // 原始prd内容
  sourcePrdContent: string;
  // 转换后的prd内容
  transformedPrdContent: string;
  // 原始技术约束内容
  sourceTechConstraintsContent: string;
}
