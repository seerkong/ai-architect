<template>
  <!-- 表单项容器 -->
  <div class="form-item" :class="{ 'form-item--required': required }">
    <!-- 标签区域 -->
    <label v-if="label" class="form-item__label" :for="prop">
      {{ label }}
      <span v-if="required" class="form-item__required">*</span>
    </label>
    <!-- 内容区域，通过插槽渲染具体的输入组件 -->
    <div class="form-item__content">
      <slot :model="formModel" :prop="prop" :disabled="formDisabled || disabled" :transformer="transformer" />
    </div>
  </div>
</template>

<script setup>
/**
 * WebFormItemRender - 表单项渲染组件
 * 
 * 这是表单项的包装组件，负责：
 * 1. 渲染标签和必填标识
 * 2. 创建数据转换器 (transformer) 用于数据绑定
 * 3. 提供表单上下文给子组件
 * 4. 处理表单验证状态
 */

import { defineProps, inject, provide, computed } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  label: String,      // 标签文本
  prop: String,       // 数据属性名
  required: Boolean,  // 是否必填
  disabled: Boolean,  // 是否禁用
  readonly: Boolean   // 是否只读
})

// 从父组件注入表单上下文
const formModel = inject('formModel', {})        // 表单数据模型
const formDisabled = inject('formDisabled', false) // 表单禁用状态

/**
 * 数据转换器 (transformer)
 * 这是数据绑定的核心机制，负责：
 * 1. 从表单模型中获取值
 * 2. 向表单模型中设置值
 * 3. 为子组件提供统一的数据访问接口
 */
const transformer = {
  /**
   * 获取当前字段的值
   * @returns 字段值或空字符串
   */
  get() {
    if (props.prop && formModel) {
      return formModel[props.prop] || ''
    }
    return ''
  },
  
  /**
   * 设置当前字段的值
   * @param value 要设置的值
   */
  set(value) {
    if (props.prop && formModel) {
      formModel[props.prop] = value
    }
  }
}

/**
 * 向子组件提供上下文
 * 子组件可以通过 inject 获取这些数据
 */
provide('transformer', transformer)  // 数据转换器
provide('formProp', props.prop)      // 字段属性名
</script>

<style scoped>
.form-item {
  margin-bottom: 18px;
}

.form-item__label {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #606266;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

.form-item__required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-item__content {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}

.checkbox-group, .radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-item, .radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 12px;
}

.checkbox-item input, .radio-item input {
  margin-right: 6px;
}

input, textarea, select {
  width: 100%;
  height: 32px;
  line-height: 32px;
  padding: 0 15px;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

input:focus, textarea:focus, select:focus {
  border-color: #409eff;
}

textarea {
  height: auto;
  min-height: 60px;
  padding: 5px 15px;
  line-height: 1.5;
  resize: vertical;
}
</style>
