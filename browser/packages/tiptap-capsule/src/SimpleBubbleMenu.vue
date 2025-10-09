<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100 }"
  >
    <div class="bubble-menu-content">
      <!-- 格式化按钮 -->
      <button 
        @click="editor.chain().focus().toggleBold().run()" 
        :class="{ 'is-active': editor.isActive('bold') }"
        class="menu-button"
        title="加粗"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        @click="editor.chain().focus().toggleItalic().run()" 
        :class="{ 'is-active': editor.isActive('italic') }"
        class="menu-button"
        title="斜体"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        @click="editor.chain().focus().toggleStrike().run()" 
        :class="{ 'is-active': editor.isActive('strike') }"
        class="menu-button"
        title="删除线"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="separator"></div>
      
      <button 
        @click="editor.chain().focus().toggleCode().run()" 
        :class="{ 'is-active': editor.isActive('code') }"
        class="menu-button"
        title="代码"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        @click="toggleLink" 
        :class="{ 'is-active': editor.isActive('link') }"
        class="menu-button"
        title="链接"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="separator"></div>
      
      <button 
        @click="editor.chain().focus().clearNodes().unsetAllMarks().run()" 
        class="menu-button"
        title="清除格式"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
  </BubbleMenu>
</template>

<script setup>
import { BubbleMenu } from '@tiptap/vue-3/menus'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-link'])

const toggleLink = () => {
  emit('toggle-link')
}
</script>

<style scoped>
.bubble-menu-content {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #252526;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  padding: 4px;
}

.menu-button {
  padding: 6px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-button:hover {
  background: #2a2d2e;
  color: #fff;
}

.menu-button.is-active {
  background: #0e639c;
  color: #fff;
}

.separator {
  width: 1px;
  height: 20px;
  background: #444;
  margin: 0 2px;
}
</style>

