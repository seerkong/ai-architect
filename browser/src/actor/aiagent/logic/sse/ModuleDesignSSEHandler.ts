import { BaseSSEHandler, BaseSSERequest } from "./BaseSSEHandler";
import { SSE_URL_MODULE_DESIGN, TechDesignSnapshotDsl, ModuleDesignRequest } from "@shared/contract";
import { updateViewByDslMutation, updateViewsByDslSnapshot } from "../common/DslSnapshotMutationHelper";

/**
 * 模块设计的SSE处理器
 */
export class ModuleDesignSSEHandler extends BaseSSEHandler {

  protected getSSEUrl(): string {
    return SSE_URL_MODULE_DESIGN;
  }

  protected buildRequestData(userCommand: string, projectKey: string): ModuleDesignRequest {
    // 从表单获取会话ID
    const conversationIdNode = document.getElementById('conversation-id') as HTMLInputElement;
    const conversationId = conversationIdNode.value.trim();

    return {
      userCommand,
      projectKey,
      conversationId
    };
  }

  protected async handleResultMessage(message: any): Promise<void> {
    console.log('ModuleDesign result:', message.data);

    // 处理模块设计结果
    if (message.data) {
      console.log('处理模块设计结果数据:', message.data);

      // 可以在这里处理模块设计后的数据
      // 例如：更新DSL、渲染新的技术文档等

      let dslSnapshot = message.data.newState as TechDesignSnapshotDsl;

      this.runtime.data.techDocDsl = dslSnapshot;
      this.runtime.data.conversationMutation = message.data.conversationMutation;
      this.runtime.data.answerMutation = message.data.answerMutation;
      this.runtime.data.suggestion = message.data.suggestion;

      await updateViewsByDslSnapshot(this.mesh, this.runtime, dslSnapshot);

      await updateViewByDslMutation(this.mesh, this.runtime);
    }
  }

  /**
   * 设置默认的用户命令
   */
  public setDefaultUserCommand(): void {
    const promptNode = document.getElementById('chat-input') as HTMLInputElement;
    promptNode.value = "请细化模块";
  }

  /**
   * 清空会话ID
   */
  public clearConversationId(): void {
    const conversationIdInput = document.getElementById('conversation-id') as HTMLInputElement;
    conversationIdInput.value = '';
  }

  /**
   * 切换到模块设计模式
   */
  public switchToMode(): void {
    console.log('switch ai agent to module-design-mode');
    this.setDefaultUserCommand();
    this.clearConversationId();
  }
}
