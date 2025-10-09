<template>
  <node-view-wrapper>
    <div class="tiptap-node-wrapper">
      <!-- 头部 -->
      <div class="tiptap-node-header">
        <div class="tiptap-node-left">
          <span class="editor-label">Mermaid 图表</span>
        </div>
        <div class="tiptap-node-right">
          <button 
            @click="toggleEditMode" 
            class="tiptap-action-button" 
            :title="isEditing ? '切换到预览' : '切换到编辑'"
          >
            <svg v-if="!isEditing" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
            </svg>
          </button>
          <button @click="handleDelete" class="tiptap-action-button tiptap-delete-button" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="tiptap-node-content">
        <!-- 预览模式 -->
        <div v-if="!isEditing" class="mermaid-view">
          <div v-if="isValidMermaid" class="mermaid-diagram" v-html="renderedDiagram"></div>
          <div v-else class="mermaid-error">
            <p>Mermaid 语法错误</p>
            <pre>{{ errorMessage }}</pre>
          </div>
        </div>
        
        <!-- 编辑模式：左右分栏 -->
        <div v-else class="mermaid-edit">
          <div class="mermaid-preview-pane">
            <div class="pane-header">预览</div>
            <div class="preview-content">
              <div v-if="isValidMermaid" class="mermaid-diagram" v-html="renderedDiagram"></div>
              <div v-else class="mermaid-error">
                <p>Mermaid 语法错误</p>
                <pre>{{ errorMessage }}</pre>
              </div>
            </div>
          </div>
          
          <div class="mermaid-editor-pane">
            <div class="pane-header">Mermaid DSL</div>
            <textarea 
              v-model="mermaidCode"
              @input="handleCodeChange"
              class="mermaid-textarea"
              placeholder="输入 Mermaid DSL..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-3'
import mermaid from 'mermaid'

export default {
  components: {
    NodeViewWrapper,
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
      isEditing: false,
      mermaidCode: '',
      renderedDiagram: '',
      isValidMermaid: true,
      errorMessage: '',
      diagramId: '',
    }
  },
  async mounted() {
    this.mermaidCode = this.node.attrs.content || ''
    this.isEditing = this.node.attrs.isEditing || false
    this.diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await this.initializeMermaid()
    this.renderDiagram()
  },
  methods: {
    async initializeMermaid() {
      // 初始化 Mermaid 配置
      try {
        await mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'monospace',
        })
      } catch (error) {
        console.warn('Mermaid 初始化失败:', error)
      }
    },
    
    async renderDiagram() {
      if (!this.mermaidCode.trim()) {
        this.isValidMermaid = true
        this.renderedDiagram = '<p>请输入 Mermaid DSL</p>'
        return
      }
      
      try {
        // 清理之前的图表
        const element = document.getElementById(this.diagramId)
        if (element) {
          element.innerHTML = ''
        }
        
        // 渲染新的图表
        const { svg } = await mermaid.render(this.diagramId, this.mermaidCode)
        this.renderedDiagram = svg
        this.isValidMermaid = true
        this.errorMessage = ''
      } catch (error) {
        this.isValidMermaid = false
        this.errorMessage = error.message || '未知错误'
        this.renderedDiagram = ''
      }
    },
    
    handleCodeChange() {
      // 更新节点属性
      this.updateAttributes({ 
        content: this.mermaidCode 
      })
      
      // 延迟渲染，避免频繁渲染
      clearTimeout(this.renderTimeout)
      this.renderTimeout = setTimeout(() => {
        this.renderDiagram()
      }, 500)
    },
    
    toggleEditMode() {
      this.isEditing = !this.isEditing
      this.updateAttributes({ 
        isEditing: this.isEditing,
        content: this.mermaidCode 
      })
    },
    
    handleDelete() {
      this.deleteNode()
    },
  },
  beforeUnmount() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
    }
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

.editor-label {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
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
  background: white;
}

/* ========== Mermaid 特定样式 ========== */
.mermaid-view {
  min-height: 100px;
  padding: 1rem;
}

.mermaid-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 300px;
}

.mermaid-preview-pane,
.mermaid-editor-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mermaid-preview-pane {
  border-right: 1px solid #e2e8f0;
}

.pane-header {
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.mermaid-preview-pane .preview-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.mermaid-diagram {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  color: #ef4444;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  min-height: 100px;
}

.mermaid-error p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.mermaid-error pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.mermaid-textarea {
  flex: 1;
  width: 100%;
  border: none;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  outline: none;
}

.mermaid-textarea:focus {
  outline: none;
}

.mermaid-textarea::placeholder {
  color: #9ca3af;
}
</style>
