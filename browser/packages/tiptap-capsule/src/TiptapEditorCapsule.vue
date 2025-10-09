<template>
  <div v-if="editor" class="tiptap-editor-capsule" :class="{ 'height-mode-fixed': heightMode === 'fixed' }">
    <!-- 工具栏 - 固定高度模式下添加额外的包装 -->
    <div v-if="showToolbar" class="toolbar-wrapper">
      <div class="toolbar-container">
      <!-- 基础格式化组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': isBold }"
          title="粗体"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': isItalic }"
          title="斜体"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          title="删除线"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :disabled="!editor.can().chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
          title="下划线"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
          title="代码"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 清除功能组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button @click="editor.chain().focus().unsetAllMarks().run()" title="清除标记">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
        <button @click="editor.chain().focus().clearNodes().run()" title="清除节点">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 标题和段落组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }"
          title="段落"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18v-2H3v2zM3 8h12v-2H3v2zM3 13h15v-2H3v2zM3 3v2h18V3H3z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          title="标题1"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4v3h5.5v13h3V7H19V4z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          title="标题2"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4h6v3H3V4zm0 5h6v3H3V9zm0 5h6v3H3v-3zm8 0h10v3H11v-3zm0-5h10v3H11V9zm0-5h10v3H11V4z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          title="标题3"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4h6v3H3V4zm0 5h6v3H3V9zm0 5h6v3H3v-3zm8-5h10v3H11V9zm0-5h10v3H11V4zm0 10h10v3H11v-3z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 列表组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          title="无序列表"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          title="有序列表"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 文字对齐组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button @click="setTextAlign('left')" :class="{ 'is-active': textAlign === 'left' }" title="左对齐">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18v-2H3v2zM3 8h12v-2H3v2zM3 13h15v-2H3v2zM3 3v2h18V3H3z" fill="currentColor"/>
          </svg>
        </button>
        <button @click="setTextAlign('center')" :class="{ 'is-active': textAlign === 'center' }" title="居中对齐">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18v-2H3v2zM7 8h10v-2H7v2zM5 13h14v-2H5v2zM3 3v2h18V3H3z" fill="currentColor"/>
          </svg>
        </button>
        <button @click="setTextAlign('right')" :class="{ 'is-active': textAlign === 'right' }" title="右对齐">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18v-2H3v2zM9 8h12v-2H9v2zM7 13h14v-2H7v2zM3 3v2h18V3H3z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 插入功能组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <!-- 表格按钮 -->
        <button @click="insertTable" title="插入表格">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z" fill="currentColor"/>
          </svg>
        </button>
        <!-- 插入图片 -->
        <button @click="insertImage" title="插入图片">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
          </svg>
        </button>
        <!-- 插入链接 -->
        <button @click="setLink" title="插入链接">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
          </svg>
        </button>
        <!-- 插入Vue组件 -->
        <button v-if="enableVueTextBtnDemo" @click="insertVueComponent" title="插入Vue组件">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
        <!-- 插入Mermaid图表 -->
        <button @click="insertMermaid" title="插入Mermaid图表">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 高级功能组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button
          @click="toggleCodeBlock"
          :class="{ 'is-active': editor.isActive('code') }"
          title="代码块"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          title="引用"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
          </svg>
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()" title="分割线">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18m-9-9v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button @click="editor.chain().focus().setHardBreak().run()" title="换行">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 撤销重做组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()" title="撤销">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7v6h6M21 7a9 9 0 00-9 9 9 9 0 009 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()" title="重做">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 7v6h-6M3 7a9 9 0 019 9 9 9 0 01-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 颜色组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button @click="toggleHighlight" :class="{ 'is-active': editor?.isActive('highlight') }" title="高亮">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="editor.chain().focus().setColor('#958DF1').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { color: '#958DF1' }) }"
          title="紫色"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </button>
        <button @click="setColor('#FF0000')" :class="{ 'is-active': editor?.isActive('textStyle', { color: '#FF0000' }) }" title="红色" style="color: #FF0000;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
          </svg>
        </button>
        <button @click="setColor('#00FF00')" :class="{ 'is-active': editor?.isActive('textStyle', { color: '#00FF00' }) }" title="绿色" style="color: #00FF00;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
          </svg>
        </button>
        <button @click="setColor('#0000FF')" :class="{ 'is-active': editor?.isActive('textStyle', { color: '#0000FF' }) }" title="蓝色" style="color: #0000FF;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 表格操作组 -->
      <div v-if="internalEditable" class="toolbar-group">
        <button class="toolbar-button" @click="addRowBefore" title="上方插入行">↑+</button>
        <button class="toolbar-button" @click="addRowAfter" title="下方插入行">↓+</button>
        <button class="toolbar-button" @click="addColumnBefore" title="左侧插入列">←+</button>
        <button class="toolbar-button" @click="addColumnAfter" title="右侧插入列">→+</button>
        <button class="toolbar-button" @click="deleteRow" title="删除行">⊟</button>
        <button class="toolbar-button" @click="deleteColumn" title="删除列">⊞</button>
        <button class="toolbar-button" @click="deleteTable" title="删除表格">⊠</button>
      </div>

      <div v-if="internalEditable" class="toolbar-separator"></div>

      <!-- 标题下拉框组 -->
      <div class="toolbar-group">
        <select @change="handleHeadingChange" :value="currentHeading" class="toolbar-select">
          <option value="0">正文</option>
          <option value="1">标题 1</option>
          <option value="2">标题 2</option>
          <option value="3">标题 3</option>
          <option value="4">标题 4</option>
          <option value="5">标题 5</option>
          <option value="6">标题 6</option>
        </select>
      </div>
      
      <div class="toolbar-separator"></div>
      
      <!-- 编辑/预览模式切换 -->
      <div class="toolbar-group">
        <button 
          @click="toggleEditMode" 
          :class="{ 'is-active': internalEditable }"
          :title="internalEditable ? '切换到预览模式' : '切换到编辑模式'"
          class="toolbar-button"
        >
          <svg v-if="internalEditable" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
          </svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      </div>
    </div>
    
    <!-- 编辑区域包装 - 固定高度模式下此容器可滚动 -->
    <div class="editor-wrapper">
      <editor-content :editor="editor" />
    </div>
    
    <!-- BubbleMenu -->
    <simple-bubble-menu v-if="editor && enableBubbleMenu" :editor="editor" @toggle-link="setLink" />
    
    <!-- 链接编辑对话框 -->
    <div v-if="showLinkDialog" class="link-dialog-overlay" @click="showLinkDialog = false">
      <div class="link-dialog-content" @click.stop>
        <tiptap-link-edit 
          :attrs="linkAttrs" 
          @update:attrs="handleLinkUpdate"
          @cancel="showLinkDialog = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref } from 'vue'
