<template>
  <node-view-wrapper>
    <div class="tiptap-node-wrapper think-wrapper">
      <!-- 头部 -->
      <div class="tiptap-node-header">
        <div class="tiptap-node-left">
          <span class="editor-label">💭 AI 思考过程</span>
          <span v-if="isThinking" class="status-badge thinking">思考中...</span>
          <span v-else class="status-badge completed">思考结束</span>
        </div>
        <div class="tiptap-node-right">
          <button 
            v-if="!isThinking"
            @click="toggleExpanded" 
            class="tiptap-action-button" 
            :title="isExpanded ? '收起' : '展开'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path v-if="!isExpanded" d="M7 10l5 5 5-5z" fill="currentColor"/>
              <path v-else d="M7 14l5-5 5 5z" fill="currentColor"/>
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
        <!-- 思考中状态 -->
        <div v-if="isThinking" class="thinking-view">
          <div class="thinking-indicator">
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="thinking-content">{{ thinkContent || '正在思考...' }}</div>
        </div>
        
        <!-- 思考结束状态 -->
        <div v-else>
          <!-- 收起状态：显示摘要 -->
          <div v-if="!isExpanded" class="summary-view">
            <div class="summary-info">
              <div class="info-item">
                <span class="info-label">思考内容：</span>
                <span class="info-value">{{ thinkContent.substring(0, 100) }}{{ thinkContent.length > 100 ? '...' : '' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 展开状态：显示完整内容 -->
          <div v-else class="expanded-view">
            <div class="think-content-full">
              <pre>{{ thinkContent }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-3'

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
      isExpanded: false,
    }
  },
  computed: {
    thinkContent() {
      return this.node.attrs.content || ''
    },
    isThinking() {
      return this.node.attrs.isThinking || false
    }
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
    
    handleDelete() {
      this.deleteNode()
    },
  },
}
</script>

<style scoped>
/* ========== Think 节点样式 ========== */
.tiptap-node-wrapper.think-wrapper {
  margin: 1rem 0;
  border: 2px solid #a78bfa;
  border-radius: 8px;
  background: #faf5ff;
  overflow: hidden;
}

.tiptap-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #ede9fe;
  border-bottom: 1px solid #c4b5fd;
}

.tiptap-node-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-label {
  font-size: 12px;
  color: #5b21b6;
  font-weight: 500;
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.thinking {
  background: #e0e7ff;
  color: #4338ca;
  border: 1px solid #818cf8;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #10b981;
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
  color: #5b21b6;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tiptap-action-button:hover {
  background: #ddd6fe;
  color: #4c1d95;
}

.tiptap-delete-button:hover {
  background: #fef2f2;
  color: #dc2626;
}

.tiptap-node-content {
  position: relative;
  background: white;
}

/* ========== 思考中状态 ========== */
.thinking-view {
  padding: 1rem;
}

.thinking-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.thinking-dots {
  display: flex;
  gap: 6px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a78bfa;
  animation: thinking-bounce 1.4s infinite ease-in-out;
}

.thinking-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes thinking-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.thinking-content {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 4px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #5b21b6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

/* ========== 摘要视图 ========== */
.summary-view {
  padding: 1rem;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
}

.info-label {
  color: #5b21b6;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #6b7280;
  line-height: 1.5;
}

/* ========== 展开视图 ========== */
.expanded-view {
  padding: 1rem;
}

.think-content-full {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 4px;
  padding: 12px;
  max-height: 500px;
  overflow: auto;
}

.think-content-full pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #5b21b6;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}
</style>

