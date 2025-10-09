<template>
  <!-- 原生 HTML input 元素 -->
  <input
    v-bind="$attrs"
    :value="currentValue"
    :disabled="disabled"
    :readonly="readonly"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<script setup>
/**
 * WebInput - 原生 HTML 输入框组件
 * 
 * 这是基于原生 HTML input 元素的输入框组件，提供：
 * 1. 与 Vue v-model 兼容的双向数据绑定
 * 2. 与 el-lowcode transformer 机制集成
 * 3. 支持所有原生 input 属性和事件
 * 4. 与 Element Plus Input 组件 API 兼容
 */

import { defineProps, defineEmits, inject, computed } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  modelValue: [String, Number],  // v-model 绑定值
  disabled: Boolean,             // 是否禁用
  readonly: Boolean,             // 是否只读
  type: {                        // 输入类型
    type: String,
    default: 'text'
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus'])

// 从父组件注入数据转换器
const transformer = inject('transformer', null)

/**
 * 当前值计算属性
 * 优先使用 transformer，否则使用 modelValue
 */
const currentValue = computed(() => {
  if (transformer) {
    return transformer.get()
  }
  return props.modelValue || ''
})

/**
 * 输入事件处理
 * 更新数据并触发事件
 */
function handleInput(event) {
  const value = event.target.value
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('input', event)
}

/**
 * 变化事件处理
 * 更新数据并触发事件
 */
function handleChange(event) {
  const value = event.target.value
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('change', event)
}

/**
 * 失焦事件处理
 */
function handleBlur(event) {
  emit('blur', event)
}

/**
 * 聚焦事件处理
 */
function handleFocus(event) {
  emit('focus', event)
}
</script>
