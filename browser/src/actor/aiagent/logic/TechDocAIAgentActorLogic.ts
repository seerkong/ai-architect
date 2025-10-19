import { AiWebArchitectMesh } from "../../mesh/AiWebArchitectMesh";
import { TechDocAIAgentPrivateLogic } from "./TechDocAIAgentPrivateLogic";
import { ProjectPushWsManager, WebSocketStatus, PushMessage } from "../../websocket/ProjectPushWsManager";
import { TechDocAIAgentActorApi } from "../contract/TechDocAiAgentActorApi";
import { TechDocAIAgentRuntime } from "../contract/TechDocAIAgentRuntime";
import { AiAgentMode, SSE_URL_RESET_INPUT_AND_INIT_MODULES, TechDesignSnapshotDsl } from "@shared/contract"
import { EmptyDesignDsl } from "@shared/sample/EmptyDesignDsl";

export class TechDocAIAgentActorLogic implements TechDocAIAgentActorApi {
  private runtime: TechDocAIAgentRuntime;
  private privateLogic: TechDocAIAgentPrivateLogic;
  private pushWsManager: ProjectPushWsManager;

  constructor(
    private mesh: AiWebArchitectMesh) {
    this.runtime = this.initRuntime();
    this.privateLogic = new TechDocAIAgentPrivateLogic(this.mesh, this.runtime, this);
    this.pushWsManager = new ProjectPushWsManager();
    this.setupWebSocketCallbacks();
  }

  async mount(): Promise<void> {
    console.log('TechDocAIAgentActorLogic: 开始初始化JSON可视化组件...');

    // 初始化3个JSON可视化组件
    await this.initJsonVisualizer('dsl');
    await this.initJsonVisualizer('conversation');
    await this.initJsonVisualizer('answer');

    console.log('TechDocAIAgentActorLogic: JSON可视化组件初始化完成');

    // 初始化聊天输出富文本编辑器
    await this.initChatOutputEditor();

    console.log('TechDocAIAgentActorLogic: 聊天输出编辑器初始化完成');
  }

  // 初始化JSON可视化组件
  private async initJsonVisualizer(type: 'dsl' | 'conversation' | 'answer'): Promise<void> {
    const mountEl = document.getElementById(`${type}-visualizer-mount`);
    if (!mountEl) {
      console.warn(`${type}-visualizer-mount 未找到`);
      return;
    }

    const app = (window as any).Vue.createApp({
      data() {
        return {
          data: null,
          isLoading: type === 'dsl'
        };
      },
      components: {
        ObjectVisualizer: (window as any).ObjectVisualizer.ObjectVisualizer
      },
      methods: {
        updateData(newData: any) {
          (this as any).data = newData;
          (this as any).isLoading = false;
        }
      },
      template: `
        <div style="height: 100%; padding: 8px; overflow: auto;">
          <div v-if="isLoading" style="text-align: center; padding: 10px; color: #888;">
            加载中...
          </div>
          <div v-else-if="data && Object.keys(data).length > 0">
            <ObjectVisualizer 
              :data="data" 
              :rootName="${type === 'dsl' ? '技术文档DSL' : type === 'conversation' ? '对话变更' : '回答变更'}"
              :expandOnCreatedAndUpdated="(path) => path.length <= 2"
            />
          </div>
          <div v-else style="text-align: center; padding: 10px; color: #999;">
            暂无数据
          </div>
        </div>
      `
    });

    const vm = app.mount(mountEl);

    // 暴露到全局
    const globalApp = (window as any).jsonVisualizerApp || {};
    if (type === 'dsl') {
      globalApp.updateDslData = (data: any) => vm.updateData(data);
    } else if (type === 'conversation') {
      globalApp.updateConversationMutation = (data: any) => vm.updateData(data);
    } else if (type === 'answer') {
      globalApp.updateAnswerMutation = (data: any) => vm.updateData(data);
    }
    (window as any).jsonVisualizerApp = globalApp;

    console.log(`JSON可视化组件已初始化: ${type}`);
  }

