import { ActorApi } from "../../../framework/ActorApi";
import { TechDocEditorRuntime } from "./EditorRuntime";

export interface TechDocEditorActorApi extends ActorApi<TechDocEditorRuntime> {
  // 获取编辑后的技术文档内容
  getTechDocEditorContent(): string;
  // 设置编辑后的技术文档内容
  setTechDocEditorContent(content: string): void;

  // 获取原始PRD文档内容
  getSourcePRDEditorContent(): string;
  // 设置原始PRD文档内容
  setSourcePRDEditorContent(content: string): void;

  // 获取解析后PRD文档内容
  getTransformedPRDEditorContent(): string;
  // 设置解析后PRD文档内容
  setTransformedPRDEditorContent(content: string): void;

  // 获取技术约束文档内容
  getTechConstraintsEditorContent(): string;
  // 设置技术约束文档内容
  setTechConstraintsEditorContent(content: string): void;
}