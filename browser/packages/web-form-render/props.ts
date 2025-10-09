/**
 * web-form-render 属性定义模块
 * 
 * 定义了原生 HTML 表单渲染组件的属性类型和基础配置。
 * 这些属性与 el-form-render 保持兼容，确保 DSL 配置的一致性。
 */

import { ExtractPropTypes, PropType } from 'vue'
import { Fnable, Obj } from '@el-lowcode/utils'

// import { Awaitable } from '@vueuse/core'
type Awaitable<T> = Promise<T> | T

/**
 * 标准化选项类型
 * 用于统一处理不同格式的选项数据
 */
export type NormalizedOpt = {
  label?: string    // 显示文本
  value: any        // 选项值
  [k: string]: any  // 其他属性
}

/**
 * 选项类型联合
 * 支持字符串、数组或标准化对象格式
 */
export type Opt = string | any[] | NormalizedOpt

/**
 * 表单项渲染组件的基础属性定义
 * 这些属性与 el-form-render 保持兼容
 */
export const formItemRenderPropsBase = {
  is: null,                                                           // 组件类型
  lp: [String, Array] as PropType<string | [string, string]>,        // 标签属性 (label prop)
  type: String,                                                       // 输入类型
  defaultValue: null,                                                 // 默认值
  displayValue: null,                                                 // 显示值
  hide: [Boolean, Function] as PropType<boolean | ((row) => boolean)>, // 是否隐藏
  get: Function as PropType<(val: any, row: any) => any>,             // 值获取函数
  set: Function as PropType<(val: any, row: any) => any>,             // 值设置函数
  out: Function as PropType<(val: any, row: any) => any>,             // 值输出函数
  options: [Array, Object, Function] as PropType<Fnable<Awaitable<Opt[]>>>, // 选项数据
  rules: null,                                                        // 验证规则
  el: Object,                                                         // 元素属性
}

/**
 * 表单项类型定义
 * 包含所有基础属性和额外属性
 */
export type Item = ExtractPropTypes<typeof formItemRenderPropsBase> & Obj
export type Item0 = ExtractPropTypes<typeof formItemRenderPropsBase>
