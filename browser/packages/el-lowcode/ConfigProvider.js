/**
 * el-lowcode 配置提供者组件
 * 
 * 这是 el-lowcode 的核心组件，负责：
 * 1. 管理全局状态和配置
 * 2. 加载插件系统
 * 3. 提供数据源管理
 * 4. 处理状态变化监听
 * 5. 为子组件提供变量作用域
 */

import { computed, defineComponent, getCurrentInstance, isRef, onUnmounted, unref, provide, reactive, renderSlot, toRefs, watch, watchEffect, toValue, h } from 'vue'
import { isFunction, isString } from '@vue/shared'
import { toReactive } from '@vueuse/core'
import { execExp, useRequest } from '@el-lowcode/utils'
import { cloneObj } from './index'

/**
 * 数据源类型处理器
 * 定义了不同类型数据源的处理逻辑
 */
const dsType = {
  /**
   * HTTP 请求数据源
   * 支持 GET/POST 请求，自动处理参数和响应
   * 
   * @param e 数据源配置对象
   * @param vars 当前变量作用域
   * @returns 返回 useRequest 的结果
   */
  fetch: (e, vars) => {
    // todo stop
    return useRequest(async () => {
      const { options: { uri, method, params, ...options }, dataHandler } = cloneObj(reactive(e), vars)
      // 构建请求 URL
      const url = method == 'GET' ? `${uri}${uri.includes('?') ? '&' : '?'}${new URLSearchParams(params).toString()}` : uri
      // 构建请求体
      const body = method == 'GET' ? void 0 : JSON.stringify(params)
      // 发送请求
      const ret = await fetch(url, { method, body, ...options }).then(e => e.json())
      // 处理响应数据
      return dataHandler ? dataHandler(ret) : ret
    }, {
      manual: !unref(execExp(e.isInit, vars))  // 是否手动触发
    })
  }
}

/**
 * ConfigProvider 组件的属性定义
 */
const props = {
  fetch: Function,    // 数据获取函数
  schema: Object      // DSL 配置对象
}

/**
 * ConfigProvider 主组件
 * 负责管理全局状态、插件加载和变量作用域
 */
export const ConfigProvider = defineComponent({
  inheritAttrs: false,
  props,
  setup(props, { slots, expose }) {
    // 获取 schema 数据，支持多种方式：
    // 1. 字符串 URL：通过 fetch 获取
    // 2. 函数：直接调用获取
    // 3. 对象：直接使用
    const { data: schema, loading } = useRequest(() => 
      isString(props.fetch) ? fetch(props.fetch).then(e => e.json()) :
      isFunction(props.fetch) ? props.fetch() :
      props.schema
    )
    
    // 创建配置提供者，管理状态、数据源等
    const vars = reactive(useConfigProvider(toReactive(computed(() => schema.value ?? {}))))

    // 状态变化监听机制
    const stateListeners = new Set()      // 状态变化监听器集合
    // const formDataListeners = new Set()   // 表单数据变化监听器集合
    
    // 监听全局状态变化
    watch(
      () => vars.state,
      (newState) => {
        console.log('[el-lowcode] State changed:', newState)
        stateListeners.forEach(listener => {
          try {
            listener(newState)
          } catch (error) {
            console.error('[el-lowcode] State listener error:', error)
          }
        })
      },
      { deep: true, immediate: true }
    )
    
    // 监听表单数据变化
    // watch(
    //   () => vars.state?.formData,
    //   (newFormData) => {
    //     console.log('[el-lowcode] FormData changed:', newFormData)
    //     formDataListeners.forEach(listener => {
    //       try {
    //         listener(newFormData)
    //       } catch (error) {
    //         console.error('[el-lowcode] FormData listener error:', error)
    //       }
    //     })
    //   },
    //   { deep: true, immediate: true }
    // )
    
    // 创建暴露给外部的变量对象
    const exposedVars = reactive({
      ...vars,  // 包含所有配置变量
      
      // 状态监听方法
      onStateChange: (listener) => {
        console.log('[el-lowcode] onStateChange listener added')
        stateListeners.add(listener)
        return () => stateListeners.delete(listener)  // 返回取消监听的函数
      },
      
      // 表单数据监听方法
      // onFormDataChange: (listener) => {
      //   console.log('[el-lowcode] onFormDataChange listener added')
      //   formDataListeners.add(listener)
      //   return () => formDataListeners.delete(listener)  // 返回取消监听的函数
      // },
      
      // 获取当前状态的方法
      getCurrentState: () => vars.state,
      // getCurrentFormData: () => vars.state?.formData
    })

    console.log('[el-lowcode] exposedVars created:', exposedVars)
    console.log('[el-lowcode] exposedVars keys:', Object.keys(exposedVars))
    console.log('[el-lowcode] onStateChange type:', typeof exposedVars.onStateChange)

    // 向子组件提供变量作用域
    provide('vars', exposedVars)
    // 向父组件暴露变量和方法
    expose(exposedVars)

    // 渲染函数：根据加载状态渲染不同内容
    return () =>
      vars.loading || loading.value ? h('div', renderSlot(slots, 'loading')) :  // 加载中
      !schema.value ? h('div', renderSlot(slots, 'empty', { vars }, () => [h('div', { style: 'opacity: .4; text-align: center; padding: 1em' }, 'Empty')])) :  // 空状态
      renderSlot(slots, 'default', { vars, schema: schema.value })  // 正常渲染
  }
})

/**
 * 配置提供者 Hook
 * 创建和管理全局配置状态
 * 
 * @param props 配置属性
 * @returns 返回响应式配置对象
 */
export function useConfigProvider(props) {
  const config = reactive({})

  // 创建响应式状态
  config.state = computed(() => {
    return reactive(cloneObj(props.state, config, v => !isRef(v)))
  })

  // 创建数据源管理
  config.ds = computed(() => {
    const { list = [] } = props.ds || {}
    return reactive(list.reduce((o, e) => (o[e.id] = computed(() => dsType[e.type](e, config)), o), {}))
  })

  // 动态样式管理
  const css = document.createElement('style')
  watchEffect(() => css.innerText = props.css)
  onUnmounted(() => css.remove())

  const ins = getCurrentInstance()
  config.loading = false
  const loaded = {}  // 已加载的插件缓存

  // 插件加载监听
  watch(() => [...props.plugins || []], async (urls, old) => {
    if (JSON.stringify(urls) == JSON.stringify(old)) return
    if (!urls?.length) return
    
    try {
      config.loading = true
      await loadPlugins(urls)
    } finally {
      config.loading = false
    }
  }, { immediate: true })
  
  /**
   * 加载插件
   * 支持递归加载插件的依赖插件
   * 
   * @param urls 插件 URL 数组
   */
  async function loadPlugins(urls = []) {
    return await Promise.all(urls.map(async url => {
      if (loaded[url]) return  // 避免重复加载
      loaded[url] = 1
      
      // 动态导入插件
      const plugin = (await import(/* @vite-ignore */ url + '/index.js')).default
      
      // 递归加载插件的依赖
      await loadPlugins(plugin.plugins)
      
      // 注册插件到 Vue 应用
      ins.appContext.app.use(plugin)
    }))
  }

  // 返回响应式配置的 refs
  return toRefs(config)
}