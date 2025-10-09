<template>
  <div class="radio-group" :class="{ 'is-vertical': vertical }">
    <label 
      v-for="option in options" 
      :key="option.value"
      class="radio-item"
      :class="{ 'is-disabled': disabled || option.disabled }"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :disabled="disabled || option.disabled"
        :checked="isChecked(option.value)"
        @change="handleChange"
        class="radio-input"
      />
      <span class="radio-label">{{ option.label || option.value }}</span>
    </label>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
  vertical: Boolean,
  name: String,
  options: {
    type: Array,
    default: () => []
  }
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

function isChecked(value) {
  return currentValue.value === value
}

function handleChange(event) {
  const value = event.target.value
  if (transformer) {
    transformer.set(value)
  }
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-group.is-vertical {
  flex-direction: column;
  gap: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
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
