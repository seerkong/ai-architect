<template>
  <div class="tiptap-node-wrapper">
    <!-- 头部 -->
    <div class="tiptap-node-header">
      <div class="tiptap-node-left">
        <span class="editor-label">Markdown 编辑器</span>
      </div>
      <div class="tiptap-node-right">
        <button 
          @click="setMode('edit')" 
          :class="['tiptap-action-button', { 'is-active': mode === 'edit' }]" 
          title="纯编辑"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
          </svg>
        </button>
        <button 
          @click="setMode('preview')" 
          :class="['tiptap-action-button', { 'is-active': mode === 'preview' }]" 
          title="纯预览"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        </button>
        <button 
          @click="setMode('split')" 
          :class="['tiptap-action-button', { 'is-active': mode === 'split' }]" 
          title="左右分栏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h8v18H3V3zm10 0h8v18h-8V3z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="tiptap-node-content">
      <!-- 纯编辑模式 -->
      <div v-if="mode === 'edit'" class="markdown-edit-only">
        <textarea 
          v-model="localContent" 
          @input="handleInput"
          class="markdown-textarea"
          placeholder="在此输入 Markdown 内容..."
        ></textarea>
      </div>
      
      <!-- 纯预览模式 -->
      <div v-else-if="mode === 'preview'" class="markdown-preview-only">
        <wc-mdit 
          :content="localContent" 
          :theme="theme"
        />
      </div>
      
      <!-- 分栏模式 -->
      <div v-else-if="mode === 'split'" class="markdown-split">
        <div class="markdown-edit-pane">
          <div class="pane-header">编辑</div>
          <textarea 
            v-model="localContent" 
            @input="handleInput"
            class="markdown-textarea"
            placeholder="在此输入 Markdown 内容..."
          ></textarea>
        </div>
        <div class="markdown-preview-pane">
          <div class="pane-header">预览</div>
          <div class="preview-content">
            <wc-mdit 
              :content="localContent" 
              :theme="theme"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'github'
  }
})

const emit = defineEmits(['update:content'])

const mode = ref('edit') // 'edit', 'preview', 'split'
const localContent = ref(props.content || '')

// 确保 wc-mdit 被加载
onMounted(async () => {
  try {
    await import('wc-mdit')
  } catch (error) {
    console.error('Failed to load wc-mdit:', error)
  }
})

// 监听外部内容变化
watch(() => props.content, (newValue) => {
  if (newValue !== localContent.value) {
    localContent.value = newValue
  }
})

// 处理输入变化
const handleInput = () => {
  emit('update:content', localContent.value)
}

// 切换模式
const setMode = (newMode) => {
  mode.value = newMode
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

.tiptap-action-button.is-active {
  background: #3b82f6;
  color: white;
}

.tiptap-node-content {
  position: relative;
  background: white;
}

/* ========== Markdown 特定样式 ========== */
.markdown-edit-only,
.markdown-preview-only {
  min-height: 300px;
}

.markdown-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  background: white;
  color: #374151;
}

.markdown-preview-only {
  padding: 1rem;
  overflow-y: auto;
  max-height: 600px;
}

.markdown-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 300px;
}

.markdown-edit-pane,
.markdown-preview-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.markdown-edit-pane {
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

.markdown-edit-pane .markdown-textarea {
  flex: 1;
  min-height: auto;
  resize: none;
}

.markdown-preview-pane .preview-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

/* wc-mdit 样式调整 */
:deep(wc-mdit) {
  display: block;
  width: 100%;
}
</style>

