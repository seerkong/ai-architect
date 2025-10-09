<template>
  <div class="tiptap-link-edit">
    <a v-if="attrs.href" :href="attrs.href" target="_blank" class="link-preview">
      <u>{{ attrs.href }}</u>
    </a>
    <form @submit.prevent="handleSubmit" class="link-form">
      <div class="form-group">
        <label class="input-label">链接文字</label>
        <input 
          v-model="model.text" 
          class="link-input" 
          placeholder="输入链接显示的文字" 
          type="text"
        />
      </div>
      <div class="form-group">
        <label class="input-label">链接地址</label>
        <input 
          v-model="model.href" 
          class="link-input" 
          placeholder="输入链接地址 (https://...)" 
          type="url"
          required
        />
      </div>
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="model.target == '_blank'" 
          @change="e => model.target = e.target.checked ? '_blank' : null" 
        />
        <span>在新标签页打开</span>
      </label>
      <div class="button-group">
        <button type="submit" class="btn-ok">确定</button>
        <button type="button" class="btn-cancel" @click="$emit('cancel')">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useVModel } from '@vueuse/core'

const props = defineProps(['attrs'])
const emit = defineEmits(['update:attrs'])

const model = useVModel(props, 'attrs', emit, { passive: true, clone: true })

const handleSubmit = () => {
  emit('update:attrs', model.value)
}
</script>

<style scoped>
.tiptap-link-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.link-preview {
  display: block;
  color: #3b82f6;
  font-size: 13px;
  text-decoration: none;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 4px;
}

.link-preview:hover {
  color: #2563eb;
}

.link-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.link-input {
  width: 100%;
  outline: none;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
}

.link-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-ok {
  flex: 1;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-ok:hover {
  background: #2563eb;
}

.btn-cancel {
  flex: 1;
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-label span {
  user-select: none;
}
</style>

