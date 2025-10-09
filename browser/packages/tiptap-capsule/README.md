# TipTap Editor Capsule

一个可复用的TipTap富文本编辑器组件，包含完整的工具栏功能。

## 特性

- ✅ 完整的工具栏（格式化、标题、列表、对齐、插入功能、表格操作）
- ✅ 内置表格扩展（支持自定义属性如x-id）
- ✅ 内置Vue组件扩展（通过开关控制）
- ✅ 响应式状态同步
- ✅ 回调函数支持（HTML/JSON变化）
- ✅ ref方法暴露（获取HTML/JSON内容）
- ✅ 双向数据绑定

## 安装

```bash
npm install tiptap-editor-capsule
```

## 基本使用

```vue
<template>
  <div>
    <TiptapEditorCapsule 
      v-model="content"
      @html-present-changed="handleHtmlChange"
      @json-present-changed="handleJsonChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TiptapEditorCapsule } from 'tiptap-editor-capsule'

const content = ref('<p>Hello World!</p>')

const handleHtmlChange = (html) => {
  console.log('HTML changed:', html)
}

const handleJsonChange = (json) => {
  console.log('JSON changed:', json)
}
</script>
```

## 高级使用（启用Vue组件）

```vue
<template>
  <div>
    <TiptapEditorCapsule 
      ref="editorRef"
      v-model="content"
      :enable-vue-text-btn-demo="true"
      @html-present-changed="handleHtmlChange"
      @json-present-changed="handleJsonChange"
    />
    
    <button @click="getContent">获取内容</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TiptapEditorCapsule } from 'tiptap-editor-capsule'

const editorRef = ref()
const content = ref('<p>Hello World!</p>')

const handleHtmlChange = (html) => {
  console.log('HTML changed:', html)
}

const handleJsonChange = (json) => {
  console.log('JSON changed:', json)
}

const getContent = () => {
  const html = editorRef.value.getHTML()
  const json = editorRef.value.getJSON()
  console.log('HTML:', html)
  console.log('JSON:', json)
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | '' | 编辑器内容（双向绑定） |
| enableVueTextBtnDemo | Boolean | false | 是否启用Vue文本按钮组件 |
| onHtmlPresentChanged | Function | null | HTML内容变化回调 |
| onJsonPresentChanged | Function | null | JSON内容变化回调 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (html: string) | 内容变化时触发 |

## Methods（通过ref调用）

| 方法名 | 返回值 | 说明 |
|--------|--------|------|
| getHTML | string | 获取HTML内容 |
| getJSON | any | 获取JSON内容 |
| editor | Editor | 获取编辑器实例 |

## 工具栏功能

### 基础格式化
- 粗体、斜体、下划线、删除线、代码

### 标题
- 下拉框选择：正文、标题1-6

### 列表
- 无序列表、有序列表

### 文字对齐
- 左对齐、居中、右对齐

### 插入功能
- 表格（内置，支持自定义属性）
- 图片、链接
- Vue组件（通过enableVueTextBtnDemo控制）

### 表格操作
- 插入行/列、删除行/列/表格

## 样式定制

组件使用scoped样式，如需自定义样式，可以通过CSS变量或深度选择器：

```css
.tiptap-editor-capsule {
  --toolbar-bg: #f8fafc;
  --toolbar-border: #e2e8f0;
  --button-active-bg: #3b82f6;
}
```

## 内置扩展

组件内置了以下扩展：

- **表格扩展**: `TableKitWithCustomAttributes` - 支持自定义属性如x-id
- **Vue组件扩展**: `VueTextBtnDemo` - 通过`enableVueTextBtnDemo`开关控制

所有扩展都已预配置，无需额外传入。

## 依赖

- Vue 3
- @tiptap/core
- @tiptap/vue-3
- @tiptap/starter-kit
- @tiptap/extension-text-align
- @tiptap/extension-text-style
- @tiptap/extension-highlight
- @tiptap/extension-color
- @tiptap/extension-link
- @tiptap/extension-placeholder
- @tiptap/extension-image
