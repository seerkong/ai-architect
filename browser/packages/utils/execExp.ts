/**
 * 表达式执行工具模块
 * 
 * 这个模块提供了 DSL 中表达式的解析和执行功能，支持：
 * - 双花括号表达式解析 ({{ expression }})
 * - 表达式执行和上下文注入
 * - 深度表达式包装和解析
 */

import { isString } from '@vue/shared'
import { ref, reactive, watch, watchEffect, toValue } from 'vue'
import { Fnable, get, Obj, set } from './index'

/**
 * 表达式正则表达式
 * 匹配 {{ expression }} 格式的表达式
 */
export const expReg = /^\{\{([\d\D]*)\}\}$/

/**
 * 检查字符串是否为表达式
 * @param exp 要检查的字符串
 * @returns 是否为表达式格式
 */
export const isExp = exp => isString(exp) && exp.startsWith('{{') && exp.endsWith('}}')

/**
 * 提取表达式内容
 * 移除双花括号，返回表达式内容
 * @param exp 表达式字符串
 * @returns 表达式内容
 */
export const unExp = exp => (isExp(exp) ? exp.replace(expReg, '$1') : exp)

/**
 * 包装表达式
 * 为表达式添加双花括号
 * @param exp 表达式内容
 * @returns 包装后的表达式
 */
export const wrapExp = exp => `{{${unExp(exp).trim()}}}`

// 工具函数对象
const _ = { get, set }

// 提供给表达式的全局变量
const provideVars = { ref, reactive, watch, watchEffect, _ }

/**
 * 初始化状态
 * 执行状态字符串并返回结果
 * @param state 状态字符串
 * @returns 执行结果
 */
export function initState(state: string) {
  const exec = new Function(...Object.keys(provideVars), state)
  return exec(...Object.values(provideVars))
}

/**
 * 执行表达式
 * 解析并执行双花括号表达式
 * @param any 要执行的表达式或值
 * @param ctx 执行上下文
 * @returns 执行结果
 */
export function execExp(any: unknown, ctx: Fnable<Obj>) {
  if (!isExp(any)) return any
  try {
    const vars = { ...toValue(ctx), ...provideVars }
    const func = new Function(...Object.keys(vars), `return ${unExp(any)}`)
    return func(...Object.values(vars))
  } catch (e) {
    console.error('exec expression error:', unExp(any), toValue(ctx))
    throw e
  }
}

// 字面量类型集合
const literals = new Set(['NumericLiteral', 'StringLiteral', 'BooleanLiteral', 'NullLiteral'])

/**
 * 深度表达式包装函数
 * 使用 Babel 解析 JavaScript 代码，将非字面量表达式包装为双花括号格式
 * @returns 深度包装函数
 */
export async function deepWrapExp() {
  const { parseExpression } = await import('@babel/parser')
  const { stringLiteral } = await import('@babel/types')
  const generator = await import('@babel/generator').then(e => e.default)
  const { walk } = await import('estree-walker')
  const JSON5 = await import('https://unpkg.com/json5@2.2.3/dist/index.min.mjs').then(e => e.default)

  return (js: string) => {
    const node = parseExpression(js)
    // 如果是字面量，直接返回其值
    if (literals.has(node.type)) return node.value
    // 如果不是对象或数组表达式，直接包装
    if (node.type != 'ObjectExpression' && node.type != 'ArrayExpression') return wrapExp(js)
    
    // 遍历 AST 节点，将非字面量表达式包装为字符串
    const xxx = walk(node, {
      enter(node, parent, k) {
        const { type } = node
        // 跳过对象和数组表达式本身
        if (type == 'ObjectExpression' || type == 'ArrayExpression' || type == 'ObjectProperty') return
        
        // 处理数组元素和对象属性
        if (parent?.type == 'ArrayExpression' || (parent?.type == 'ObjectProperty')) {
          if (k == 'key') {
            // 由于 JSON5.parse 不支持数字 key，所以这里将数字 key 转为字符串 key
            if (typeof node.value == 'number') this.replace(stringLiteral(`${node.value}`))
            return
          }
          // 如果是字面量，跳过包装
          if (literals.has(type)) return
        }
        
        // 处理序列表达式
        if (type == 'SequenceExpression') {
          node.start--
          node.end++
        }
        // 将表达式包装为字符串字面量
        this.replace(stringLiteral(wrapExp(js.slice(node.start, node.end))))
        this.skip()
      }
    })
    return JSON5.parse(generator(xxx).code)
  }
}
