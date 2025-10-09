/**
 * useSlide Hook
 * 
 * 这是一个用于实现滑动控制功能的 Vue 3 Hook，提供了：
 * - 鼠标拖拽滑动
 * - 键盘控制支持
 * - 数值范围限制
 * - 步长控制
 */

import { computed, ref, Ref, watch, watchEffect } from 'vue'
import { MaybeElementRef, useEventListener, useMagicKeys, useElementHover, useMousePressed, unrefElement } from '@vueuse/core'

// 获取 Ctrl 键状态
const { control } = /*#__PURE__*/ useMagicKeys()

// 全局拖拽计数器
const count = /*#__PURE__*/ ref(0)

/**
 * 滑动选项接口
 */
interface UseSlideOption {
  min: number    // 最小值
  max: number    // 最大值
  step: number   // 步长
} 

/**
 * 滑动控制 Hook
 * @param el 目标元素
 * @param val 数值引用
 * @param props 滑动选项
 */
export function useSlide(el: MaybeElementRef, val: Ref<number>, props: UseSlideOption) {
  const { pressed } = useMousePressed({ target: el })  // 鼠标按下状态
  const hover = useElementHover(el)                    // 鼠标悬停状态

  // 监听拖拽状态变化，更新全局计数器
  watch(() => control.value && pressed.value, v => count.value += v ? 1 : -1)
  
  // 监听悬停状态，更新鼠标样式
  watch(() => control.value && hover.value, v => unrefElement(el)!.style.cursor = v ? 'w-resize' : '')
  
  // 根据全局拖拽状态更新 body 鼠标样式
  watchEffect(() => document.body.style.cursor = count.value ? 'w-resize' : '')

  // 监听鼠标按下事件
  useEventListener(el, 'mousedown', mousedown)

  // 计算属性：带范围限制的数值
  const _val = computed({
    get: () => val.value == null ? val.value : clamp(val.value),
    set: v => val.value = clamp(v)
  })
  
  /**
   * 数值范围限制函数
   * @param v 要限制的值
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的值
   */
  const clamp = (v, min = props.min ?? -Infinity, max = props.max ?? Infinity) => Math.max(min, Math.min(max, +(v || 0)))
  
  let sv = 0, sx = 0  // 拖拽开始时的值和位置
  
  /**
   * 鼠标按下处理函数
   * @param e 鼠标事件
   */
  function mousedown(e) {
    if (!control.value) return  // 只有按住 Ctrl 键才能拖拽
    e.preventDefault()
    sv = _val.value || 0        // 记录开始值
    sx = e.pageX                // 记录开始位置
    
    // 监听鼠标移动
    const stop = useEventListener('mousemove', e => _val.value = sv + (e.pageX - sx) * (props.step ?? 1))
    // 监听鼠标抬起，停止拖拽
    useEventListener('mouseup', () => stop(), { once: true })
  }
}

/**
 * 滑动指令
 * 用于在模板中直接使用滑动功能
 */
export const vSlide = {
  mounted(el, binding) {
    const [value, option] = binding.value
    useSlide(el, value, option)
  }
}