  // 初始化聊天输出富文本编辑器
  private async initChatOutputEditor(): Promise<void> {
    const container = document.getElementById('chat-output');
    if (!container) {
      console.warn('chat-output 容器未找到');
      return;
    }

    // 动态导入 Vue 和 TiptapEditorCapsule
    const { createApp, h, nextTick } = await import('vue');
    const { TiptapEditorCapsule } = await import('../../../../packages/tiptap-capsule/src/index');

    const app = createApp({
      data() {
        return {
          htmlContent: '<p style="color: #999; font-style: italic; margin: 0;">等待输入...</p>'
        };
      },
      methods: {
        async setContent(htmlContent: string) {
          (this as any).htmlContent = htmlContent;
          await (this as any).$nextTick();
          const editor = (this as any).$refs.tiptapEditor;
          if (editor) {
            editor.setHTML(htmlContent);
          }
        },
        async appendText(text: string) {
          const editor = (this as any).$refs.tiptapEditor;
          if (editor && editor.editor) {
            // 获取底层的Tiptap编辑器实例
            const tiptapEditor = editor.editor;

            // 将光标移到文档末尾，并插入文本（不创建新段落）
            tiptapEditor.chain().focus('end').insertContent(text).run();

            // 滚动到底部
            await (this as any).$nextTick();
            const editorElement = (this as any).$el.querySelector('.editor-wrapper');
            if (editorElement) {
              editorElement.scrollTop = editorElement.scrollHeight;
            }
          }
        },
        async appendContent(htmlContent: string) {
          const editor = (this as any).$refs.tiptapEditor;
          if (editor && editor.editor) {
            // 获取底层的Tiptap编辑器实例
            const tiptapEditor = editor.editor;

            // 在文档末尾插入HTML内容
            tiptapEditor.chain().focus('end').insertContent(htmlContent).run();

            // 滚动到底部
            await (this as any).$nextTick();
            const editorElement = (this as any).$el.querySelector('.editor-wrapper');
            if (editorElement) {
              editorElement.scrollTop = editorElement.scrollHeight;
            }
          }
        },
        async appendHardBreak() {
          const editor = (this as any).$refs.tiptapEditor;
          if (editor && editor.editor) {
            // 插入硬换行（不创建新段落）
            editor.editor.chain().focus('end').setHardBreak().run();
          }
        },
        async appendParagraph() {
          const editor = (this as any).$refs.tiptapEditor;
          if (editor && editor.editor) {
            // 创建新段落
            editor.editor.chain().focus('end').createParagraphNear().run();
          }
        },
        getContent() {
          const editor = (this as any).$refs.tiptapEditor;
          return editor ? editor.getHTML() : '';
        },
        async scrollToBottom() {
          // 滚动到底部
          await (this as any).$nextTick();
          const editorElement = (this as any).$el?.querySelector('.editor-wrapper');
          if (editorElement) {
            editorElement.scrollTop = editorElement.scrollHeight;
          }
        }
      },
      render() {
        return h('div', {
          style: 'width: 100%; height: 100%; display: flex; flex-direction: column;',
          class: 'chat-output-editor-container'
        }, [
          h(TiptapEditorCapsule, {
            ref: 'tiptapEditor',
            modelValue: (this as any).htmlContent,
            'onUpdate:modelValue': (value: string) => {
              (this as any).htmlContent = value;
            },
            enableVueTextBtnDemo: false,
            enableBubbleMenu: false,
            editable: false, // 设置为只读模式
            showToolbar: false, // 隐藏工具栏
            showOutput: false,
            heightMode: 'fixed',
            style: 'flex: 1; overflow: hidden;'
          })
        ]);
      }
    });

    const vm = app.mount(container);
    await nextTick();

    // 保存编辑器实例到 runtime
    this.runtime.data.chatOutputEditor = {
      get editor() {
        // 动态获取底层的 Tiptap 编辑器实例
        const tiptapEditor = (vm as any).$refs?.tiptapEditor;
        return tiptapEditor?.editor || null;
      },
      setContent: (htmlContent: string) => (vm as any).setContent(htmlContent),
      appendText: (text: string) => (vm as any).appendText(text),
      appendContent: (htmlContent: string) => (vm as any).appendContent(htmlContent),
      appendHardBreak: () => (vm as any).appendHardBreak(),
      appendParagraph: () => (vm as any).appendParagraph(),
      getContent: () => (vm as any).getContent(),
      scrollToBottom: () => (vm as any).scrollToBottom()
    };

    // 也暴露到全局对象（可选，方便调试）
    (window as any).chatOutputEditor = this.runtime.data.chatOutputEditor;

    console.log('聊天输出富文本编辑器已初始化');
  }

  getTechDocDsl(): TechDesignSnapshotDsl {
    return this.runtime.data.techDocDsl;
  }

  initRuntime(): TechDocAIAgentRuntime {
    return {
      data: {
        chatReader: null,
        currentSSEUrl: SSE_URL_RESET_INPUT_AND_INIT_MODULES,
        currentAiAgentMode: AiAgentMode.ResetInputAndInitModules,
        techDocDsl: EmptyDesignDsl,
        conversationMutation: null,
        answerMutation: null,
        suggestion: [],
        chatOutputEditor: null
      },
    };
  }

  /**
   * 设置WebSocket回调
   */
  private setupWebSocketCallbacks(): void {
    this.pushWsManager.setOnStatusChange((status: WebSocketStatus) => {
      this.updateWebSocketStatus(status);
    });

    this.pushWsManager.setOnMessage((message: PushMessage) => {
      this.handleWebSocketMessage(message);
    });

    this.pushWsManager.setOnError((error: Error) => {
      console.error('WebSocket推送错误:', error);
      this.updateWebSocketStatus(WebSocketStatus.ERROR);
    });
  }

