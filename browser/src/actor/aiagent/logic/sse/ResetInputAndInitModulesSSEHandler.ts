import { BaseSSEHandler, BaseSSERequest } from "./BaseSSEHandler";
import { updateViewByDslMutation, updateViewsByDslSnapshot } from "../common/DslSnapshotMutationHelper";
import { ResetInputAndInitModulesRequest, SSE_URL_RESET_INPUT_AND_INIT_MODULES, TechDesignSnapshotDsl } from "@shared/contract";

/**
 * 重置需求文档和技术约束文档, 并初始化模块的SSE处理器
 */
export class ResetInputAndInitModulesSSEHandler extends BaseSSEHandler {

  protected getSSEUrl(): string {
    return SSE_URL_RESET_INPUT_AND_INIT_MODULES;
  }

  protected buildRequestData(userCommand: string, projectKey: string): ResetInputAndInitModulesRequest {
    // 从编辑器获取内容
    const prdContent = this.mesh.TechDocEditorActorApi.getSourcePRDEditorContent();
    const techConstraintsContent = this.mesh.TechDocEditorActorApi.getTechConstraintsEditorContent();

    // 从表单获取链接（如果有的话）
    const prdLinkInput = document.getElementById('prd-link') as HTMLInputElement;
    const techConstraintsLinkInput = document.getElementById('tech-constraints-link') as HTMLInputElement;

    let cookie = "enabledapps.uploader=0; apdid=5cc069cb-eaf8-4156-b01b-844ca3d18cfbd19bf09af3b18a7169ca812a65ae0083:1756821226:1; weblogger_did=web_17146080670B2A19; ks_sso_gray_cookie=1; _did=web_937853007868EF31; hdige2wqwoino=tRp32drHM7E83MRmc4SdwabBRbrBBAR8cadf2705; kwfv1=PnGU+9+Y8008S+nH0U+0mjPf8fP08f+98f+nLlwnrIP9P9G98YPf8jPBQSweS0+nr9G0mD8B+fP/L98/qlPe4f8BPM8ePlPfzf+AY08fLI+eZFP/W980LU+0pSPeQf+BrUw/c78B+D+BHFP/qFGAWAPnLIP9rAPfHA+/YYwBrAw/H=; ksCorpDeviceid=c79fb73e-b570-4ff8-a374-ec40a3e16fa8; accessproxy_session=9d42fe88-bda3-4e9b-af30-e1c2acb8ec4d; idp_theme_change_identification=undefined; KXID=MiOlWvfVFnlMLsDP7OzSMqnFTBj4t9lwOy9YPuVMCnRnW2OYcgoQEmcd8dOv04P6N-7_XlHBUovq7BIn8IDLVui31pikX7NfXxtw7b654dRCFmFJMQ18SXP7wZqHxmW-Irg70EWe0RhfUWqPyd9jhe7HRbnuZboFpzY9Dn-uJ4k=; _dkm=0; docs-gray-wiki-fe=%7B%22type%22%3A%22reader%22%2C%22grayInfo%22%3A%7B%22html%22%3A%2272164300.html%22%7D%2C%22desc%22%3A%22%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E5%AE%B9%E7%81%BE%22%2C%22demandId%22%3Anull%7D; docs-gray-vodka=%7B%22type%22%3A%22reader%22%2C%22grayInfo%22%3A%7B%22html%22%3A%2272373737.html%22%7D%2C%22desc%22%3A%22%E6%BC%94%E7%A4%BA%E6%A8%A1%E5%BC%8F%20bugfix%22%2C%22demandId%22%3Anull%7D; _ga=GA1.1.1913556648.1756958443; _ga_F6CM1VE30P=GS2.1.s1758294220$o12$g0$t1758294220$j60$l0$h0; ip_subnet=100; ehid=8fTTQ-souUdVfapWnI6fpjrF88301SYLlVTRu; lbcookie=2";

    return {
      projectKey,
      prdContent,
      prdLink: prdLinkInput?.value.trim() || '',
      techConstraintsContent,
      techConstraintsLink: techConstraintsLinkInput?.value.trim() || '',
      enablePrdTransform: true, // 是否启用需求文档转换
      cookie
    };
  }

  protected async handleResultMessage(message: any): Promise<void> {
    console.log('ResetPrdAndTechConstraints result:', message.data);

    // 处理模块初始化结果
    if (message.data) {
      console.log('处理模块初始化结果数据:', message.data);

      // 可以在这里处理模块初始化后的数据
      // 例如：更新DSL快照、渲染技术文档等
      // 更新技术文档DSL快照到视图中
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
    promptNode.value = "";
  }

  /**
   * 切换到重置模式
   */
  public switchToMode(): void {
    console.log('switch ai agent to reset prd and tech constraints mode');
    this.setDefaultUserCommand();
  }
}
