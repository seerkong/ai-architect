/**
 * 树形数据操作工具
 * 
 * 这个模块提供了对树形数据结构的常用操作，包括：
 * - 查找节点
 * - 查找父节点
 * - 扁平化树
 * - 属性转换
 */

import { isArray, isObject } from '@vue/shared'

/**
 * 默认属性配置
 */
const PROPS = {
  key: 'key',        // 节点唯一标识属性名
  children: 'children', // 子节点属性名
}

/**
 * 在树中查找指定值的节点
 * 使用广度优先搜索算法
 * @param tree 树形数据
 * @param val 要查找的值
 * @param props 属性配置
 * @returns 找到的节点或 undefined
 */
function find<T>(tree: T[], val: any, props: Partial<typeof PROPS>) {
  const attrs = { ...PROPS, ...props }
  const queue = [...tree] as T[]
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i]
    if (item[attrs.key] === val) return item
    isArray(item[attrs.children]) && queue.push(...item[attrs.children])
  }
}

/**
 * 将树形数据扁平化为数组
 * @param tree 树形数据
 * @param childrenKey 子节点属性名
 * @returns 扁平化后的数组
 */
function flat<T>(tree: T[], childrenKey = PROPS.children) {
  const queue = [...tree]
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i]
    isArray(item[childrenKey]) ? queue.push(...item[childrenKey]) :
    isObject(item[childrenKey]) ? queue.push(...Object.values(item[childrenKey])) : void 0
  }
  return queue
}

/**
 * 转换树中节点的属性
 * @param tree 树形数据
 * @param replaces 属性替换配置 [原属性名, 新属性名, 转换函数?]
 * @param childrenKey 子节点属性名
 * @returns 转换后的树
 */
function changeProp<T>(tree: T[], replaces: [string, string, ((val: any, item: T) => any)?][], childrenKey = PROPS.children) {
  const clone = (tree: T[]) => tree.map(e => {
    const cloned = { ...e }
    replaces.forEach(([key, finalKey, fn]) => {
      delete cloned[key]
      cloned[finalKey] = fn ? fn(e[key], e) : e[key]
    })
    if (isArray(cloned[childrenKey])) cloned[childrenKey] = clone(cloned[childrenKey])
    return cloned
  })
  return clone(tree)
}

/**
 * 查找指定节点的父节点
 * @param tree 树形数据
 * @param val 要查找的值
 * @param props 属性配置
 * @param parent 当前父节点
 * @returns 父节点或 undefined
 */
function findParent<T>(tree: T[], val: any, props: Partial<typeof PROPS>, parent?: T): T | undefined {
  const attrs = { ...PROPS, ...props }
  for (const e of tree) {
    if (e[attrs.key] == val) return parent
    if (isArray(e[attrs.children])) {
      const parent = findParent(e[attrs.children], val, attrs, e)
      if (parent) return parent
    }
  }
}

/**
 * 树形数据操作工具集合
 */
export const treeUtils = {
  find,        // 查找节点
  findParent,  // 查找父节点
  flat,        // 扁平化树
  changeProp,  // 属性转换
}
