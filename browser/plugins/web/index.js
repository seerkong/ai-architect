/**
 * Web 插件 - 原生 HTML 组件集合
 * 
 * 这个插件提供了基于原生 HTML 元素的组件，用于替代 Element Plus 组件。
 * 主要特点：
 * 1. 使用原生 HTML 标签，减少依赖
 * 2. 与 el-lowcode DSL 完全兼容
 * 3. 支持数据绑定和表单验证
 * 4. 提供完整的表单和表格组件
 */

import { defineAsyncComponent, h } from 'vue'
import { Render } from 'el-lowcode'
import Page from './page'
import Grid from './grid'
// import FormLcd from './form'

export default {
  /**
   * 插件安装函数
   * 注册所有原生 HTML 组件到 Vue 应用
   */
  install(app) {
    // 注册页面和网格组件
    app.use(Page)
    app.use(Grid)
    
    // 注册原生 HTML 表单组件
    app.component('WebFormLcd', defineAsyncComponent(() => import('./form/WebFormLcd.vue')))           // 表单容器
    app.component('WebFormItemRender', defineAsyncComponent(() => import('./form/WebFormItemRender.vue'))) // 表单项包装器
    app.component('WebInput', defineAsyncComponent(() => import('./form/WebInput.vue')))                 // 输入框
    app.component('WebSelect', defineAsyncComponent(() => import('./form/WebSelect.vue')))               // 下拉选择
    app.component('WebTextarea', defineAsyncComponent(() => import('./form/WebTextarea.vue')))           // 多行文本
    app.component('WebRichTextEditor', defineAsyncComponent(() => import('./form/WebRichTextEditor.vue'))) // 富文本编辑器
    app.component('WebMarkdownEditor', defineAsyncComponent(() => import('./form/WebMarkdownEditor.vue'))) // Markdown编辑器
    app.component('WebRadioGroup', defineAsyncComponent(() => import('./form/WebRadioGroup.vue')))       // 单选组
    app.component('WebCheckboxGroup', defineAsyncComponent(() => import('./form/WebCheckboxGroup.vue'))) // 多选组
    app.component('WebRadio', defineAsyncComponent(() => import('./form/WebRadio.vue')))                 // 单选按钮
    app.component('WebCheckbox', defineAsyncComponent(() => import('./form/WebCheckbox.vue')))           // 复选框
    
    // 注册原生 HTML 表格组件
    app.component('WebTableLcd', defineAsyncComponent(() => import('./table/WebTableLcd.vue')))         // 表格容器

    // 注册布局和工具组件
    app.component('AbsoluteLayout', (props, { slots }) => h('div', props, slots))                        // 绝对定位布局
    app.component('VHtml', (props) => h('div', { ...props }))                                            // HTML 渲染

    // 注册富文本和标记组件
    app.component('TipTap', defineAsyncComponent(() => import('./.lowcode/Tiptap.vue')))                 // 富文本编辑器
    app.component('MarkdownIt', defineAsyncComponent(() => import('wc-mdit')))                          // Markdown 渲染
  }
}