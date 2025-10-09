/**
 * 唯一标识符生成工具
 * 
 * 使用 hexoid 库生成高性能的唯一标识符，
 * 用于为 DSL 组件生成唯一 ID。
 */

import { hexoid } from 'hexoid'

/**
 * 唯一标识符生成器
 * 生成基于时间戳和随机数的十六进制字符串
 * @example
 * const id = uid() // "1a2b3c4d5e6f"
 */
export const uid = /*#__PURE__*/ hexoid()