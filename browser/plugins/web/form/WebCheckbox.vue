<template>
  <label class="checkbox-item" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      :value="value"
      :disabled="disabled"
      :checked="isChecked"
      @change="handleChange"
      class="checkbox-input"
    />
    <span class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  value: [String, Number],
  disabled: Boolean,
  label: String
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

const isChecked = computed(() => {
  return currentValue.value.includes(props.value)
})

function handleChange(event) {
  let newValue = [...currentValue.value]
  
  if (event.target.checked) {
    if (!newValue.includes(props.value)) {
      newValue.push(props.value)
    }
  } else {
    newValue = newValue.filter(v => v !== props.value)
  }
  
  if (transformer) {
    transformer.set(newValue)
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-right: 12px;
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
