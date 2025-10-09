<template>
  <!-- 原生 HTML 表单容器 -->
  <form ref="formRef" v-bind="{ ...$props, ...$attrs }" @submit.prevent="onSubmit">
    <slot />
  </form>
</template>

<script setup>
/**
 * WebFormLcd - 原生 HTML 表单容器组件
 * 
 * 这是原生 HTML 表单的容器组件，提供：
 * 1. 表单提交处理
 * 2. 表单上下文提供 (formModel, formDisabled)
 * 3. 与 Element Plus 表单 API 兼容的属性
 * 4. 支持所有原生 HTML form 属性
 */

import { ref, provide } from 'vue'

/**
 * 组件属性定义
 * 与 Element Plus ElForm 保持兼容
 */
const props = defineProps({
  model: Object,                    // 表单数据模型
  labelWidth: [String, Number],    // 标签宽度
  labelPosition: String,           // 标签位置
  size: String,                    // 组件尺寸
  disabled: Boolean,               // 是否禁用
  validateOnRuleChange: {          // 规则变化时是否验证
    type: Boolean,
    default: true
  },
  hideRequiredAsterisk: Boolean,   // 是否隐藏必填星号
  showMessage: {                   // 是否显示验证消息
    type: Boolean,
    default: true
  },
  inlineMessage: Boolean,          // 是否内联显示消息
  statusIcon: Boolean,             // 是否显示状态图标
  scrollToError: Boolean           // 是否滚动到错误字段
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['submit', 'validate'])

const formRef = ref()

/**
 * 提供表单上下文给子组件
 * 子组件可以通过 inject 获取这些上下文
 */
provide('formModel', props.model)      // 表单数据模型
provide('formDisabled', props.disabled) // 表单禁用状态

/**
 * 表单提交处理函数
 * 阻止默认提交行为，触发自定义提交事件
 */
async function onSubmit(event) {
  console.log('Form submitted:', formRef.value)
  console.log('Form model:', props.model)
  emit('submit', event)
}
</script>
