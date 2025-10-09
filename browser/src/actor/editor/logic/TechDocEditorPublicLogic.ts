import { TechDocEditorRuntime } from "../contract/EditorRuntime";
import * as PrivateLogic from "./TechDocEditorPrivateLogic";
import { AiWebArchitectMesh } from "../../mesh/AiWebArchitectMesh";

export function initRuntime(mesh: AiWebArchitectMesh): TechDocEditorRuntime {
  return {
    data: {
      techDocEditor: null,
      techDocHtmlContent: '',

      // 新的Monaco编辑器实例
      techConstraintsEditor: null,
      sourcePRDEditor: null,
      parsedPRDEditor: null,

      // 编辑器内容
      techConstraintsContent: '',
      sourcePRDContent: '',
      transformedPRDContent: ''
    }
  }
}

export async function connect(
  mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime): Promise<void> {
  
    const downloadTechDocHtmlBtn = <HTMLButtonElement>document.getElementById('export-html-menu');
  if (downloadTechDocHtmlBtn) {
    downloadTechDocHtmlBtn.onclick = () => PrivateLogic.downloadTechDocHtml(
      mesh, runtime
    );
  }

  initTabs(mesh, runtime);

  // 页面加载时立即初始化所有Monaco Editor
  setTimeout(async () => {
    await PrivateLogic.initMonacoEditor(mesh, runtime);
    await PrivateLogic.initTechConstraintsEditor(mesh, runtime);
    await PrivateLogic.initSourcePRDEditor(mesh, runtime);
    await PrivateLogic.initParsedPRDEditor(mesh, runtime);
  }, 500); // 给DOM一些时间完全加载
}



// ===== Tab切换功能 =====
export function initTabs(
  mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // 移除所有active类
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // 添加active类到当前按钮和对应内容
      button.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // 根据tab类型进行特殊处理
      if (targetTab === 'html-editor') {
        // Monaco Editor已经在页面加载时初始化，这里只需要确保布局正确
        setTimeout(() => {
          PrivateLogic.forceMonacoLayout(mesh, runtime);
        }, 100);
      } else if (targetTab === 'tech-constraints') {
        // 技术约束文档编辑器布局
        setTimeout(() => {
          PrivateLogic.forceTechConstraintsLayout(mesh, runtime);
        }, 100);
      } else if (targetTab === 'source-prd') {
        // 原始PRD编辑器布局
        setTimeout(() => {
          PrivateLogic.forceSourcePRDLayout(mesh, runtime);
        }, 100);
      } else if (targetTab === 'parsed-prd') {
        // 转换后PRD编辑器布局
        setTimeout(() => {
          PrivateLogic.forceParsedPRDLayout(mesh, runtime);
        }, 100);
      }
      // else if (targetTab === 'rich-text-editor') {
      //   // 延迟初始化，确保DOM已更新
      //   setTimeout(() => {
      //     PrivateLogic.initRichTextEditor(mesh, runtime);
      //   }, 100);
      // }
    });
  });
}
