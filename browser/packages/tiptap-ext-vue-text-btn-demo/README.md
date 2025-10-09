# Vue Text Button Demo Extension for TipTap

这是一个自定义的TipTap扩展，提供了一个交互式Vue组件，包含一个计数按钮和可编辑的内容区域。

## 功能特性

- ✅ **交互式按钮** - 点击按钮增加计数并更新点击参数
- ✅ **可编辑内容** - 支持富文本编辑的内容区域
- ✅ **属性持久化** - 所有属性（count、buttonText、clickParams、content）在转换为HTML/JSON时完整保留
- ✅ **响应式设计** - 适配不同屏幕尺寸
- ✅ **Vue 3 支持** - 基于Vue 3 Composition API构建

## 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `count` | `number` | `0` | 按钮点击计数 |
| `buttonText` | `string` | `'点击计数'` | 按钮显示文本 |
| `clickParams` | `string` | `'初始值'` | 点击参数信息 |
| `content` | `string` | `'点击上方按钮开始计数，这里可以编辑内容...'` | 可编辑内容 |

## 使用方法

### 1. 安装依赖

```bash
npm install @tiptap/core @tiptap/vue-3 vue@^3.4.0
```

### 2. 导入扩展

```javascript
import { VueTextBtnDemo } from './packages/prosemirror-ext-vue-text-btn-demo/src/index.js'
```

### 3. 配置编辑器

```javascript
import { Editor } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { VueTextBtnDemo } from './packages/prosemirror-ext-vue-text-btn-demo/src/index.js'

const editor = new Editor({
  extensions: [
    StarterKit,
    VueTextBtnDemo.configure({
      HTMLAttributes: {
        class: 'vue-text-btn-demo-wrapper',
      },
      defaultButtonText: '我的按钮',
      defaultCount: 0,
      defaultClickParams: '开始计数',
      defaultContent: '在这里编辑内容...',
    }),
  ],
})
```

### 4. 插入组件

```javascript
// 通过命令插入
editor.commands.insertVueTextBtnDemo({
  count: 0,
  buttonText: '点击计数',
  clickParams: '初始值',
  content: '点击上方按钮开始计数，这里可以编辑内容...'
})

// 或者通过HTML插入
editor.commands.setContent(`
  <vue-text-btn-demo count="0" button-text="点击计数" click-params="初始值">
    <p>This is editable content. Click the button above to increment the counter and edit this text.</p>
  </vue-text-btn-demo>
`)
```

## HTML输出示例

```html
<vue-text-btn-demo count="3" button-text="点击计数" click-params="第3次点击 - 14:30:25">
  <p>这是用户编辑的内容，支持<strong>富文本格式</strong>。</p>
</vue-text-btn-demo>
```

## JSON输出示例

```json
{
  "type": "doc",
  "content": [
    {
      "type": "vueTextBtnDemo",
      "attrs": {
        "count": 3,
        "buttonText": "点击计数",
        "clickParams": "第3次点击 - 14:30:25",
        "content": "<p>这是用户编辑的内容，支持<strong>富文本格式</strong>。</p>"
      }
    }
  ]
}
```

## Vue组件结构

```vue
<template>
  <div class="vue-text-btn-demo">
    <!-- 按钮区域 -->
    <div class="button-section">
      <button @click="incrementCount">点击计数 (3)</button>
      <span class="click-info">点击参数: 第3次点击 - 14:30:25</span>
    </div>
    
    <!-- 可编辑内容区域 -->
    <div 
      class="editable-content"
      contenteditable="true"
      @input="updateContent"
    >
      <p>这是用户编辑的内容，支持<strong>富文本格式</strong>。</p>
    </div>
  </div>
</template>
```

## 样式自定义

组件提供了完整的CSS类名，可以轻松自定义样式：

```css
.vue-text-btn-demo-wrapper {
  /* 组件容器样式 */
}

.vue-text-btn-demo .count-button {
  /* 按钮样式 */
}

.vue-text-btn-demo .click-info {
  /* 点击信息样式 */
}

.vue-text-btn-demo .editable-content {
  /* 可编辑内容样式 */
}
```

## 技术实现

- **Node View**: 使用 `VueNodeViewRenderer` 渲染Vue组件
- **属性管理**: 通过 `addAttributes` 定义和持久化属性
- **HTML解析**: 自定义 `parseHTML` 方法解析HTML结构
- **HTML渲染**: 自定义 `renderHTML` 方法渲染为HTML
- **命令支持**: 提供 `insertVueTextBtnDemo` 命令插入组件

## 兼容性

- ✅ Vue 3.x
- ✅ TipTap 3.x
- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)
- ✅ 移动端浏览器

## 许可证

MIT License
