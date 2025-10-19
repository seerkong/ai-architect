<template>
  <node-view-wrapper>
    <div class="tiptap-node-wrapper human-confirm">
      <!-- 头部 -->
      <div class="tiptap-node-header">
        <div class="tiptap-node-left">
          <span class="editor-label">待确认项 (HumanConfirmPartial)</span>
          <span v-if="isProcessing" class="status-badge processing">处理中...</span>
          <span v-else class="status-badge completed">解析完成</span>
        </div>
        <div class="tiptap-node-right">
          <button 
            v-if="!isProcessing"
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
        <!-- 处理中状态 -->
        <div v-if="isProcessing" class="processing-view">
          <div class="processing-indicator">
            <div class="spinner"></div>
            <span>AI 正在生成确认项...</span>
          </div>
          <pre class="xml-preview">{{ xmlContent || '等待内容...' }}</pre>
        </div>
        
        <!-- 解析完成状态 -->
        <div v-else>
          <!-- 收起状态：显示摘要 -->
          <div v-if="!isExpanded" class="summary-view">
            <div class="summary-info">
              <div class="info-item">
                <span class="info-label">确认项数量：</span>
                <span class="info-value">{{ confirmItemCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">内容长度：</span>
                <span class="info-value">{{ xmlContent.length }} 字符</span>
              </div>
            </div>
          </div>
          
          <!-- 展开状态：显示详细内容 -->
          <div v-else class="expanded-view">
            <div class="content-tabs">
              <button 
                :class="['tab-button', { active: activeTab === 'formatted' }]"
                @click="activeTab = 'formatted'"
              >
                格式化显示
              </button>
              <button 
                :class="['tab-button', { active: activeTab === 'raw' }]"
                @click="activeTab = 'raw'"
              >
                原始 XML
              </button>
            </div>
            
            <div class="content-display">
              <!-- 格式化显示 -->
              <div v-if="activeTab === 'formatted'" class="formatted-content">
                <div v-if="parsedConfirmItems && parsedConfirmItems.length > 0" class="confirm-list">
                  <div v-for="(item, index) in parsedConfirmItems" :key="index" class="confirm-item">
                    <div class="confirm-header">
                      <span class="confirm-type" :class="item.type">{{ item.type.toUpperCase() }}</span>
                      <span class="confirm-id">{{ item.id }}</span>
                    </div>
                    <div class="confirm-content">
                      <div class="confirm-title">{{ item.data.title }}</div>
                      
                      <!-- Select 类型 -->
                      <div v-if="item.type === 'select' && item.data.options" class="confirm-options">
                        <div class="options-label">选项：</div>
                        <div v-for="(option, optIdx) in item.data.options" :key="optIdx" class="option-item">
                          <span class="option-value">{{ option.value }}</span>
                          <span class="option-title">{{ option.title }}</span>
                        </div>
                      </div>
                      
                      <!-- Input 类型 -->
                      <div v-if="item.type === 'input'" class="confirm-input">
                        <div class="input-placeholder">等待用户输入...</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>无法解析确认项内容</p>
                </div>
              </div>
              
              <!-- 原始 XML -->
              <div v-if="activeTab === 'raw'" class="raw-content">
                <pre>{{ xmlContent }}</pre>
              </div>
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
      activeTab: 'formatted',
    }
  },
  computed: {
    xmlContent() {
      return this.node.attrs.content || ''
    },
    isProcessing() {
      return this.node.attrs.isProcessing || false
    },
    parsedConfirmItems() {
      if (!this.xmlContent) return []
      
      try {
        // 解析 XML 内容
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(`<root>${this.xmlContent}</root>`, 'text/xml')
        
        const confirmItems = []
        const children = xmlDoc.documentElement.children
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          const type = child.tagName.toLowerCase()
          const id = child.getAttribute('id')
          const cdataContent = child.textContent.trim()
          
          try {
            const jsonData = JSON.parse(cdataContent)
            confirmItems.push({
              type: type,
              id: id || 'Unknown',
              data: jsonData
            })
          } catch (e) {
            console.error('Failed to parse JSON in confirm item:', e)
          }
        }
        
        return confirmItems
      } catch (e) {
        console.error('Failed to parse XML:', e)
        return []
      }
    },
    confirmItemCount() {
      return this.parsedConfirmItems.length
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
/* ========== 通用 Tiptap 节点样式 ========== */
.tiptap-node-wrapper.human-confirm {
  margin: 1rem 0;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  background: #fffbeb;
  overflow: hidden;
}

.tiptap-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fef3c7;
  border-bottom: 1px solid #f59e0b;
}

.tiptap-node-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-label {
  font-size: 12px;
  color: #92400e;
  font-weight: 500;
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.processing {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #f59e0b;
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
  color: #92400e;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tiptap-action-button:hover {
  background: #fde68a;
  color: #78350f;
}

.tiptap-delete-button:hover {
  background: #fef2f2;
  color: #dc2626;
}

.tiptap-node-content {
  position: relative;
  background: white;
}

/* ========== 处理中状态 ========== */
.processing-view {
  padding: 1rem;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
  color: #92400e;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fde68a;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.xml-preview {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #92400e;
  max-height: 200px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
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
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #92400e;
  font-weight: 500;
  min-width: 100px;
}

.info-value {
  color: #78350f;
  font-weight: 600;
}

/* ========== 展开视图 ========== */
.expanded-view {
  display: flex;
  flex-direction: column;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid #fde68a;
  background: #fffbeb;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #92400e;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #78350f;
}

.tab-button.active {
  color: #f59e0b;
  border-bottom-color: #f59e0b;
  font-weight: 500;
}

.content-display {
  padding: 1rem;
  max-height: 500px;
  overflow: auto;
}

/* 格式化内容 */
.confirm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-item {
  border: 1px solid #fde68a;
  border-radius: 6px;
  overflow: hidden;
  background: #fffbeb;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-bottom: 1px solid #fde68a;
  font-size: 12px;
}

.confirm-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
}

.confirm-type.select {
  background: #dbeafe;
  color: #1e40af;
}

.confirm-type.input {
  background: #e0e7ff;
  color: #4338ca;
}

.confirm-id {
  color: #92400e;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.confirm-content {
  padding: 12px;
  background: white;
}

.confirm-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 12px;
}

.confirm-options {
  margin-top: 8px;
}

.options-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin-bottom: 4px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
}

.option-value {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 11px;
  font-weight: 500;
}

.option-title {
  color: #374151;
}

.confirm-input {
  margin-top: 8px;
  padding: 12px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  text-align: center;
}

.input-placeholder {
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}

/* 原始内容 */
.raw-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #374151;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>

