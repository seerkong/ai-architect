// 全局类型声明
declare global {
  interface Window {
    jsonVisualizerApp?: {
      app: any;
      updateDslData: (data: any) => void;
      updateConversationMutation: (data: any) => void;
      updateAnswerMutation: (data: any) => void;
    };
    richTextEditor?: {
      setContent: (htmlContent: string) => void;
      getContent: () => string;
    };
  }
}

export { };
