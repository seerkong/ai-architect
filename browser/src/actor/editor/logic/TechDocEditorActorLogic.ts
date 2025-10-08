import { TechDocEditorRuntime } from "../contract/EditorRuntime";
import { TechDocEditorActorApi } from "../contract/TechDocEditorActorApi";
import * as PublicLogic from "./TechDocEditorPublicLogic";
import * as PrivateLogic from "./TechDocEditorPrivateLogic";
import { ActorApi } from "../../../framework/ActorApi";
import { AiWebArchitectMesh } from "../../mesh/AiWebArchitectMesh";

export class TechDocEditorActorLogic implements TechDocEditorActorApi,
  ActorApi<TechDocEditorRuntime> {
  private runtime: TechDocEditorRuntime;

  constructor(
    private mesh: AiWebArchitectMesh
  ) {
    this.runtime = PublicLogic.initRuntime(mesh);
  }

  async connect(): Promise<void> {
    await PublicLogic.connect(this.mesh, this.runtime);
  }

  // 获取编辑后的技术文档内容
  public getTechDocEditorContent(): string {
    // 从Monaco编辑器实例获取最新内容
    if (this.runtime.data.techDocEditor) {
      const content = this.runtime.data.techDocEditor.getValue();
      // 同步到runtime.data
      this.runtime.data.techDocHtmlContent = content;
      return content;
    }
    return this.runtime.data.techDocHtmlContent;
  }

  // 设置编辑后的技术文档内容
  public setTechDocEditorContent(content: string): void {
    this.runtime.data.techDocHtmlContent = content;
    // 如果Monaco编辑器已经初始化，更新其内容
    if (this.runtime.data.techDocEditor) {
      this.runtime.data.techDocEditor.setValue(content);
    } else {
      // 如果编辑器还未初始化，延迟设置内容
      setTimeout(() => {
        if (this.runtime.data.techDocEditor) {
          this.runtime.data.techDocEditor.setValue(content);
        }
      }, 1000);
    }
  }

  // 获取原始PRD文档内容
  public getSourcePRDEditorContent(): string {
    // 从Monaco编辑器实例获取最新内容
    if (this.runtime.data.sourcePRDEditor) {
      const content = this.runtime.data.sourcePRDEditor.getValue();
      // 同步到runtime.data
      this.runtime.data.sourcePRDContent = content;
      return content;
    }
    return this.runtime.data.sourcePRDContent;
  }

  // 设置原始PRD文档内容
  public setSourcePRDEditorContent(content: string): void {
    this.runtime.data.sourcePRDContent = content;
    // 如果原始PRD编辑器已经初始化，更新其内容
    if (this.runtime.data.sourcePRDEditor) {
      this.runtime.data.sourcePRDEditor.setValue(content);
    } else {
      // 如果编辑器还未初始化，延迟设置内容
      setTimeout(() => {
        if (this.runtime.data.sourcePRDEditor) {
          this.runtime.data.sourcePRDEditor.setValue(content);
        }
      }, 1000);
    }
  }

  // 获取解析后PRD文档内容
  public getTransformedPRDEditorContent(): string {
    // 从Monaco编辑器实例获取最新内容
    if (this.runtime.data.parsedPRDEditor) {
      const content = this.runtime.data.parsedPRDEditor.getValue();
      // 同步到runtime.data
      this.runtime.data.transformedPRDContent = content;
      return content;
    }
    return this.runtime.data.transformedPRDContent;
  }

  // 设置解析后PRD文档内容
  public setTransformedPRDEditorContent(content: string): void {
    this.runtime.data.transformedPRDContent = content;
    // 如果解析后PRD编辑器已经初始化，更新其内容
    if (this.runtime.data.parsedPRDEditor) {
      this.runtime.data.parsedPRDEditor.setValue(content);
    } else {
      // 如果编辑器还未初始化，延迟设置内容
      setTimeout(() => {
        if (this.runtime.data.parsedPRDEditor) {
          this.runtime.data.parsedPRDEditor.setValue(content);
        }
      }, 1000);
    }
  }

  // 获取技术约束文档内容
  public getTechConstraintsEditorContent(): string {
    // 从Monaco编辑器实例获取最新内容
    if (this.runtime.data.techConstraintsEditor) {
      const content = this.runtime.data.techConstraintsEditor.getValue();
      // 同步到runtime.data
      this.runtime.data.techConstraintsContent = content;
      return content;
    }
    return this.runtime.data.techConstraintsContent;
  }

  // 设置技术约束文档内容
  public setTechConstraintsEditorContent(content: string): void {
    this.runtime.data.techConstraintsContent = content;
    // 如果技术约束编辑器已经初始化，更新其内容
    if (this.runtime.data.techConstraintsEditor) {
      this.runtime.data.techConstraintsEditor.setValue(content);
    } else {
      // 如果编辑器还未初始化，延迟设置内容
      setTimeout(() => {
        if (this.runtime.data.techConstraintsEditor) {
          this.runtime.data.techConstraintsEditor.setValue(content);
        }
      }, 1000);
    }
  }
}