import { ListItem } from '@tiptap/extension-list'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, VueNodeViewRenderer, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { Node, Extension } from '@tiptap/core'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { TableKitWithCustomAttributes } from '../../tiptap-ext-table/src/kit/table-kit-with-custom-attributes.ts'
import CodeBlockEnhanced from '../../tiptap-ext-code-block-enhanced/src/index.ts'
import Moveable from 'vue3-moveable'
import { chooseImg } from './file'
import TiptapLinkEdit from './TiptapLinkEdit.vue'
import SimpleBubbleMenu from './SimpleBubbleMenu.vue'

// 自定义表格删除扩展
const TableDeleteExtension = Extension.create({
  name: 'tableDelete',
  
  addKeyboardShortcuts() {
    return {
      'Backspace': ({ editor }) => {
        const { selection, doc } = editor.state
        const { $from, empty } = selection
        
        // 只处理空选区
        if (!empty) {
          return false
        }
        
        // 如果已经选中了表格节点，删除它
        if (selection.node && selection.node.type.name === 'table') {
          editor.commands.deleteSelection()
          return true
        }
        
        // 检查光标前面是否有节点
        const nodeBefore = $from.nodeBefore
        
        // 如果前面的节点是表格，并且光标在段落开头或 Gapcursor 位置
        if (nodeBefore && nodeBefore.type.name === 'table' && $from.parentOffset === 0) {
          const tablePos = $from.pos - nodeBefore.nodeSize
          // 选中整个表格
          editor.commands.setNodeSelection(tablePos)
          return true
        }
        
        return false
      },
    }
  },
  
  priority: 1000, // 高优先级，在其他扩展之前执行
})

