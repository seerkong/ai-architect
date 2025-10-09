<template>
  <node-view-wrapper>
    <div class="tiptap-node-wrapper">
      <!-- 头部 -->
      <div class="tiptap-node-header">
        <div class="tiptap-node-left">
          <button @click="incrementCount" class="tiptap-node-button">
            点击次数: {{ count }}
          </button>
        </div>
        <div class="tiptap-node-right">
          <button @click="handleDelete" class="tiptap-action-button tiptap-delete-button" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="tiptap-node-content">
        <node-view-content class="demo-editable-content" />
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
      count: 0,
    }
  },
  methods: {
    incrementCount() {
      this.count += 1
      this.updateAttributes({ count: this.count })
    },
    handleDelete() {
      this.deleteNode()
    },
  },
  mounted() {
    this.count = this.node.attrs.count || 0
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

/* ========== Demo 特定样式 ========== */
.demo-editable-content {
  display: block;
  width: 100%;
  padding: 1rem;
  margin: 0;
  background: white;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  outline: none;
  min-height: 100px;
}
</style>