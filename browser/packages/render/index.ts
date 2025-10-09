/**
 * el-lowcode 渲染引擎核心模块
 * 
 * 这个模块是 el-lowcode 的核心渲染引擎，负责将 DSL 配置转换为 Vue 组件。
 * 它支持条件渲染、循环渲染、动态组件、数据绑定等高级功能。
 */

import { resolveDynamicComponent, VNode, inject, createVNode } from 'vue'
import { hasOwn, isArray, isFunction, isPlainObject, isHTMLTag, isString } from '@vue/shared'
import { Fnable, Arrable, mapValues, Obj, unFn } from '@el-lowcode/utils'

/**
 * DSL 配置对象的类型定义
 * 这是低代码配置的标准格式，定义了组件的各种属性
 */
export type Props = {
  _id?: string                    // 组件唯一标识符
  is?: any                       // 组件类型（HTML标签名或Vue组件）
  vFor?: [string, string?, string?]  // 循环渲染配置 [数据源, 项变量名?, 索引变量名?]
  vIf?: string                   // 条件渲染表达式
  vModels?: Record<string, [string, string[], string[]]>  // 双向数据绑定配置
  scope?: string                 // 作用域变量名
  children?: Fnable<string | number | Props[] | Record<string, Props>>  // 子组件配置
  [k: string]: any               // 其他任意属性
}

/**
 * 处理后的属性类型定义
 * 经过 processProps 处理后的属性，表达式已被解析为实际值
 */
export type ProcessedProps = {
  is?: any
  vFor?: [any[], string?, string?]  // 循环数据已解析为实际数组
  vIf?: boolean                     // 条件表达式已解析为布尔值
  vModels?: Record<string, [string, string[], [string, () => void]]>  // 数据绑定已解析为函数
  children?: Fnable<string | number | ProcessedProps[] | Record<string, ProcessedProps>>
  [k: string]: any
}

/**
 * createRender 函数的配置选项
 */
type CreateRender = {
  defaultIs?: any                                    // 默认组件类型
  processProps?: (props: Props, vars: Obj, aaa) => ProcessedProps  // 属性处理函数
}

/**
 * 创建渲染函数的工厂函数
 * 
 * 这是 el-lowcode 的核心工厂函数，用于创建具有特定配置的渲染器。
 * 支持自定义默认组件类型和属性处理逻辑。
 * 
 * @param defaultIs 默认组件类型，当 DSL 中没有指定 is 时使用
 * @param processProps 属性处理函数，用于解析表达式和转换属性
 * @returns 返回一个渲染函数，该函数接收 DSL 配置并返回 Vue VNode
 */
/*#__NO_SIDE_EFFECTS__*/
export function createRender({ defaultIs, processProps = (props) => props as unknown as ProcessedProps }: CreateRender) {
  /**
   * 内部渲染辅助函数
   * 递归处理子组件，如果是对象则继续渲染，否则直接返回
   */
  const _h = (e, vars) => isPlainObject(e) ? Render(e, vars) : e

  /**
   * 核心渲染函数
   * 将 DSL 配置转换为 Vue VNode
   * 
   * @param props DSL 配置对象
   * @param vars 当前作用域的变量
   * @returns Vue VNode 或 null
   */
  const h = (props: Props, vars: Obj) => {
    // 处理属性：解析表达式、处理数据绑定等
    const { is, vIf, children, ...attrs } = (props as ProcessedProps) = processProps(props, vars, {
      provide: (state) => vars = { ...vars, ...state }  // 提供新的状态变量
    })
    
    // 条件渲染：如果 vIf 为 false，则不渲染
    return !hasOwn(props, 'vIf') || !!unFn(vIf)
      ? createVNode(
          resolveDynamicComponent(is || defaultIs),  // 解析组件类型
          attrs,  // 组件属性

          // 处理子组件，支持多种格式：
          isArray(children) ? { default: () => children.map(e => _h(e, vars)) } :  // 数组格式：渲染多个子组件
          isPlainObject(children) ? mapValues(children, v => (scope) => Temp(v, vars, scope)) :  // 对象格式：具名插槽
          isFunction(children) ? { default: () => { const ret = (children as any)(); return isArray(ret) ? ret.map(e => _h(e, vars)) : ret; } } :  // 函数格式：动态生成子组件
          // todo
          children != null && !isHTMLTag(is) ? { default: () => children } :  // 文本内容
          children  // 其他情况
        )
      : null
  }

  /**
   * 模板渲染函数
   * 用于处理具名插槽和作用域变量
   * 
   * @param props DSL 配置
   * @param vars 当前变量作用域
   * @param scope 插槽作用域变量
   * @returns 渲染结果
   */
  const Temp = (props: Props, vars: Obj, scope) => {
    // 处理作用域变量
    if (props.scope) {
      if (props.scope[0] == '{') {
        // 解构赋值格式：{item, index}
        vars = { ...vars }
        for (const k of props.scope.slice(1, -1).split(',')) vars[k.trim()] = scope[k.trim()]
      } else {
        // 简单赋值格式：item
        vars = { ...vars, [props.scope]: scope }
      }
    }

    // 处理属性
    const { vIf, children } = processProps(props, vars, {
      provide: (state) => vars = { ...vars, ...state }
    })

    // 条件渲染
    return !hasOwn(props, 'vIf') || !!unFn(vIf)
      ? (
        isArray(children) ? children.map(e => _h(e, vars)) :  // 数组：渲染多个子组件
        isPlainObject(children) ? Render(children, vars) :    // 对象：递归渲染
        children  // 其他：直接返回
      )
      : null
  }

  /**
   * 主渲染函数
   * 处理循环渲染和普通渲染
   * 
   * @param props DSL 配置
   * @param vars 变量作用域
   * @returns 渲染结果数组或单个 VNode
   */
  function Render(props: Props, vars: Obj = {}): Arrable<VNode | void | null> {
    // 处理循环渲染 (vFor)
    if (props.vFor) {
      const { vFor } = props
      const { vFor: _vFor } = processProps({ vFor }, vars, {})
      if (isArray(_vFor)) {
        // 遍历数组，为每个项目创建独立的变量作用域
        return _vFor[0].map((item, index) => {
          const for_vars = { 
            [_vFor[1] || 'item']: item,      // 当前项变量
            [_vFor[2] || 'index']: index     // 索引变量
          }
          return h(props, { ...vars, ...for_vars })
        })
      }
    }
    else {
      // 普通渲染
      return h(props, vars)
    }
  }

  /**
   * 返回最终的渲染函数
   * 这个函数会被 Vue 组件使用，通过 inject 获取变量作用域
   */
  return (props) => {
    const vars = inject('vars', void 0) as any  // 从父组件注入变量作用域
    return Render(props, vars)
  }
}

/**
 * 默认渲染器
 * 使用默认配置创建的渲染函数，可以直接使用
 */
export const Render = createRender({})

export default Render