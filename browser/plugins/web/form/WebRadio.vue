<template>
  <label class="radio-item" :class="{ 'is-disabled': disabled }">
    <input
      type="radio"
      :name="name"
      :value="value"
      :disabled="disabled"
      :checked="isChecked"
      @change="handleChange"
      class="radio-input"
    />
    <span class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  value: [String, Number],
  disabled: Boolean,
  name: String,
  label: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const transformer = inject('transformer', null)

// 使用transformer或props.modelValue
const currentValue = computed(() => {
  if (transformer) {
    return transformer.get()
  }
  return props.modelValue || ''
})

const isChecked = computed(() => {
  return currentValue.value === props.value
})

function handleChange(event) {
  if (event.target.checked) {
    const value = event.target.value
    if (transformer) {
      transformer.set(value)
    }
    emit('update:modelValue', value)
    emit('change', value)
  }
}
</script>

<style scoped>
.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-right: 12px;
}

.radio-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radio-input {
  margin: 0;
  margin-right: 8px;
  cursor: pointer;
}

.radio-item.is-disabled .radio-input {
  cursor: not-allowed;
}

.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.radio-item.is-disabled .radio-label {
  color: #c0c4cc;
}
</style>
