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

  async mount(): Promise<void> {
    console.log('TechDocEditorActorLogic: 开始初始化编辑器...');
    
    // 初始化富文本编辑器（第一个Tab，默认激活）
    await this.initRichTextEditor();
    
    // 初始化HTML编辑器（第二个Tab，默认激活时才初始化）
    // 其他 Monaco 编辑器延迟初始化，等待Tab切换时再初始化
    setTimeout(() => {
      PrivateLogic.initMonacoEditor(this.mesh, this.runtime);
    }, 200);
    
    // 监听Tab切换，按需初始化Monaco编辑器
    this.setupTabSwitchListener();
    
    console.log('TechDocEditorActorLogic: 编辑器初始化设置完成');
  }

  // 监听Tab切换，按需初始化Monaco编辑器
  private setupTabSwitchListener(): void {
    // 使用 MutationObserver 监听 Tab 激活
    const observer = new MutationObserver(() => {
      // 检查各个Monaco编辑器容器是否可见，如果可见且未初始化则初始化
      this.tryInitMonacoEditors();
    });

    // 监听中部编辑器区域的变化
    const editorArea = document.querySelector('.editor-area');
    if (editorArea) {
      observer.observe(editorArea, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'aria-hidden']
      });
    }

    // 监听 Dockview 的 Tab 点击事件（直接方式）
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // 检查是否点击了 Tab
      if (target.closest('.tab')) {
        console.log('检测到 Tab 点击，尝试初始化编辑器');
        setTimeout(() => {
          this.tryInitMonacoEditors();
          this.relayoutAllMonacoEditors();
        }, 100);
      }
    });

    // 立即尝试初始化可见的编辑器
    setTimeout(() => this.tryInitMonacoEditors(), 500);
    
    // 定期检查（兜底方案，确保编辑器最终会被初始化）
    const checkInterval = setInterval(() => {
      this.tryInitMonacoEditors();
      
      // 如果所有编辑器都已初始化，停止检查
      if (this.runtime.data.techDocEditor && 
          this.runtime.data.techConstraintsEditor &&
          this.runtime.data.sourcePRDEditor &&
          this.runtime.data.parsedPRDEditor) {
        clearInterval(checkInterval);
        console.log('所有 Monaco 编辑器已初始化完成');
      }
    }, 2000);
  }

  // 重新布局所有已初始化的Monaco编辑器
  private relayoutAllMonacoEditors(): void {
    if (this.runtime.data.techDocEditor) {
      this.runtime.data.techDocEditor.layout();
    }
    if (this.runtime.data.techConstraintsEditor) {
      this.runtime.data.techConstraintsEditor.layout();
    }
    if (this.runtime.data.sourcePRDEditor) {
      this.runtime.data.sourcePRDEditor.layout();
    }
    if (this.runtime.data.parsedPRDEditor) {
      this.runtime.data.parsedPRDEditor.layout();
    }
  }

  // 尝试初始化所有未初始化的Monaco编辑器
  private tryInitMonacoEditors(): void {
    // HTML编辑器
    const htmlEditor = document.getElementById('html-editor');
    if (htmlEditor && !this.runtime.data.techDocEditor) {
      console.log('开始初始化 HTML 编辑器');
      PrivateLogic.initMonacoEditor(this.mesh, this.runtime);
    }

    // 技术约束编辑器
    const techConstraints = document.getElementById('tech-constraints-editor');
    if (techConstraints && !this.runtime.data.techConstraintsEditor) {
      console.log('开始初始化 技术约束文档 编辑器');
      PrivateLogic.initTechConstraintsEditor(this.mesh, this.runtime);
    }

    // PRD原始编辑器
    const sourcePRD = document.getElementById('source-prd-editor');
    if (sourcePRD && !this.runtime.data.sourcePRDEditor) {
      console.log('开始初始化 PRD-原始 编辑器');
      PrivateLogic.initSourcePRDEditor(this.mesh, this.runtime);
    }

    // PRD转换后编辑器
    const parsedPRD = document.getElementById('parsed-prd-editor');
    if (parsedPRD && !this.runtime.data.parsedPRDEditor) {
      console.log('开始初始化 PRD-转换后 编辑器');
      PrivateLogic.initParsedPRDEditor(this.mesh, this.runtime);
    }
  }

  // 初始化富文本编辑器
  private async initRichTextEditor(): Promise<void> {
    const container = document.getElementById('rich-text-editor-container');
    if (!container) {
      console.warn('rich-text-editor-container 未找到');
      return;
    }

    // 动态导入 Vue 和 TiptapEditorCapsule
    const { createApp, h, nextTick } = await import('vue');
    const { TiptapEditorCapsule } = await import('../../../../packages/tiptap-capsule/src/index');

    const app = createApp({
      data() {
        return {
          htmlContent: ''
        };
      },
      methods: {
        async setContent(htmlContent: string) {
          (this as any).htmlContent = htmlContent;
          await (this as any).$nextTick();
          const editor = (this as any).$refs.tiptapEditor;
          if (editor) {
            editor.setHTML(htmlContent);
            console.log('富文本编辑器内容已设置');
          }
        },
        getContent() {
          const editor = (this as any).$refs.tiptapEditor;
          return editor ? editor.getHTML() : '';
        }
      },
      render() {
        return h('div', { style: 'width: 100%; height: 100%; display: flex; flex-direction: column;' }, [
          h(TiptapEditorCapsule, {
            ref: 'tiptapEditor',
            modelValue: (this as any).htmlContent,
            'onUpdate:modelValue': (value: string) => {
              (this as any).htmlContent = value;
            },
            enableVueTextBtnDemo: false,
            enableBubbleMenu: true,
            editable: true,
            showToolbar: true,
            showOutput: false,
            heightMode: 'fixed',
            style: 'flex: 1; overflow: hidden;'
          })
        ]);
      }
    });

    const vm = app.mount(container);
    await nextTick();

    (window as any).richTextEditor = {
      setContent: (htmlContent: string) => (vm as any).setContent(htmlContent),
      getContent: () => (vm as any).getContent()
    };

    console.log('富文本编辑器初始化完成');
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
    console.log('getSourcePRDEditorContent 被调用');
    console.log('sourcePRDEditor 实例存在:', !!this.runtime.data.sourcePRDEditor);
    
    // 从Monaco编辑器实例获取最新内容
    if (this.runtime.data.sourcePRDEditor) {
      const content = this.runtime.data.sourcePRDEditor.getValue();
      console.log('从 Monaco 编辑器获取的内容长度:', content.length);
      console.log('内容预览 (前100字符):', content.substring(0, 100));
      
      // 同步到runtime.data
      this.runtime.data.sourcePRDContent = content;
      return content;
    }
    
    console.log('sourcePRDEditor 未初始化，返回 runtime 中的内容长度:', this.runtime.data.sourcePRDContent.length);
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