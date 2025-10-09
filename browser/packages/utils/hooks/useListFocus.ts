/**
 * useListFocus Hook
 * 
 * 这是一个用于实现列表键盘导航功能的 Vue 3 Hook，提供了：
 * - 上下箭头键导航
 * - Enter 键选择
 * - 循环导航支持
 * - 默认焦点设置
 */

import { Directive, ObjectDirective } from 'vue'
import { MaybeComputedElementRef, unrefElement, useEventListener } from '@vueuse/core'

/**
 * 列表焦点选项接口
 */
interface UseListFocusProps {
  target?: HTMLElement    // 目标元素
  list?: HTMLElement      // 列表元素
  defaultFirst?: boolean  // 是否默认聚焦第一项
  loop?: boolean          // 是否循环导航
}

/**
 * 列表焦点控制 Hook
 * @param el 目标元素
 * @param props 配置选项
 * @returns 停止函数
 */
export function useListFocus(el: MaybeComputedElementRef, props?: UseListFocusProps) {
  const list = () => unrefElement(props?.list ?? el)!  // 获取列表元素
  
  // 监听键盘事件
  const stop = useEventListener(props?.target ?? el as any, 'keydown', e => {
    // 只处理上下箭头键和回车键
    if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return
    e.stopPropagation()
    e.preventDefault()
    
    // 计算移动方向
    const i = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0
    const ul = list()
    const li = ul.querySelector('.focused') ?? ul.querySelector('.selected')
    const curr = li?.getAttribute('data-index') || -1
    
    // 查找下一个元素
    let next = ul.querySelector(`[data-index="${+curr + i}"]`)
    if (!next && props?.loop) {
      // 循环导航：到达边界时跳转到另一端
      next = i > 0 ? ul.querySelector(`[data-index="0"]`) : ul.querySelector(`[data-index]:last-child`)
    }
    
    if (next) {
      ul.classList.add('element-focused')
      li?.classList.remove('focused')
      next.classList.add('focused')
    }
    
    // 回车键选择当前项
    if (e.key == 'Enter') {
      li?.click()
    }
  }, { capture: true })

  // 设置默认焦点
  ;(() => {
    if (props?.defaultFirst) {
      const ul = list()
      const li = ul.querySelector('.focused') ?? ul.querySelector('.selected')
      if (li) return  // 已有焦点项
      const next = ul.querySelector(`[data-index="0"]`)
      if (!next) return
      ul.classList.add('element-focused')
      next.classList.add('focused')
    }
  })()
  
  return { stop }
}

/**
 * 列表焦点指令
 * 用于在模板中直接使用列表焦点功能
 */
export const vListFocus: ObjectDirective<HTMLElement, UseListFocusProps> = {
  mounted(el, binding) {
    ;(el as any).__useListFocus ??= useListFocus(el, binding.value)
  },
  unmounted(el) {
    ;(el as any).__useListFocus.stop()
  }
}