// 图片 Resize 组件
const vImageResize = defineComponent({
  props: nodeViewProps,
  setup(props) {
    const focused = ref(props.selected)
    const img = ref()
    
    const handleClick = (e) => {
      if (e.currentTarget === e.target) {
        focused.value = false
      } else {
        e.stopPropagation()
        focused.value = true
      }
    }
    
    const handleResize = (e) => {
      e.target.style.width = `${e.width}px`
      e.target.style.height = `${e.height}px`
    }
    
    const handleResizeEnd = (e) => {
      const attrs = props.node.attrs
      attrs.style = e.target.style.cssText
      props.updateAttributes(attrs)
    }
    
    return () => {
      const { attrs } = props.node
      
      return h(NodeViewWrapper, { onClick: handleClick }, [
        h('div', { style: `position: relative; text-align: ${attrs.align}` }, [
          h(Moveable, {
            target: focused.value && props.selected ? img.value : undefined,
            draggable: false,
            resizable: true,
            origin: false,
            useMutationObserver: true,
            onResize: handleResize,
            onResizeEnd: handleResizeEnd,
          }),
          h('img', { ...attrs, ref: img, key: attrs.align, align: '' })
        ]),
      ])
    }
  }
})

// 图片 Resize 扩展
const ImageResize = Node.create({
  name: 'image',
  group: 'block',
  allowGapCursor: true,
  parseHTML: () => [{ attrs: { 'data-type': 'image' } }],
  renderHTML: ({ node, HTMLAttributes: { align, ...attrs } }) => [
    'div', 
    { 'data-type': 'image', style: `text-align: ${align}` }, 
    ['img', attrs]
  ],
  addNodeView: () => VueNodeViewRenderer(vImageResize),
  addCommands: () => ({
    setImage: attrs => ({ commands }) => commands.insertContent({ type: 'image', attrs })
  }),
  addAttributes: () => ({
    src: { default: null, parseHTML: el => el.children[0].src },
    style: { default: 'max-width: 100%; height: auto;' },
    align: { default: 'center', parseHTML: el => el.style.textAlign },
  })
})

