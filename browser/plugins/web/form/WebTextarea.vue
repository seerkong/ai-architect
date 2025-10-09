<template>
  <textarea
    v-bind="$attrs"
    :value="currentValue"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :rows="rows"
    :cols="cols"
    :maxlength="maxlength"
    :minlength="minlength"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    class="web-textarea"
  ></textarea>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
  readonly: Boolean,
  placeholder: String,
  rows: {
    type: Number,
    default: 3
  },
  cols: Number,
  maxlength: Number,
  minlength: Number,
  resize: {
    type: String,
    default: 'vertical'
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus'])

const transformer = inject('transformer', null)

// 使用transformer或props.modelValue
const currentValue = computed(() => {
  if (transformer) {
    return transformer.get() || ''
  }
  return props.modelValue || ''
})

function handleInput(event) {
  const value = event.target.value
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('input', event)
}

function handleChange(event) {
  const value = event.target.value
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('change', event)
}

function handleBlur(event) {
  emit('blur', event)
}

function handleFocus(event) {
  emit('focus', event)
}
</script>

<style scoped>
.web-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.web-textarea:focus {
  border-color: #409eff;
}

.web-textarea:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.web-textarea:read-only {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.web-textarea::placeholder {
  color: #c0c4cc;
}
</style>
