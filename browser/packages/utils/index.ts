/**
 * el-lowcode 工具函数库
 * 
 * 这个模块提供了 el-lowcode 所需的各种工具函数，包括：
 * - Vue 组件安装工具
 * - 对象操作工具
 * - 数组处理工具
 * - 函数处理工具
 * - DOM 操作工具
 * - 数据转换工具
 */

import { ref, unref, type App, type Component, type ObjectPlugin } from 'vue'
import { isArray, isFunction, isObject, isPromise } from '@vue/shared'
import { AnyFn, computedAsync } from '@vueuse/core'
import type { AddPrefixToKeys, Arrable, Fnable, Obj } from './types'

// 导出所有子模块
export * from './types'
export * from './tree'
export * from './file'
export * from './execExp'
export * from './uid'
export * from './hooks'
export * from './html2schema'
export * from './prettier'

/**
 * 带安装方法的 SFC 组件类型
 */
type SFCWithInstall<T> = T & ObjectPlugin

/**
 * 组件类型定义
 */
type Comp = Component & { name: string } & ObjectPlugin

/**
 * 为 Vue 组件添加 install 方法
 * 使组件可以作为 Vue 插件使用
 * 
 * @param comp 要安装的组件
 * @param arr 额外的组件数组
 * @returns 带 install 方法的组件
 */
export function withInstall<T extends Comp>(comp: T, arr?: Comp[]) {
  comp.install = (app: App) => {
    app.component(comp.name, comp)
    arr?.forEach(e => app.component(e.name, e))
  }
  return comp as SFCWithInstall<T>
}

// 数字正则表达式，用于检测属性名是否为数字
const numReg = /^\d+$/

/**
 * 获取对象的所有键名，并保持类型安全
 * @param obj 目标对象
 * @returns 键名数组
 */
export const ks = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

/**
 * 将值转换为数组
 * 如果已经是数组则直接返回，否则包装成数组
 * @param arr 要转换的值
 * @returns 数组
 */
export const toArr = <T>(arr?: Arrable<T>) => Array.isArray(arr) ? arr : (arr == null ? [] : [arr])

/**
 * 函数解包类型
 */
type UnFn <T> = T extends (...args) => infer R ? R : T

/**
 * 函数过滤类型
 */
type FilterFn<T> = T extends (...args) => any ? T : never

/**
 * 函数解包工具
 * 如果传入的是函数则调用它，否则直接返回
 * @param fn 函数或值
 * @param args 函数参数
 * @returns 解包后的值
 */
export const unFn = <T extends Fnable<any>>(fn: T, ...args: Parameters<FilterFn<T>>): UnFn<T> => typeof fn == 'function' ? fn(...args) : fn

// 弱映射缓存，用于缓存异步计算结果
const wm = new WeakMap()

/**
 * 值解包工具
 * 支持函数、Promise 和 ref 的解包
 * @param v 要解包的值
 * @param args 函数参数
 * @returns 解包后的值
 */
export function unVal(v, ...args) {
  if (isFunction(v) || isPromise(v)) {
    // 使用缓存避免重复计算
    if (wm.has(v)) return wm.get(v).value
    const ret = computedAsync(() => unFn(v, ...args), void 0, { onError: e => console.error(e) })
    wm.set(v, ret)
    return ret.value
  }
  return unref(v)
}

/**
 * 根据路径获取对象属性值
 * 支持点号分隔的路径和函数路径
 * @param obj 目标对象
 * @param path 属性路径或函数
 * @returns 属性值
 */
export function get(obj: any, path: string | ((...args) => any)) {
  if (typeof path === 'function') return path(obj)
  for (const k of path.split('.')) if (!(obj = obj[k])) break
  return obj
}

/**
 * 根据路径设置对象属性值
 * 支持深层路径设置，自动创建中间对象
 * @param obj 目标对象
 * @param path 属性路径
 * @param val 要设置的值
 * @returns 设置后的对象
 */
export function set<T>(obj: any, path: string, val: T) {
  return path.split('.').reduce((o, k, i, ks) => i == ks.length - 1 ? (o[k] = val) : (o[k] ??= numReg.test(ks[i + 1]) ? [] : {}), obj)
}

/**
 * 根据路径删除对象属性
 * 支持深层路径删除
 * @param obj 目标对象
 * @param path 属性路径
 */
export function del(obj: any, path: string) {
  const arr = path.split('.')
  if (arr.length > 1) delete get(obj, arr.slice(0, -1).join('.'))?.[arr[arr.length - 1]]
  else delete obj[arr[0]]
}

/**
 * 深拷贝对象
 * 支持自定义迭代器和过滤条件
 * @param obj 要拷贝的对象
 * @param iteratee 迭代器函数
 * @param bool 过滤条件函数
 * @returns 拷贝后的对象
 */
