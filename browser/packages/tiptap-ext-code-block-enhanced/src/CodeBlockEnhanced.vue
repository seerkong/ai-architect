<template>
  <node-view-wrapper>
    <div class="tiptap-node-wrapper">
      <!-- 头部 -->
      <div class="tiptap-node-header">
        <div class="tiptap-node-left">
          <select 
            :value="currentLanguage" 
            @change="handleLanguageChange"
            class="tiptap-node-button"
          >
            <option 
              v-for="lang in supportedLanguages" 
              :key="lang.value" 
              :value="lang.value"
            >
              {{ lang.label }}
            </option>
          </select>
        </div>
        <div class="tiptap-node-right">
          <button @click="toggleCollapse" class="tiptap-action-button" :title="isCollapsed ? '展开代码' : '折叠代码'">
            <svg v-if="!isCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
          <button @click="copyCode" class="tiptap-action-button" title="复制代码">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
          </button>
          <button @click="deleteCodeBlock" class="tiptap-action-button tiptap-delete-button" title="删除代码块">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="tiptap-node-content" v-show="!isCollapsed">
        <node-view-content 
          class="code-block-text" 
          :class="`language-${currentLanguage}`"
        />
      </div>
      
      <!-- 折叠状态提示 -->
      <div class="code-block-collapsed" v-show="isCollapsed">
        <span class="collapsed-text">代码已折叠 ({{ lineCount }} 行)</span>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    updateAttributes: {
      type: Function,
      required: true,
    },
    editor: {
      type: Object,
      required: true,
    },
    deleteNode: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      supportedLanguages: [
        { value: 'text', label: '纯文本' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'swift', label: 'Swift' },
        { value: 'kotlin', label: 'Kotlin' },
        { value: 'scala', label: 'Scala' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'less', label: 'Less' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'sql', label: 'SQL' },
        { value: 'bash', label: 'Bash' },
        { value: 'powershell', label: 'PowerShell' },
        { value: 'dockerfile', label: 'Dockerfile' },
        { value: 'nginx', label: 'Nginx' },
        { value: 'apache', label: 'Apache' },
        { value: 'vim', label: 'Vim' },
        { value: 'diff', label: 'Diff' },
        { value: 'log', label: 'Log' },
      ],
    }
  },
  computed: {
    currentLanguage() {
      return this.node.attrs.language || 'text'
    },
    isCollapsed() {
      return this.node.attrs.collapsed || false
    },
    lineCount() {
      const text = this.node.textContent || ''
      return text.split('\n').length
    },
  },
  methods: {
    toggleCollapse() {
      this.updateAttributes({ collapsed: !this.isCollapsed })
    },
    
    handleLanguageChange(event) {
      const newLanguage = event.target.value
      this.updateAttributes({ language: newLanguage })
    },
    
    async copyCode() {
      try {
        const codeText = this.node.textContent
        await navigator.clipboard.writeText(codeText)
        // 可以添加一个提示
        console.log('代码已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
      }
    },
    
    deleteCodeBlock() {
      this.deleteNode()
    },
  },
}
</script>

<style scoped>
/* ========== 通用 Tiptap 节点样式 ========== */
.tiptap-node-wrapper {
  margin: 1rem 0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
}

.tiptap-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.tiptap-node-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tiptap-node-button {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  min-width: 100px;
}

.tiptap-node-button:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.tiptap-node-right {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tiptap-action-button {
  padding: 4px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tiptap-action-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.tiptap-delete-button:hover {
  background: #fef2f2;
  color: #dc2626;
}

.tiptap-node-content {
  position: relative;
}

/* ========== 代码块特定样式 ========== */
.code-block-collapsed {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.collapsed-text {
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}

.code-block-text {
  display: block;
  width: 100%;
  padding: 1rem;
  margin: 0;
  background: #1a1a1a;
  color: #ffffff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  outline: none;
  resize: none;
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;
  min-height: 100px;
}

/* 确保代码块内容正确显示 */
.code-block-text pre {
  margin: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
}

/* 深色主题下的代码块样式 */
:deep(.ProseMirror .code-block-enhanced) {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  margin: 1rem 0;
  overflow: hidden;
}

:deep(.ProseMirror .code-block-enhanced code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

/* 确保代码块在编辑器中正确显示 */
:deep(.ProseMirror pre) {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  margin: 1rem 0;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  word-wrap: normal;
}

:deep(.ProseMirror pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}
</style>
