import * as monaco from 'monaco-editor';

export interface TechDocEditorRuntime {
  data: EditorData;
}

export interface EditorData {
  // Monaco编辑器实例
  techDocEditor: monaco.editor.IStandaloneCodeEditor | null;
  techConstraintsEditor: monaco.editor.IStandaloneCodeEditor | null;
  sourcePRDEditor: monaco.editor.IStandaloneCodeEditor | null;
  parsedPRDEditor: monaco.editor.IStandaloneCodeEditor | null;

  // 编辑器内容

  // 技术文档html格式
  techDocHtmlContent: string;
  // 技术约束内容
  techConstraintsContent: string;
  // 原始PRD内容
  sourcePRDContent: string;
  // 变化后后PRD内容
  transformedPRDContent: string;
  
  // 初始化标志，防止重复初始化
  initializingTechDocEditor?: boolean;
  initializingTechConstraintsEditor?: boolean;
  initializingSourcePRDEditor?: boolean;
  initializingParsedPRDEditor?: boolean;
}