export default {
  name: 'TiptapEditorCapsule',
  components: {
    EditorContent,
    TiptapLinkEdit,
    SimpleBubbleMenu,
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    enableVueTextBtnDemo: {
      type: Boolean,
      default: false
    },
    enableBubbleMenu: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    onHtmlPresentChanged: {
      type: Function,
      default: null
    },
    onJsonPresentChanged: {
      type: Function,
      default: null
    },
    showOutput: {
      type: Boolean,
      default: true
    },
    heightMode: {
      type: String,
      default: 'auto', // 'auto' 自动撑开 | 'fixed' 固定高度可滚动
      validator: (value) => ['auto', 'fixed'].includes(value)
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editor: null,
      htmlOutput: '',
      jsonOutput: '',
      currentHeadingLevel: 0,
      textAlign: 'left',
      showLinkDialog: false,
      linkAttrs: { href: '', target: '' },
      internalEditable: this.editable
    }
  },
  computed: {
    isBold() {
      return this.editor?.isActive('bold') || false
    },
    isItalic() {
      return this.editor?.isActive('italic') || false
    },
    isStrike() {
      return this.editor?.isActive('strike') || false
    },
    isCode() {
      return this.editor?.isActive('code') || false
    },
    isHighlight() {
      return this.editor?.isActive('highlight') || false
    },
    currentHeading() {
      for (let i = 1; i <= 6; i++) {
        if (this.editor?.isActive('heading', { level: i })) {
          return i
        }
      }
      return 0
    },
    currentTextAlign() {
      if (this.editor?.isActive({ textAlign: 'center' })) return 'center'
      if (this.editor?.isActive({ textAlign: 'right' })) return 'right'
      return 'left'
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  watch: {
    modelValue(newValue) {
      if (this.editor && newValue !== this.editor.getHTML()) {
        this.editor.commands.setContent(newValue, false)
      }
    },
    editable(newValue) {
      this.internalEditable = newValue
      if (this.editor) {
        this.editor.setEditable(newValue)
      }
    }
  },
  methods: {
        async initEditor() {
          // 基础扩展
          const extensions = [
            StarterKit.configure({
              link: false, // 禁用StarterKit中的Link扩展
              codeBlock: false, // 禁用StarterKit中的codeBlock扩展
              code: false // 禁用StarterKit中的code扩展
            }),
            TextAlign.configure({
              types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Highlight.configure({ multicolor: true }),
            Color,
            Link.configure({
              openOnClick: false,
              defaultProtocol: 'https',
            }),
            Placeholder.configure({
              placeholder: 'Type / to browse options',
            }),
            ImageResize,
            // BubbleMenu 扩展
            BubbleMenu,
            // 表格删除扩展
            TableDeleteExtension,
            // 直接集成表格扩展
            TableKitWithCustomAttributes.configure({
              resizable: true,
              table: {
                HTMLAttributes: {
                  style: 'border-collapse: collapse; table-layout: fixed; width: 100%;'
                },
              },
            }),
          ]

          // 添加Vue组件扩展（通过开关控制）
          if (this.enableVueTextBtnDemo) {
            try {
              const VueTextBtnDemo = await import('../../tiptap-ext-vue-text-btn-demo/src/index.ts')
              extensions.push(VueTextBtnDemo.default)
            } catch (error) {
              console.warn('VueTextBtnDemo 扩展加载失败:', error)
            }
          }

          // 添加增强的代码块扩展（覆盖默认的 codeBlock）
          extensions.push(CodeBlockEnhanced)

          // 添加Mermaid扩展
          try {
            const VueMermaid = await import('../../tiptap-ext-vue-mermaid/src/index.ts')
            extensions.push(VueMermaid.default)
          } catch (error) {
            console.warn('VueMermaid 扩展加载失败:', error)
          }

          // 创建编辑器
          this.editor = new Editor({
            extensions,
            content: this.modelValue,
            editable: this.internalEditable,
            onUpdate: ({ editor }) => {
              const html = editor.getHTML()
              const json = editor.getJSON()
              
              this.$emit('update:modelValue', html)
              this.htmlOutput = html
              this.jsonOutput = JSON.stringify(json, null, 2)
              
              if (this.onHtmlPresentChanged) {
                this.onHtmlPresentChanged(html)
              }
              
              if (this.onJsonPresentChanged) {
                this.onJsonPresentChanged(json)
              }
              
              // 更新状态
              this.updateStates()
            }
          })
          
          // 初始化输出
          this.htmlOutput = this.editor.getHTML()
          this.jsonOutput = JSON.stringify(this.editor.getJSON(), null, 2)
          this.updateStates()
    },
    
    // 更新状态
    updateStates() {
      if (this.editor) {
        this.currentHeadingLevel = this.getCurrentHeadingLevel()
        this.textAlign = this.getCurrentTextAlign()
      }
    },
    
    // 获取当前标题级别
    getCurrentHeadingLevel() {
      if (!this.editor) return 0
      if (this.editor.isActive('paragraph')) return 0
      for (let i = 1; i <= 6; i++) {
        if (this.editor.isActive('heading', { level: i })) {
          return i
        }
      }
      return 0
    },
    
    // 获取当前文字对齐
    getCurrentTextAlign() {
      if (!this.editor) return 'left'
      if (this.editor.isActive({ textAlign: 'center' })) return 'center'
      if (this.editor.isActive({ textAlign: 'right' })) return 'right'
      return 'left'
    },
    
        insertTable() {
          const xId = 'table_' + Date.now()
          this.editor?.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true
          }).run()
          // 设置x-id属性
          setTimeout(() => {
            const tableElement = document.querySelector('table:not([x-id])')
            if (tableElement) {
              tableElement.setAttribute('x-id', xId)
            }
          }, 100)
        },
    
        async insertImage() {
          try {
            const srcs = await chooseImg({ base64: true, maxSize: 1024 * 200 })
            if (srcs && srcs.length > 0) {
              this.editor?.chain().focus().setImage({ src: srcs[0] }).run()
            }
          } catch (error) {
            console.error('图片选择失败:', error)
          }
        },
        
        setLink() {
          const { from, to } = this.editor.state.selection
          const selectedText = this.editor.state.doc.textBetween(from, to, ' ')
          
          // 获取当前选中文本的链接属性
          const currentLink = this.editor?.getAttributes('link')
          this.linkAttrs = {
            text: selectedText || currentLink?.text || '',
            href: currentLink?.href || '',
            target: currentLink?.target || ''
          }
          this.showLinkDialog = true
        },
        
        handleLinkUpdate(attrs) {
          if (attrs.href) {
            const { from, to } = this.editor.state.selection
            const selectedText = this.editor.state.doc.textBetween(from, to, ' ')
            
            // 如果有选中文本，直接添加链接
            if (selectedText) {
              this.editor?.chain().focus().setLink({ href: attrs.href, target: attrs.target }).run()
            } 
            // 如果没有选中文本但提供了链接文字，插入链接文字
            else if (attrs.text) {
              this.editor?.chain().focus()
                .insertContent(`<a href="${attrs.href}"${attrs.target ? ` target="${attrs.target}"` : ''}>${attrs.text}</a>`)
                .run()
            }
            // 如果都没有，只插入链接地址作为文字
            else {
              this.editor?.chain().focus()
                .insertContent(`<a href="${attrs.href}"${attrs.target ? ` target="${attrs.target}"` : ''}>${attrs.href}</a>`)
                .run()
            }
          }
          this.showLinkDialog = false
        },
    
        insertVueComponent() {
          if (this.enableVueTextBtnDemo) {
            this.editor?.chain().focus().insertVueTextBtnDemo().run()
          }
        },
        
        insertMermaid() {
          this.editor?.chain().focus().insertVueMermaid('graph TD\n    A[开始] --> B[结束]').run()
        },
        
        toggleCodeBlock() {
          this.editor?.chain().focus().toggleCode({ language: 'text' }).run()
        },
    
        // 表格操作
        addRowBefore() {
          this.editor?.chain().focus().addRowBefore().run()
        },
        addRowAfter() {
          this.editor?.chain().focus().addRowAfter().run()
        },
        addColumnBefore() {
          this.editor?.chain().focus().addColumnBefore().run()
        },
        addColumnAfter() {
          this.editor?.chain().focus().addColumnAfter().run()
        },
        deleteRow() {
          this.editor?.chain().focus().deleteRow().run()
        },
        deleteColumn() {
          this.editor?.chain().focus().deleteColumn().run()
        },
        deleteTable() {
          this.editor?.chain().focus().deleteTable().run()
        },
    
        // 标题处理
        handleHeadingChange(event) {
          const level = parseInt(event.target.value)
          if (level === 0) {
            this.editor?.chain().focus().setParagraph().run()
          } else {
            this.editor?.chain().focus().toggleHeading({ level }).run()
          }
        },
    
        // 文字对齐
        setTextAlign(alignment) {
          this.editor?.chain().focus().setTextAlign(alignment).run()
        },
        
        // 高亮
        toggleHighlight() {
          this.editor?.chain().focus().toggleHighlight().run()
        },
        
        // 设置颜色
        setColor(color) {
          this.editor?.chain().focus().setColor(color).run()
        },
        
        // 切换编辑/预览模式
        toggleEditMode() {
          this.internalEditable = !this.internalEditable
          if (this.editor) {
            this.editor.setEditable(this.internalEditable)
          }
        },
        
        // 公共方法
        getHTML() {
          return this.editor?.getHTML() || ''
        },
        getJSON() {
          return this.editor?.getJSON() || null
        },
        setHTML(html) {
          if (this.editor) {
            // setContent 接受 HTML 字符串，第二个参数是选项对象
            this.editor.commands.setContent(html, { emitUpdate: false })
          }
        },
        setJSON(json) {
          if (this.editor) {
            // setContent 也接受 JSON 对象，TipTap 会自动识别格式
            this.editor.commands.setContent(json, { emitUpdate: false })
          }
        }
  }
}
</script>

<style scoped>
.tiptap-editor-capsule {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 固定高度模式 */
.tiptap-editor-capsule.height-mode-fixed {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 工具栏包装 */
.toolbar-wrapper {
  flex-shrink: 0;
}

/* 固定高度模式下工具栏包装固定 */
.height-mode-fixed .toolbar-wrapper {
  position: relative;
  z-index: 10;
}

    .toolbar-container {
      background: #f8fafc;
      padding: 6px 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      min-height: 44px;
    }

/* 编辑器包装 - 默认模式 */
.editor-wrapper {
  min-height: 200px;
}

/* 编辑器包装 - 固定高度模式 */
.height-mode-fixed .editor-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

/* EditorContent 容器样式 */
:deep(.editor-content) {
  height: 100%;
}

    .toolbar-group {
      display: flex;
      gap: 4px;
      align-items: center;
      flex-wrap: nowrap;
    }

    /* 工具栏按钮通用样式 */
    .toolbar-group button {
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 13px;
      min-height: 32px;
      min-width: 32px;
    }

    .toolbar-group button:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .toolbar-group button.is-active {
      background: #3b82f6;
      color: white;
    }

    .toolbar-group button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

.toolbar-button {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 13px;
  min-height: 32px;
  min-width: 32px;
}

.toolbar-button:hover {
  background: #f3f4f6;
}

.toolbar-button.is-active {
  background: #3b82f6;
  color: white;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: #d1d5db;
  margin: 0 2px;
}

.toolbar-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  min-height: 32px;
  min-width: 60px;
}

.toolbar-select:hover {
  background: #f3f4f6;
}

.toolbar-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.editor-container {
  min-height: 300px;
  padding: 1rem;
}

/* ProseMirror样式 */
:deep(.ProseMirror) {
  outline: none;
  padding: 12px;
  min-height: 200px;
  box-sizing: border-box;
}

/* ProseMirror样式 - 固定高度模式下让内容自然撑开 */
.height-mode-fixed :deep(.ProseMirror) {
  /* 内容自然撑开，超出时由外层 editor-wrapper 滚动 */
  min-height: 100%;
}

/* Placeholder样式 */
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 表格样式 */
:deep(.ProseMirror table) {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

:deep(.ProseMirror td),
:deep(.ProseMirror th) {
  border: 1px solid #d1d5db;
  box-sizing: border-box;
  min-width: 1em;
  padding: 2px 2px;
  position: relative;
  vertical-align: top;
}

:deep(.ProseMirror td p),
:deep(.ProseMirror th p) {
  margin-block-start: 0.25em;
  margin-block-end: 0.25em;
}

:deep(.ProseMirror th) {
  background-color: #f8fafc;
  font-weight: bold;
  text-align: left;
}

:deep(.ProseMirror .selectedCell:after) {
  background: rgba(59, 130, 246, 0.1);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

:deep(.ProseMirror .column-resize-handle) {
  background-color: #3b82f6;
  bottom: -2px;
  pointer-events: none;
  position: absolute;
  right: -2px;
  top: 0;
  width: 4px;
}

:deep(.ProseMirror .tableWrapper) {
  margin: 1.5rem 0;
  overflow-x: auto;
}

:deep(.ProseMirror.resize-cursor) {
  cursor: ew-resize;
  cursor: col-resize;
}

/* 增强代码块样式 - 覆盖默认的 codeBlock */
:deep(.ProseMirror .code-block-enhanced-wrapper) {
  margin: 1rem 0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
}

:deep(.ProseMirror .code-block-enhanced) {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  margin: 1rem 0;
  overflow: hidden;
}

:deep(.ProseMirror .code-block-enhanced code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

/* 确保所有代码块都使用增强样式 */
:deep(.ProseMirror .code-block-enhanced) {
  background: #1a1a1a !important;
  color: #ffffff !important;
  border-radius: 6px;
  margin: 1rem 0;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  word-wrap: normal;
  border: 2px solid #e2e8f0;
  display: block;
  width: 100%;
}

:deep(.ProseMirror pre) {
  background: #0f172a !important;
  color: #f1f5f9 !important;
  border-radius: 6px;
  margin: 1rem 0;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  word-wrap: normal;
  border: 2px solid #e2e8f0;
}

:deep(.ProseMirror pre code) {
  background: transparent !important;
  color: inherit !important;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

/* 光标样式 */
:deep(.ProseMirror .ProseMirror-cursor),
:deep(.ProseMirror-focused .ProseMirror-cursor) {
  border-left: 3px solid #3b82f6 !important;
}

    /* Vue组件样式 */
    :deep(.vue-text-btn-demo-wrapper) {
      margin: 1rem 0;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 1rem;
    }

    :deep(.vue-text-btn-demo-wrapper .button-group) {
      display: flex;
      gap: 8px;
      margin-bottom: 1rem;
    }

    :deep(.vue-text-btn-demo-wrapper button) {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    :deep(.vue-text-btn-demo-wrapper button:hover) {
      background: #2563eb;
    }

    :deep(.vue-text-btn-demo-wrapper .delete-button) {
      background: #ef4444;
    }

    :deep(.vue-text-btn-demo-wrapper .delete-button:hover) {
      background: #dc2626;
    }

    :deep(.vue-text-btn-demo-wrapper .editable-content) {
      border: 1px dashed #d1d5db;
      padding: 8px;
      min-height: 40px;
      background: white;
      border-radius: 4px;
    }

    /* Mermaid组件样式 */
    :deep(.vue-mermaid) {
      margin: 1rem 0;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 1rem;
    }

    :deep(.vue-mermaid .mermaid-header) {
      display: flex;
      gap: 8px;
      margin-bottom: 1rem;
      align-items: center;
    }

    :deep(.vue-mermaid .edit-button) {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    :deep(.vue-mermaid .edit-button:hover) {
      background: #2563eb;
    }

    :deep(.vue-mermaid .delete-button) {
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    :deep(.vue-mermaid .delete-button:hover) {
      background: #dc2626;
    }

    :deep(.vue-mermaid .mermaid-view) {
      min-height: 100px;
    }

    :deep(.vue-mermaid .mermaid-edit) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      min-height: 300px;
    }

    :deep(.vue-mermaid .mermaid-preview),
    :deep(.vue-mermaid .mermaid-editor) {
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 1rem;
      background: white;
    }

    :deep(.vue-mermaid .mermaid-preview h4),
    :deep(.vue-mermaid .mermaid-editor h4) {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.vue-mermaid .mermaid-diagram) {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    :deep(.vue-mermaid .mermaid-diagram svg) {
      max-width: 100%;
      height: auto;
    }

    :deep(.vue-mermaid .mermaid-error) {
      color: #ef4444;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 4px;
      min-height: 100px;
    }

    :deep(.vue-mermaid .mermaid-error p) {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    :deep(.vue-mermaid .mermaid-error pre) {
      margin: 0;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    :deep(.vue-mermaid .mermaid-textarea) {
      width: 100%;
      height: 200px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
      resize: vertical;
      outline: none;
    }

    :deep(.vue-mermaid .mermaid-textarea:focus) {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

/* 输出容器样式 */
.output-container {
  margin: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.output-section {
  margin-bottom: 15px;
}

.output-section:last-child {
  margin-bottom: 0;
}

.output-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #374151;
}

.output-section pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
}

/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}

/* 输出容器样式 */
.output-container {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.output-section {
  margin-bottom: 15px;
}

.output-section:last-child {
  margin-bottom: 0;
}

.output-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #374151;
}

.output-section pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
}

/* 链接编辑对话框 */
.link-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.link-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
}

/* 预览模式样式 */
:deep(.ProseMirror[contenteditable="false"]) {
  background: #fafafa;
  cursor: default;
}

:deep(.ProseMirror[contenteditable="false"] *) {
  cursor: default !important;
}

/* Gapcursor 样式 - 参考官方实现 */
.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
  z-index: 10;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 2px solid #3b82f6;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

/* 确保 gapcursor 在所有情况下都可见 */
:deep(.ProseMirror-gapcursor) {
  display: none !important;
  pointer-events: none;
  position: absolute;
  z-index: 10;
}

:deep(.ProseMirror-gapcursor:after) {
  content: "" !important;
  display: block !important;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 2px solid #3b82f6 !important;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

:deep(.ProseMirror-focused .ProseMirror-gapcursor) {
  display: block !important;
}
</style>