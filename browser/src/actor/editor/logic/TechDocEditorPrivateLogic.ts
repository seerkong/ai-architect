import { TechDocEditorRuntime } from "../contract/EditorRuntime";
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/loader';
import { formatHtml } from "../helper/HtmlHelper";
import { AiWebArchitectMesh } from "../../mesh/AiWebArchitectMesh";


// ===== 下载技术文档HTML文件功能 =====
export function downloadTechDocHtml(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  try {
    const htmlContent = runtime.data.techDocHtmlContent;

    // 创建Blob对象
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `技术文档_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);

    console.log('技术文档HTML文件下载成功');

  } catch (error) {
    console.error('下载技术文档HTML文件失败:', error);
    alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}


// ===== Monaco Editor初始化 =====
export async function initMonacoEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  if (runtime.data.techDocEditor) {
    return; // 已经初始化过了
  }
  
  if (runtime.data.initializingTechDocEditor) {
    console.log('HTML编辑器正在初始化中，跳过');
    return;
  }

  const editorElement = document.getElementById('html-editor');
  if (!editorElement) return;

  console.log('initMonacoEditor enter');
  runtime.data.initializingTechDocEditor = true;
  
  let currentHtmlContent = runtime.data.techDocHtmlContent;
  let monacoEditor: any = null;

  // 确保容器有明确的高度
  editorElement.style.height = '100%';
  editorElement.style.minHeight = '300px';

  try {
    // 使用loader来加载Monaco Editor
    const monaco = await loader.init();

    monacoEditor = monaco.editor.create(editorElement, {
      value: currentHtmlContent,
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on'
    });
    runtime.data.techDocEditor = monacoEditor;
    runtime.data.initializingTechDocEditor = false; // 清除初始化标志

    // 监听内容变化
    monacoEditor.onDidChangeModelContent(() => {
      if (monacoEditor) {
        currentHtmlContent = monacoEditor.getValue();
      }
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (monacoEditor) {
        monacoEditor.layout();
      }
    });

    // 初始布局
    setTimeout(() => {
      if (monacoEditor) {
        monacoEditor.layout();
      }
    }, 100);
  } catch (error) {
    runtime.data.initializingTechDocEditor = false; // 出错时也要清除标志
    console.error('Failed to initialize Monaco Editor:', error);
  }
}



// ===== 富文本编辑器初始化 =====
export function initRichTextEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  // const editorElement = document.getElementById('rich-text-editor');
  // if (!editorElement) return;

  // // 清空容器
  // editorElement.innerHTML = '';

  // // 确保容器有正确的高度和样式
  // editorElement.style.height = '100%';
  // editorElement.style.minHeight = '300px';
  // editorElement.style.overflow = 'auto';

  // 添加 富文本 编辑器
  // editorElement.appendChild(affineEditor);
}



// ===== 更新Monaco编辑器内容 =====
export async function updateMonacoEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime, htmlContent: string) {
  let monacoEditor = runtime.data.techDocEditor;
  let currentHtmlContent = runtime.data.techDocHtmlContent;
  currentHtmlContent = htmlContent;

  if (monacoEditor) {
    // 如果编辑器已经初始化，直接更新内容
    monacoEditor.setValue(htmlContent);
    // 强制重新布局
    setTimeout(() => {
      if (monacoEditor) {
        monacoEditor.layout();
      }
    }, 100);
  } else {
    // 如果编辑器还没有初始化，先初始化再更新内容
    await initMonacoEditor(mesh, runtime);
    // 初始化后再次尝试更新
    monacoEditor = runtime.data.techDocEditor;
    if (monacoEditor) {
      monacoEditor.setValue(htmlContent);
      setTimeout(() => {
        if (monacoEditor) {
          monacoEditor.layout();
        }
      }, 100);
    }
  }
}

// ===== 强制重新布局Monaco编辑器 =====
export function forceMonacoLayout(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  let monacoEditor = runtime.data.techDocEditor;
  if (monacoEditor) {
    setTimeout(() => {
      if (monacoEditor) {
        monacoEditor.layout();
      }
    }, 100);
  }
}

export async function importHtmlToDoc(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  const dataInput = <HTMLTextAreaElement>document.getElementById('data-input');
  const htmlContent = dataInput.value.trim();
  await importHtmlToEditor(mesh, runtime, htmlContent);
}

export async function importHtmlToEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime, htmlContent: string) {

  // TODO
}

// ===== 技术约束文档编辑器初始化 =====
export async function initTechConstraintsEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  if (runtime.data.techConstraintsEditor) {
    return; // 已经初始化过了
  }
  
  if (runtime.data.initializingTechConstraintsEditor) {
    console.log('技术约束编辑器正在初始化中，跳过');
    return;
  }

  const editorElement = document.getElementById('tech-constraints-editor');
  if (!editorElement) return;

  console.log('initTechConstraintsEditor enter');
  runtime.data.initializingTechConstraintsEditor = true;
  
  let techConstraintsEditor: any = null;

  // 确保容器有明确的高度
  editorElement.style.height = '100%';
  editorElement.style.minHeight = '300px';

  try {
    // 使用loader来加载Monaco Editor
    const monaco = await loader.init();

    techConstraintsEditor = monaco.editor.create(editorElement, {
      value: runtime.data.techConstraintsContent,
      language: 'markdown',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on'
    });
    runtime.data.techConstraintsEditor = techConstraintsEditor;
    runtime.data.initializingTechConstraintsEditor = false; // 清除初始化标志

    // 监听内容变化
    techConstraintsEditor.onDidChangeModelContent(() => {
      if (techConstraintsEditor) {
        runtime.data.techConstraintsContent = techConstraintsEditor.getValue();
      }
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (techConstraintsEditor) {
        techConstraintsEditor.layout();
      }
    });

    // 初始布局
    setTimeout(() => {
      if (techConstraintsEditor) {
        techConstraintsEditor.layout();
      }
    }, 100);
  } catch (error) {
    runtime.data.initializingTechConstraintsEditor = false; // 出错时也要清除标志
    console.error('Failed to initialize Tech Constraints Editor:', error);
  }
}

// ===== 原始PRD编辑器初始化 =====
export async function initSourcePRDEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  // 检查是否已经初始化或正在初始化
  if (runtime.data.sourcePRDEditor) {
    console.log('PRD-原始编辑器已经初始化过了，跳过');
    return;
  }
  
  if (runtime.data.initializingSourcePRDEditor) {
    console.log('PRD-原始编辑器正在初始化中，跳过');
    return;
  }

  const editorElement = document.getElementById('source-prd-editor');
  if (!editorElement) {
    console.error('source-prd-editor 容器未找到！');
    return;
  }

  console.log('initSourcePRDEditor enter，容器:', editorElement);
  
  // 设置正在初始化标志
  runtime.data.initializingSourcePRDEditor = true;
  
  let sourcePRDEditor: any = null;

  // 确保容器有明确的高度
  editorElement.style.height = '100%';
  editorElement.style.minHeight = '300px';

  try {
    // 使用loader来加载Monaco Editor
    const monaco = await loader.init();

    sourcePRDEditor = monaco.editor.create(editorElement, {
      value: runtime.data.sourcePRDContent,
      language: 'markdown',
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on'
    });
    runtime.data.sourcePRDEditor = sourcePRDEditor;
    runtime.data.initializingSourcePRDEditor = false; // 清除初始化标志
    
    console.log('PRD-原始编辑器已创建并保存到 runtime.data.sourcePRDEditor');
    console.log('初始内容长度:', sourcePRDEditor.getValue().length);

    // 监听内容变化
    sourcePRDEditor.onDidChangeModelContent(() => {
      if (sourcePRDEditor) {
        const newContent = sourcePRDEditor.getValue();
        runtime.data.sourcePRDContent = newContent;
        console.log('PRD-原始编辑器内容已变化，新长度:', newContent.length);
      }
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (sourcePRDEditor) {
        sourcePRDEditor.layout();
      }
    });

    // 初始布局
    setTimeout(() => {
      if (sourcePRDEditor) {
        sourcePRDEditor.layout();
      }
    }, 100);
  } catch (error) {
    runtime.data.initializingSourcePRDEditor = false; // 出错时也要清除标志
    console.error('Failed to initialize Source PRD Editor:', error);
  }
}

// ===== 转换后PRD编辑器初始化 =====
export async function initParsedPRDEditor(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  if (runtime.data.parsedPRDEditor) {
    return; // 已经初始化过了
  }
  
  if (runtime.data.initializingParsedPRDEditor) {
    console.log('PRD-转换后编辑器正在初始化中，跳过');
    return;
  }

  const editorElement = document.getElementById('parsed-prd-editor');
  if (!editorElement) return;

  console.log('initParsedPRDEditor enter');
  runtime.data.initializingParsedPRDEditor = true;
  
  let parsedPRDEditor: any = null;

  // 确保容器有明确的高度
  editorElement.style.height = '100%';
  editorElement.style.minHeight = '300px';

  try {
    // 使用loader来加载Monaco Editor
    const monaco = await loader.init();

    parsedPRDEditor = monaco.editor.create(editorElement, {
      value: runtime.data.transformedPRDContent,
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on'
    });
    runtime.data.parsedPRDEditor = parsedPRDEditor;
    runtime.data.initializingParsedPRDEditor = false; // 清除初始化标志

    // 监听内容变化
    parsedPRDEditor.onDidChangeModelContent(() => {
      if (parsedPRDEditor) {
        runtime.data.transformedPRDContent = parsedPRDEditor.getValue();
      }
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (parsedPRDEditor) {
        parsedPRDEditor.layout();
      }
    });

    // 初始布局
    setTimeout(() => {
      if (parsedPRDEditor) {
        parsedPRDEditor.layout();
      }
    }, 100);
  } catch (error) {
    runtime.data.initializingParsedPRDEditor = false; // 出错时也要清除标志
    console.error('Failed to initialize Parsed PRD Editor:', error);
  }
}

// ===== 强制重新布局函数 =====
export function forceTechConstraintsLayout(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  let techConstraintsEditor = runtime.data.techConstraintsEditor;
  if (techConstraintsEditor) {
    setTimeout(() => {
      if (techConstraintsEditor) {
        techConstraintsEditor.layout();
      }
    }, 100);
  }
}

export function forceSourcePRDLayout(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  let sourcePRDEditor = runtime.data.sourcePRDEditor;
  if (sourcePRDEditor) {
    setTimeout(() => {
      if (sourcePRDEditor) {
        sourcePRDEditor.layout();
      }
    }, 100);
  }
}

export function forceParsedPRDLayout(mesh: AiWebArchitectMesh, runtime: TechDocEditorRuntime) {
  let parsedPRDEditor = runtime.data.parsedPRDEditor;
  if (parsedPRDEditor) {
    setTimeout(() => {
      if (parsedPRDEditor) {
        parsedPRDEditor.layout();
      }
    }, 100);
  }
}
