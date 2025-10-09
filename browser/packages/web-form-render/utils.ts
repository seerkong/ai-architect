/**
 * web-form-render 工具函数模块
 * 
 * 提供表单渲染相关的工具函数，包括：
 * - 标签和属性解析
 * - 选项数据处理
 * - 数据转换器 (transformer)
 */

import { Ref, ref, toRaw, toValue } from 'vue'
import { isArray } from '@vue/shared'
import { camelize, isPromise, isString } from '@vue/shared'
import { del, get, set, unFn } from '@el-lowcode/utils'
import { Item, Item0, NormalizedOpt, Opt } from './props'

/**
 * 解析标签属性 (label prop)
 * 将字符串或数组格式转换为 [label, prop] 格式
 */
const solveLP = (lp: Item['lp']) => isArray(lp) ? lp : (lp ? [lp, camelize(lp!)] : [])

/**
 * 标签属性类型
 */
type LP = Pick<Item, 'lp'> & {
  label?: string
  prop?: string
}

/**
 * 获取标签文本
 * 优先使用 item.label，否则从 lp 属性解析
 */
export const label = (item: LP) => item.label || solveLP(item.lp)[0]

/**
 * 获取属性名
 * 优先使用 item.prop，否则从 lp 属性解析并转换为驼峰命名
 */
export const prop = (item: LP) => item.prop || solveLP(item.lp)[1]

/**
 * 标准化表单项
 * 解析标签、属性和选项数据
 */
export const normalizeItem = (item: Item) => ({
  label: label(item),
  prop: prop(item),
  ...item,
  options: solveOptions(item.options),
})

// 选项缓存，避免重复处理
const waekMap = new WeakMap<any, Ref<NormalizedOpt[]>>()

/**
 * 解析选项数据
 * 支持同步和异步选项，并进行缓存优化
 */
export const solveOptions = (opts?: Item['options']) => {
  if (!opts) return undefined
  if (waekMap.has(opts)) return waekMap.get(opts)!.value
  const ret = ref<NormalizedOpt[]>([])
  waekMap.set(opts, ret)
  
  // 解析选项数据
  const val = unFn(opts)
  if (isPromise(val)) val.then(val => ret.value = val.map(normalizeOpt))
  else ret.value = val.map(normalizeOpt)
  
  return ret.value
}

/**
 * 获取选项显示文本
 * 优先使用 label，否则使用 value
 */
export const showOpt = (opt?: NormalizedOpt) => opt?.label ?? opt?.value

/**
 * 标准化选项格式
 * 将不同格式的选项统一为 NormalizedOpt 格式
 */
const normalizeOpt = (opt: Opt): NormalizedOpt => 
  isString(opt) ? ({ label: opt, value: opt }) : 
  isArray(opt) ? { label: opt[0], value: opt[1] } : 
  opt

/**
 * 数据转换器 Hook
 * 
 * 这是表单数据绑定的核心机制，负责：
 * 1. 从模型中获取值
 * 2. 向模型中设置值
 * 3. 处理默认值和显示值
 * 4. 支持自定义的 get/set/out 函数
 * 
 * @param _model 数据模型
 * @param _prop 属性路径
 * @param opt 转换选项
 * @returns 返回一个类似 ref 的对象，支持 .value 和 .v 访问
 */
export const useTransformer = (_model, _prop, opt: Pick<Item0, 'defaultValue' | 'displayValue' | 'get' | 'set' | 'out'> & { untrackedGet?: boolean; silentSet?(v, model): any } = {}) => {
  const ret = {
    /**
     * 获取值
     * 从模型中读取指定属性的值，并应用各种转换
     */
    get() {
      const model = toValue(_model), prop = toValue(_prop)
      if (prop == null) return
      
      // 从模型中获取值
      let v = get(opt.untrackedGet ? toRaw(model) : model, prop)
      
      // 应用自定义获取函数
      if (opt.get) v = opt.get(v, model)
      
      // 处理默认值
      if (opt.defaultValue !== undefined && (v === undefined || v === '')) {
        set(model, prop, v = unFn(opt.defaultValue))
      }
      
      // 处理显示值
      if (opt.displayValue !== undefined && (v === undefined || v === '')) {
        v = unFn(opt.displayValue)
      }
      
      return v
    },
    
    /**
     * 设置值
     * 向模型中设置指定属性的值，并应用各种转换
     */
    set(v) {
      const model = toValue(_model), prop = toValue(_prop)
      if (prop == null) return
      
      // 静默设置模式
      if (opt.silentSet) {
        set(toRaw(model), prop, opt.silentSet(v, model))
      } 
      // 自定义设置函数
      else if (opt.set) {
        set(model, prop, opt.set(v, model))
      } 
      // 直接设置
      else {
        set(model, prop, v)
      }
      
      // 应用输出函数
      if (opt.out) Object.assign(model, opt.out(v, model))
      
      // 检查是否需要清理显示值
      v = get(model, prop)
      if (opt.displayValue !== undefined && v === unFn(opt.displayValue)) {
        del(toRaw(model), prop)
      }
    },
    
    // 支持 .v 访问器
    get v() { return this.get() },
    set v(v) { this.set(v) },

    // 支持 .value 访问器
    get value() { return this.get() },
    set value(v) { this.set(v) },
    
    // 标记为 ref 对象
    __v_isRef: true,
  }
  return ret as typeof ret & Ref<any>
}
