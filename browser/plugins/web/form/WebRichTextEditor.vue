<template>
  <div class="web-rich-text-editor">
    <!-- 在开发模式下显示TipTap编辑器 -->
    <TiptapEditorCapsule
      v-if="isDevelopment"
      :model-value="currentValue"
      @update:model-value="handleUpdate"
      :show-output="false"
      v-bind="$attrs"
    />
    <!-- 在生产模式下显示HTML内容 -->
    <div
      v-else
      v-html="currentValue"
      class="rich-text-content"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup>
/**
 * WebRichTextEditor - 富文本编辑器组件
 * 
 * 这个组件提供：
 * 1. 在开发模式下使用TipTap编辑器进行编辑
 * 2. 在生产模式下渲染HTML内容
 * 3. 与el-lowcode transformer机制集成
 * 4. 支持双向数据绑定
 */

import { defineProps, defineEmits, inject, computed } from 'vue'
import { TiptapEditorCapsule } from '../../../packages/tiptap-capsule/src/index.ts'

/**
 * 组件属性定义
 */
const props = defineProps({
  modelValue: String,    // v-model 绑定值
  disabled: Boolean,     // 是否禁用
  readonly: Boolean      // 是否只读
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:modelValue', 'change'])

// 从父组件注入数据转换器
const transformer = inject('transformer', null)

// 判断是否为开发模式（可以通过环境变量或其他方式判断）
const isDevelopment = computed(() => {
  // 这里可以根据实际需要判断是否为开发模式
  // 暂时返回true，这样总是显示编辑器
  return true
})

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
.web-rich-text-editor {
  width: 100%;
  min-height: 200px;
}

.rich-text-content {
  min-height: 200px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  line-height: 1.6;
}

.rich-text-content:focus {
  border-color: #409eff;
  outline: none;
}
</style>