  /**
   * 处理WebSocket推送消息
   */
  private handleWebSocketMessage(message: PushMessage): void {
    console.log('收到WebSocket推送消息:', message);

    // 根据消息类型处理
    switch (message.event) {
      case 'welcome':
        console.log('WebSocket连接已建立');
        break;
      case 'heartbeat':
        // 心跳消息，无需特殊处理
        break;
      case 'pong':
        console.log('收到pong响应');
        break;
      case 'start':
      case 'result':
      case 'done':
        // 这些是SSE推送的消息，可以在这里处理或转发给其他组件
        this.handleSSEPushMessage(message);
        break;
      default:
        console.log('未知的WebSocket消息类型:', message.event);
    }
  }

  /**
   * 处理SSE推送消息
   */
  private handleSSEPushMessage(message: PushMessage): void {
    // 这里可以将WebSocket推送的消息转发给聊天输出或其他UI组件
    const chatEditor = this.runtime.data.chatOutputEditor;
    if (chatEditor && message.event) {
      const timestamp = new Date().toLocaleTimeString();
      const content = message.content || '';
      const data = message.data ? JSON.stringify(message.data, null, 2) : '';

      let html = `<p style="color: #007acc; font-weight: bold;">[${timestamp}] WebSocket推送 - ${message.event}</p>`;
      if (content) {
        html += `<p>内容: ${this.escapeHtml(content)}</p>`;
      }
      if (data) {
        html += `<pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto;"><code>${this.escapeHtml(data)}</code></pre>`;
      }

      chatEditor.appendContent(html);
    }
  }

  /**
   * HTML转义辅助函数
   */
  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 更新WebSocket连接状态显示
   */
  private updateWebSocketStatus(status: WebSocketStatus): void {
    const projectKeyInput = document.getElementById('project-key') as HTMLInputElement;
    const updateBtn = document.getElementById('update-websocket') as HTMLButtonElement;

    if (updateBtn) {
      switch (status) {
        case WebSocketStatus.CONNECTING:
          updateBtn.textContent = '连接中...';
          updateBtn.disabled = true;
          break;
        case WebSocketStatus.CONNECTED:
          updateBtn.textContent = '已连接';
          updateBtn.disabled = false;
          updateBtn.style.background = '#28a745';
          break;
        case WebSocketStatus.DISCONNECTED:
          updateBtn.textContent = '更新';
          updateBtn.disabled = false;
          updateBtn.style.background = '#6c757d';
          break;
        case WebSocketStatus.ERROR:
          updateBtn.textContent = '连接错误';
          updateBtn.disabled = false;
          updateBtn.style.background = '#dc3545';
          break;
      }
    }
  }

  /**
   * 从URL参数获取projectKey并自动填充
   */
  private initFromUrlParams(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const projectKey = urlParams.get('projectKey');

    if (projectKey) {
      const projectKeyInput = document.getElementById('project-key') as HTMLInputElement;
      if (projectKeyInput) {
        projectKeyInput.value = projectKey;
        // 自动建立WebSocket连接
        this.connectWebSocket(projectKey);
      }
    }
  }

  /**
   * 建立WebSocket连接
   */
  private connectWebSocket(projectKey: string): void {
    if (projectKey.trim()) {
      this.pushWsManager.connect(projectKey);
    }
  }

  async connect(): Promise<void> {
    let that = this;

    // 从URL参数初始化
    this.initFromUrlParams();

    // 绑定WebSocket更新按钮
    const updateWebSocketBtn = document.getElementById('update-websocket') as HTMLButtonElement;
    updateWebSocketBtn.onclick = () => {
      const projectKeyInput = document.getElementById('project-key') as HTMLInputElement;
      const projectKey = projectKeyInput.value.trim();
      if (projectKey) {
        that.connectWebSocket(projectKey);
      } else {
        alert('请输入项目key');
      }
    };

    // 绑定聊天功能事件
    const startChatBtn = document.getElementById('startChatBtn') as HTMLButtonElement;
    startChatBtn.onclick = () => that.privateLogic.startChat();

    const stopChatBtn = document.getElementById('stopChatBtn') as HTMLButtonElement;
    stopChatBtn.onclick = () => that.privateLogic.stopChat();

    // 支持回车键发送
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !startChatBtn.disabled) {
        that.privateLogic.startChat();
      }
    });

    // 绑定下拉选框事件
    const modeSwitch = document.getElementById('mode-switch') as HTMLSelectElement;
    if (modeSwitch) {
      modeSwitch.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
          switch (selectedValue) {
            case AiAgentMode.ResetInputAndInitModules:
              that.privateLogic.onResetInputAndInitModules();
              break;
            case AiAgentMode.ModuleDesign:
              that.privateLogic.onModuleDesign();
              break;
          }
          // 模式切换后不重置下拉选框，保持当前选择
        }
      });
    }

    // 绑定操作按钮事件
    const acceptChangesBtn = document.getElementById('accept-changes-btn') as HTMLButtonElement;
    if (acceptChangesBtn) {
      acceptChangesBtn.onclick = () => that.privateLogic.acceptChanges();
    }

    const updateDetailBtn = document.getElementById('update-detail-btn') as HTMLButtonElement;
    if (updateDetailBtn) {
      updateDetailBtn.onclick = () => that.privateLogic.updateDetail();
    }

  }
}