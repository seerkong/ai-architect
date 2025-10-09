<template>
  <div class="web-markdown-editor">
    <!-- 使用增强的 Markdown 编辑器 -->
    <MarkdownEditorEnhanced
      :content="currentValue"
      @update:content="handleUpdate"
      :theme="theme"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup>
/**
 * WebMarkdownEditor - Markdown编辑器组件
 * 
 * 这个组件提供：
 * 1. 使用MarkdownIt组件进行Markdown编辑和渲染
 * 2. 与el-lowcode transformer机制集成
 * 3. 支持双向数据绑定
 * 4. 支持主题配置
 */

import { defineProps, defineEmits, inject, computed } from 'vue'
import MarkdownEditorEnhanced from '../../../packages/markdown-editor-enhanced/src/MarkdownEditorEnhanced.vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  modelValue: String,    // v-model 绑定值
  theme: {               // Markdown主题
    type: String,
    default: 'github'
  },
  disabled: Boolean      // 是否禁用
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:modelValue', 'change'])

// 从父组件注入数据转换器
const transformer = inject('transformer', null)

/**
 * 当前值计算属性
 * 优先使用 transformer，否则使用 modelValue
 */
const currentValue = computed(() => {
  if (transformer) {
    return transformer.get() || ''
  }
  return props.modelValue || ''
})

/**
 * 处理值更新
 */
function handleUpdate(value) {
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.web-markdown-editor {
  width: 100%;
  min-height: 200px;
}

.loading-placeholder {
  min-height: 200px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>
