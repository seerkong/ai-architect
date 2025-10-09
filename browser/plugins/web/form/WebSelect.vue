<template>
  <select
    v-bind="$attrs"
    :value="currentValue"
    :disabled="disabled"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option 
      v-for="option in options" 
      :key="option.value" 
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label || option.value }}
    </option>
    <slot />
  </select>
</template>

<script setup>
import { defineProps, defineEmits, inject, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
  placeholder: String,
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const transformer = inject('transformer', null)

// 使用transformer或props.modelValue
const currentValue = computed(() => {
  if (transformer) {
    return transformer.get()
  }
  return props.modelValue || ''
})

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
