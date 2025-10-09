<template>
  <div class="checkbox-group" :class="{ 'is-vertical': vertical }">
    <label 
      v-for="option in options" 
      :key="option.value"
      class="checkbox-item"
      :class="{ 'is-disabled': disabled || option.disabled }"
    >
      <input
        type="checkbox"
        :value="option.value"
        :disabled="disabled || option.disabled"
        :checked="isChecked(option.value)"
        @change="handleChange"
        class="checkbox-input"
      />
      <span class="checkbox-label">{{ option.label || option.value }}</span>
    </label>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: Boolean,
  vertical: Boolean,
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
    return transformer.get() || []
  }
  return props.modelValue || []
})

function isChecked(value) {
  return currentValue.value.includes(value)
}

function handleChange(event) {
  const value = event.target.value
  let newValue = [...currentValue.value]
  
  if (event.target.checked) {
    if (!newValue.includes(value)) {
      newValue.push(value)
    }
  } else {
    newValue = newValue.filter(v => v !== value)
  }
  
  if (transformer) {
    transformer.set(newValue)
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-group.is-vertical {
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox-input {
  margin: 0;
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-item.is-disabled .checkbox-input {
  cursor: not-allowed;
}

.checkbox-label {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.checkbox-item.is-disabled .checkbox-label {
  color: #c0c4cc;
}
</style>
