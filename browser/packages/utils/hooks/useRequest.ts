/**
 * useRequest Hook
 * 
 * 这是一个用于处理异步请求的 Vue 3 Hook，提供了：
 * - 请求状态管理 (loading, data, error)
 * - 请求生命周期钩子
 * - 自动/手动请求控制
 * - 请求取消功能
 * - 依赖追踪
 */

import { isPromise } from '@vue/shared'
import { reactive, watchPostEffect, onBeforeUnmount, toRef, watch } from 'vue'

/**
 * 将对象转换为 ref 对象
 * @param obj 要转换的对象
 * @returns ref 对象
 */
function toRefs(obj) {
  const ret = {}
  for (const k in obj) ret[k] = toRef(() => obj[k])
  return ret
}

/**
 * 请求配置类型
 */
type Config<T, A> = Partial<{
  onBefore(params: A): void      // 请求前钩子
  onSuccess(data: T): void       // 请求成功钩子
  onError(...args): void         // 请求失败钩子
  onFinally(): void              // 请求完成钩子
  defaultParams: A               // 默认参数
  /**@default false  */
  manual: boolean                // 是否手动触发
  /**@default true */
  trackDep: boolean              // 是否追踪依赖
}>

/**
 * 函数返回值类型推断
 */
type UnFn<T> =
  T extends () => Promise<infer R> ? R :
  T extends () => infer R ? R :
  any

/**
 * 请求 Hook
 * @param reqFn 请求函数
 * @param config 配置选项
 * @returns 请求状态和方法
 */
export function useRequest<F extends (...args) => any, T = UnFn<F>, A = Parameters<F>>(reqFn: F, config?: Config<T, A>) {
  config = { trackDep: true, ...config }
  
  // 请求状态
  const state = reactive({
    loading: !config.manual,    // 加载状态
    data: undefined as T,       // 请求数据
    params: <A>[],             // 请求参数
    error: undefined,          // 错误信息
  })

  let interrupt = () => { }    // 中断函数

  /**
   * 执行请求
   * @param args 请求参数
   * @returns 请求结果
   */
  function __run(...args: Parameters<F>) {
    interrupt()
    let interrupted = false
    try {
      config.onBefore?.(args as A)
      state.loading = true
      const req = reqFn.apply(null, args)
      state.params = args as any
      return isPromise(req)
        ? Promise.race([req, new Promise((s, j) => interrupt = () => { interrupted = true; j() })])
        : req
    } catch (e) {
      if (interrupted) return
      state.loading = false
      state.error = e
      if (config.onError) config.onError?.(e)
      else throw e
    } finally {
      state.loading = false
      config.onFinally?.()
    }
  }

  /**
   * 处理请求结果
   * @param ret 请求结果
   * @returns 处理后的数据
   */
  async function __after(ret) {
    state.data = isPromise(ret) ? await ret : ret
    state.loading = false
    config.onSuccess?.(state.data as T)
    return state.data
  }

  /**
   * 手动执行请求
   * @returns 请求结果
   */
  async function run() {
    return __after(__run(config.defaultParams))
  }

  /**
   * 刷新请求
   * 使用上次的参数重新执行请求
   * @returns 请求结果
   */
  function refresh() {
    return __after(__run(state.params))
  }

  /**
   * 取消请求
   */
  function cancel() {
    interrupt()
  }

  // 自动执行请求
  if (!config.manual) {
    if (config.trackDep) {
      // 追踪依赖变化
      let stop = watch(() => __run(config.defaultParams), __after, { immediate: true, flush: 'post' })
      onBeforeUnmount(stop)
    } else {
      // 直接执行
      run()
    }
  }

  return {
    ...toRefs(state),  // 响应式状态
    run,               // 手动执行
    refresh,           // 刷新
    cancel             // 取消
  }
}
