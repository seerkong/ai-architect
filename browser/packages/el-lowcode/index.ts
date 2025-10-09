import { h, mergeProps, defineComponent, ref, watch, onUnmounted } from 'vue'
import { isArray, isObject } from '@vue/shared'
import { deepClone, execExp, isExp, toArr, unExp } from '@el-lowcode/utils'
import { createRender } from '@el-lowcode/render'
import { ConfigProvider } from './ConfigProvider'

export * from './ConfigProvider'

const _Render = createRender({ processProps })

export const Render = (props, { slots }) => {
  return h(ConfigProvider, props, {
    ...slots,
    default: ({ schema }) => h(_Render, schema)
  })
}

// 带状态监听功能的Render组件
export const RenderWithState = defineComponent({
  name: 'RenderWithState',
  props: {
    schema: Object,
    onStateChange: Function,
    // onFormDataChange: Function
  },
  setup(props, { expose }) {
    const configRef = ref(null)
    let unsubscribe = null
    
    // 监听configRef的变化，获取el-lowcode的vars
    watch(
      () => configRef.value,
      (newVars) => {
        if (newVars) {
          console.log('[el-lowcode] RenderWithState: vars loaded:', newVars)
          
          // 如果已经有监听器，先取消
          if (unsubscribe) {
            unsubscribe()
          }
          
          // 设置状态监听器
          if (props.onStateChange && newVars.onStateChange) {
            const stateUnsubscribe = newVars.onStateChange(props.onStateChange)
            if (unsubscribe) {
              const prevUnsubscribe = unsubscribe
              unsubscribe = () => {
                prevUnsubscribe()
                stateUnsubscribe()
              }
            } else {
              unsubscribe = stateUnsubscribe
            }
          }
          
          // 设置表单数据监听器
          // if (props.onFormDataChange && newVars.onFormDataChange) {
          //   const formDataUnsubscribe = newVars.onFormDataChange(props.onFormDataChange)
          //   if (unsubscribe) {
          //     const prevUnsubscribe = unsubscribe
          //     unsubscribe = () => {
          //       prevUnsubscribe()
          //       formDataUnsubscribe()
          //     }
          //   } else {
          //     unsubscribe = formDataUnsubscribe
          //   }
          // }
        }
      },
      { immediate: true }
    )
    
    // 组件卸载时取消监听
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
        console.log('[el-lowcode] RenderWithState: Unsubscribed from state changes')
      }
    })
    
    // 暴露vars和工具方法
    const exposed = {
      vars: configRef,
      getCurrentState: () => configRef.value?.getCurrentState?.(),
      getCurrentFormData: () => configRef.value?.getCurrentFormData?.()
    }
    
    expose(exposed)
    
    return () => h(ConfigProvider, { 
      ref: configRef,
      schema: props.schema,
      state: props.schema?.state
    }, {
      default: ({ vars, schema }) => h(_Render, schema)
    })
  }
})

export function processProps(props, vars) {
  const { vModels, children, ..._props } =  props
  props = _props

  props = deepClone(props, e => execExp(e, vars))
  props.children = execExp(children, vars)

  if (vModels) {
    const spread1 = {}, spread2 = {}
    for (const key in vModels) {
      const val = toArr(vModels[key])
      const [exp, modifiers, event] = [val[0], val[1], val[2] || [`onUpdate:${key}`, `{{v => v}}`]]
      const ids = unExp(exp).split(/\??\./)
      spread2[key] = execExp(`{{${ids.join('?.')}}}`, vars)
      spread1[event[0]] = execExp(`{{v => _.set(${ids[0]}, '${ids.slice(1).join('.')}', (${unExp(event[1])})(v))}}`, vars)
      if (modifiers) spread1[key == 'modelValue' ? 'modelModifiers' : `${key}Modifiers`] = modifiers
    }
    props = mergeProps(spread1, props, spread2)
  }

  return props
}

export function cloneObj(obj, vars, bool = v => true) {
  const ret = isArray(obj) ? [] : {}
  for (const k in obj) {
    if (isExp(obj[k])) {
      Object.defineProperty(ret, k, { get() { return execExp(obj[k], vars) }, enumerable: true })
    }
    else {
      const desc = Object.getOwnPropertyDescriptor(obj, k)!
      if (isObject(desc.value) && bool(desc.value)) ret[k] = cloneObj(desc.value, vars, bool)
      else Object.defineProperty(ret, k, desc)
    }
  }
  return ret
}