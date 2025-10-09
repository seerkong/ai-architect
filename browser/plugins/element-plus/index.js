/**
 * Element Plus 插件
 * 
 * 这个插件集成了 Element Plus UI 组件库，提供：
 * 1. 完整的 Element Plus 组件
 * 2. 表单渲染器 (el-form-render)
 * 3. 自定义的日期时间组件
 * 4. 低代码专用的表单和表格组件
 */

import * as ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { ElFormRender } from 'el-form-render'

import DateTime from './date-time'
import Form from './ElFormLcd.vue'
import Table from './ElTableLcd.vue'

// 将 ElementPlus 暴露到全局，供其他模块使用
window.ElementPlus = ElementPlus

export default {
  /**
   * 插件安装函数
   * 注册 Element Plus 组件和自定义组件
   */
  install(app) {
    // 注册 Element Plus 核心组件库
    app.use(ElementPlus)
    
    // 注册 el-form-render 表单渲染器
    app.use(ElFormRender)

    // 注册自定义组件
    app.use(DateTime)                    // 日期时间组件
    app.component(Form.__name, Form)     // 低代码表单组件
    app.component(Table.__name, Table)   // 低代码表格组件
  }
}