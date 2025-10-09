export { default as TiptapEditorCapsule } from './TiptapEditorCapsule.vue'

export interface TiptapEditorCapsuleProps {
  modelValue?: string
  enableVueTextBtnDemo?: boolean
  onHtmlPresentChanged?: (html: string) => void
  onJsonPresentChanged?: (json: any) => void
  heightMode?: 'auto' | 'fixed' // 'auto' 自动撑开 | 'fixed' 固定高度可滚动
}

export interface TiptapEditorCapsuleRef {
  getHTML: () => string
  getJSON: () => any
  setHTML: (html: string) => void
  setJSON: (json: any) => void
  editor: any
}