export function deepClone(obj?: Record<string | number, any>, iteratee = (v, k) => v, bool = (v) => true) {
  const temp = isArray(obj) ? [] : {}
  for (const k in obj) temp[k] = isObject(obj[k]) && bool(obj[k]) ? deepClone(obj[k], iteratee, bool) : iteratee(obj[k], k)
  return temp
}

/**
 * 异步深拷贝对象
 * 支持异步迭代器
 * @param obj 要拷贝的对象
 * @param iteratee 异步迭代器函数
 * @param bool 过滤条件函数
 * @returns 拷贝后的对象
 */
export async function deepCloneAsync(obj?: Record<string | number, any>, iteratee = (v, k) => v, bool = (v) => true) {
  const temp = isArray(obj) ? [] : {}
  for (const k in obj) temp[k] = isObject(obj[k]) && bool(obj[k]) ? await deepClone(obj[k], iteratee, bool) : await iteratee(obj[k], k)
  return temp
}

/**
 * 根据指定路径将数组转换为对象
 * @param arr 源数组
 * @param path 键路径
 * @returns 转换后的对象
 */
export const keyBy = <T>(arr: T[], path: string) => arr.reduce((o, e) => (o[get(e, path)] = e, o), {}) as Record<string, T>

/**
 * 根据指定路径将数组分组
 * @param arr 源数组
 * @param path 分组路径
 * @returns 分组后的对象
 */
export const groupBy = <T>(arr: T[], path: string) => arr.reduce((o, e) => ((o[get(e, path)] ??= []).push(e), o), {}) as Record<string, T[]>

/**
 * 从对象中选取指定属性
 * @param obj 源对象
 * @param arr 要选取的属性数组
 * @returns 选取后的对象
 */
export const pick = <T extends object, KS extends (keyof T)[]>(obj: T, arr: KS) => arr.reduce((o, k) => (o[k] = obj?.[k], o), {} as Pick<T, KS[number]>)

/**
 * 从对象中排除指定属性
 * @param obj 源对象
 * @param arr 要排除的属性数组
 * @returns 排除后的对象
 */
export const omit = <T extends object, KS extends (keyof T)[]>(obj: T, arr: KS) => pick(obj, Object.keys(obj).filter((e: any) => !arr.includes(e)) as any) as Omit<T, KS[number]>

/**
 * 映射对象的值
 * @param obj 源对象
 * @param fn 映射函数
 * @returns 映射后的对象
 */
export const mapValues = (obj: Obj, fn: AnyFn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]))

/**
 * 设置对象默认值
 * 只设置未定义的属性
 * @param obj 目标对象
 * @param src 默认值对象
 * @returns 合并后的对象
 */
export const defaults = <T1 extends object, T2 extends object>(obj: T1, src: T2) => (Object.keys(src).map(k => obj[k] === undefined && (obj[k] = src[k])), obj) as T1 & T2

/**
 * 为对象键添加前缀
 * @param prefix 前缀
 * @param obj 源对象
 * @returns 添加前缀后的对象
 */
export const prefixedObject = <T extends object, P extends string>(prefix: P, obj: T) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [prefix + k, v])) as AddPrefixToKeys<T, P>

/**
 * 检查数值是否在指定范围内
 * @param v 要检查的值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否在范围内
 */
export const inRange = (v: number, min = 0, max = Infinity) => v >= min && v <= max

/**
 * 深度比较两个值是否相等
 * @param a 值A
 * @param b 值B
 * @returns 是否相等
 */
export const eq = (a, b) => JSON.stringify(a) == JSON.stringify(b)

/**
 * 查找并返回第一个非空结果
 * @param obj 要遍历的数组
 * @param cb 回调函数
 * @returns 第一个非空结果或 undefined
 */
export const findret = <E, R>(obj: E[], cb: (e: E) => (R | void)): R | void => { let ret; for (const e of obj) { ret = cb(e); if (ret) return ret }}

/**
 * 获取元素或矩形的位置信息
 * 如果是元素则调用 getBoundingClientRect，否则直接返回
 * @param arr 元素或矩形数组
 * @returns DOMRect 数组
 */
export function getRects(arr: Arrable<DOMRect | Element> | void): DOMRect[] {
  return toArr(arr as any).map(e => e.nodeType == 1 ? e.getBoundingClientRect() : e)
}

/**
 * 合并多个矩形为一个包围矩形
 * @param arr 矩形或元素数组
 * @returns 合并后的矩形
 */
export function mergeRects(arr: (DOMRect | Element)[]) {
  const rects = getRects(arr)
  let x = rects[0].x, y = rects[0].y, x2 = rects[0].right, y2 = rects[0].bottom
  for (let i = 1; i < rects.length; i++) {
    const e = rects[i]
    x = Math.min(x, e.x)
    x2 = Math.max(x2, e.right)
    y = Math.min(y, e.y)
    y2 = Math.max(y2, e.bottom)
  }
  return new DOMRect(x, y, x2 - x, y2 - y)
}