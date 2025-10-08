import { TechDesignSnapshotDsl } from "@shared/contract";
import { AiWebArchitectMesh } from "../../../mesh/AiWebArchitectMesh";
import { TechDocAIAgentRuntime } from "../../contract/TechDocAIAgentRuntime";

import { dslToOnlyProcedureGrouped } from "../TechDesignDslTransform";
import * as ejs from "ejs";

export async function updateViewsByDslSnapshot(
  mesh: AiWebArchitectMesh,
  runtime: TechDocAIAgentRuntime,
  dslSnapshot: TechDesignSnapshotDsl
) {
  // 转换并渲染技术文档内容
  let htmlContent = await onlyProcGroupedTransformAndRenderDoc(dslSnapshot);
  runtime.data.techDocDsl = dslSnapshot;

  // 更新技术文档HTML编辑器内容
  mesh.TechDocEditorActorApi.setTechDocEditorContent(htmlContent);

  // 更新富文本编辑器内容
  await updateRichTextEditor(htmlContent);

  // 更新JSON可视化组件
  await updateJsonVisualizer(dslSnapshot);
}

export async function updateViewByDslMutation(mesh: AiWebArchitectMesh,
  runtime: TechDocAIAgentRuntime) {

  // 更新对话变更可视化
  if (runtime.data.conversationMutation) {
    await updateConversationMutationVisualizer(runtime.data.conversationMutation);
  }

  // 更新回答变更可视化
  if (runtime.data.answerMutation) {
    await updateAnswerMutationVisualizer(runtime.data.answerMutation);
  }
}

// ===== JSON可视化组件更新 =====
export async function updateJsonVisualizer(dslData: any) {
  // 检查Vue应用是否已加载
  if (window.jsonVisualizerApp) {
    try {
      // 更新Vue组件中的数据
      window.jsonVisualizerApp.updateDslData(dslData);
      console.log('JSON可视化组件已更新');
    } catch (error) {
      console.error('更新JSON可视化组件失败:', error);
    }
  } else {
    console.warn('JSON可视化组件尚未加载');
  }
}

export async function updateConversationMutationVisualizer(conversationMutation: any) {
  // 检查Vue应用是否已加载
  if (window.jsonVisualizerApp && window.jsonVisualizerApp.updateConversationMutation) {
    try {
      // 更新对话变更可视化组件中的数据
      window.jsonVisualizerApp.updateConversationMutation(conversationMutation);
      console.log('对话变更可视化组件已更新');
    } catch (error) {
      console.error('更新对话变更可视化组件失败:', error);
    }
  } else {
    console.warn('对话变更可视化组件尚未加载');
  }
}

export async function updateAnswerMutationVisualizer(answerMutation: any) {
  // 检查Vue应用是否已加载
  if (window.jsonVisualizerApp && window.jsonVisualizerApp.updateAnswerMutation) {
    try {
      // 更新回答变更可视化组件中的数据
      window.jsonVisualizerApp.updateAnswerMutation(answerMutation);
      console.log('回答变更可视化组件已更新');
    } catch (error) {
      console.error('更新回答变更可视化组件失败:', error);
    }
  } else {
    console.warn('回答变更可视化组件尚未加载');
  }
}

export async function updateRichTextEditor(htmlContent: string) {
  // 检查富文本编辑器是否已加载
  if (window.richTextEditor && window.richTextEditor.setContent) {
    try {
      // 转换HTML内容，只保留body标签下的非script部分
      const convertedContent = convertHtmlForRichTextEditor(htmlContent);
      // 更新富文本编辑器内容
      window.richTextEditor.setContent(convertedContent);
      console.log('富文本编辑器已更新');
    } catch (error) {
      console.error('更新富文本编辑器失败:', error);
    }
  } else {
    console.warn('富文本编辑器尚未加载');
  }
}

/**
 * 转换HTML内容，只保留body标签下的非script部分
 * @param htmlContent 完整的HTML内容
 * @returns 转换后的HTML内容
 */
export function convertHtmlForRichTextEditor(htmlContent: string): string {
  try {
    // 创建临时DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 查找body元素
    const bodyElement = tempDiv.querySelector('body');
    if (!bodyElement) {
      console.warn('未找到body元素，返回原始内容');
      return htmlContent;
    }

    // 移除所有script标签
    const scripts = bodyElement.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // 获取body内容的HTML字符串
    let bodyContent = bodyElement.innerHTML;

    // 清理可能的空行和多余空白
    bodyContent = bodyContent.replace(/^\s*\n\s*/gm, '').trim();

    console.log('HTML内容转换完成，原始长度:', htmlContent.length, '转换后长度:', bodyContent.length);
    return bodyContent;

  } catch (error) {
    console.error('HTML内容转换失败:', error);
    // 如果转换失败，返回原始内容
    return htmlContent;
  }
}

export async function onlyProcGroupedTransformAndRenderDoc(
  jsonData: TechDesignSnapshotDsl
): Promise<string> {
  try {
    // 使用dslToOnlyProcedureGrouped函数进行转换
    const groupedData = dslToOnlyProcedureGrouped(jsonData);

    console.log('DSL转换完成,groupedData：', groupedData);

    // 获取EJS模板内容
    const templateResponse = await fetch('/doc_html_proc_grouped.ejs');
    // console.log('templateResponse', templateResponse);
    if (!templateResponse.ok) {
      throw new Error('无法加载EJS模板');
    }
    const templateString = await templateResponse.text();

    // 使用EJS渲染模板
    const htmlContent = ejs.render(templateString, groupedData);

    // console.log(htmlContent);
    return htmlContent;

  } catch (error) {
    console.error('DSL转换失败:', error);
    alert('转换失败: ' + (error instanceof Error ? error.message : '未知错误'));
    throw error;
  }
}