import { TechDocAIAgentRuntime } from "../contract/TechDocAIAgentRuntime";
import { AiWebArchitectMesh } from "../../mesh/AiWebArchitectMesh";
import { TechDocAIAgentActorLogic } from "./TechDocAIAgentActorLogic";
import { SSEHandlerFactory } from "./sse/SSEHandlerFactory";
import { ModuleDesignSSEHandler } from "./sse/ModuleDesignSSEHandler";
import { AiAgentMode, API_URL_PROJECT_ACCEPT_CHANGES, API_URL_PROJECT_DETAIL, TechDesignSnapshotDsl } from "@shared/contract";
import { updateViewsByDslSnapshot } from "./common/DslSnapshotMutationHelper";
import { ResetInputAndInitModulesSSEHandler } from "./sse/ResetInputAndInitModulesSSEHandler";

export class TechDocAIAgentPrivateLogic {
  constructor(
    private mesh: AiWebArchitectMesh,
    private runtime: TechDocAIAgentRuntime,
    private publicLogic: TechDocAIAgentActorLogic) {
  }

  async startChat() {
    const currentAiAgentMode = this.runtime.data.currentAiAgentMode;

    if (currentAiAgentMode.trim() === '') {
      alert('请选择任务类型');
      return;
    }

    try {
      // 使用工厂创建对应的SSE处理器
      const sseHandler = SSEHandlerFactory.createHandler(
        currentAiAgentMode,
        this.mesh,
        this.runtime,
        this.publicLogic
      );

      // 启动SSE流
      await sseHandler.startSSE();

    } catch (error) {
      console.error('启动SSE失败:', error);
      const chatEditor = this.runtime.data.chatOutputEditor;
      if (chatEditor) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const errorHtml = `<p style="color: #dc3545; font-weight: bold;">[错误] ${errorMessage}</p>`;
        chatEditor.appendContent(errorHtml);
      }
    }
  }


  async stopChat() {
    try {
      // 使用工厂创建对应的SSE处理器来停止流
      const currentAiAgentMode = this.runtime.data.currentAiAgentMode;
      const sseHandler = SSEHandlerFactory.createHandler(
        currentAiAgentMode,
        this.mesh,
        this.runtime,
        this.publicLogic
      );
      sseHandler.stopSSE();
    } catch (error) {
      console.error('停止SSE失败:', error);
    }
  }

  async onResetInputAndInitModules() {
    this.runtime.data.currentAiAgentMode = AiAgentMode.ResetInputAndInitModules;
    const handler = new ResetInputAndInitModulesSSEHandler(this.mesh, this.runtime, this.publicLogic);
    handler.switchToMode();
  }

  async onModuleDesign() {
    this.runtime.data.currentAiAgentMode = AiAgentMode.ModuleDesign;
    const handler = new ModuleDesignSSEHandler(this.mesh, this.runtime, this.publicLogic);
    handler.switchToMode();
  }

  // ===== 获取项目详情功能 =====
  async updateDetail() {
    const projectKeyInput = document.getElementById('project-key') as HTMLInputElement;
    const projectKey = projectKeyInput.value.trim();

    if (!projectKey) {
      alert('请输入项目ID');
      return;
    }

    try {
      const response = await fetch(API_URL_PROJECT_DETAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectKey: projectKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('项目详情:', result);

      // 获取 ProjectDetailViewModel 数据
      const projectDetail: any = result.data;
      let dslSnapshot = projectDetail.dslSnapshot as TechDesignSnapshotDsl;

      await updateViewsByDslSnapshot(this.mesh, this.runtime, dslSnapshot);

      // 设置原始PRD文档内容到编辑器
      if (projectDetail.sourcePrdContent) {
        this.mesh.TechDocEditorActorApi.setSourcePRDEditorContent(projectDetail.sourcePrdContent);
      }

      // 设置解析后PRD文档内容到编辑器
      if (projectDetail.transformedPrdContent) {
        this.mesh.TechDocEditorActorApi.setTransformedPRDEditorContent(projectDetail.transformedPrdContent);
      }

      // 设置技术约束文档内容到编辑器
      if (projectDetail.sourceTechConstraintsContent) {
        this.mesh.TechDocEditorActorApi.setTechConstraintsEditorContent(projectDetail.sourceTechConstraintsContent);
      }

      // 显示成功消息
      console.log(`项目详情获取成功！\n项目ID: ${projectKey}\n详情数据已打印到控制台`);

    } catch (error) {
      console.error('获取项目详情失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`获取项目详情失败: ${errorMessage}`);
    }
  }

  async acceptChanges() {
    const projectKeyInput = document.getElementById('project-key') as HTMLInputElement;
    const projectKey = projectKeyInput.value.trim();

    if (!projectKey) {
      alert('请输入项目ID');
      return;
    }
    let conversationIdNode = document.getElementById('conversation-id') as HTMLInputElement;
    let conversationId = conversationIdNode.value.trim();
    if (!conversationId || conversationId === '') {
      alert('未指定会话id');
      return;
    }

    try {
      const response = await fetch(API_URL_PROJECT_ACCEPT_CHANGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectKey: projectKey,
          conversationId: conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('项目详情:', result);

      // 更新技术文档DSL快照到视图中
      let dslSnapshot = result.data.dslSnapshot as TechDesignSnapshotDsl;
      await updateViewsByDslSnapshot(this.mesh, this.runtime, dslSnapshot);

      // 显示成功消息
      const chatEditor = this.runtime.data.chatOutputEditor;
      if (chatEditor) {
        const successHtml = `
          <p style="color: #28a745; font-weight: bold;">✓ 项目详情获取成功！</p>
          <p>项目ID: <strong>${projectKey}</strong></p>
          <p style="color: #666; font-style: italic;">详情数据已打印到控制台</p>
        `;
        chatEditor.setContent(successHtml);
      }

    } catch (error) {
      console.error('获取项目详情失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`获取项目详情失败: ${errorMessage}`);
    }
  }
}






