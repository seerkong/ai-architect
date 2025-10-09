/**
 * el-lowcode 工具类型定义
 * 
 * 这个模块定义了 el-lowcode 中使用的各种 TypeScript 类型，
 * 提供了类型安全和更好的开发体验。
 */

/**
 * 通用对象类型
 * 表示任意键值对的对象
 */
export type Obj = Record<any, any>

/**
 * 可数组化类型
 * 表示可以是单个值或数组的类型
 * @example
 * type StringOrArray = Arrable<string> // string | string[]
 */
export type Arrable<T> = T | T[]

/**
 * 可函数化类型
 * 表示可以是值或函数的类型
 * @example
 * type ValueOrFunction = Fnable<string> // string | (() => string)
 */
export type Fnable<T, A extends any[] = []> = T | ((...args: A) => T)

/**
 * 对象合并类型
 * 将 B 的属性合并到 A 中，B 的属性会覆盖 A 的同名属性
 * @example
 * type Merged = Assign<{a: string}, {b: number}> // {b: number}
 */
export type Assign<A, B> = Omit<A, keyof B> & B

/**
 * 为对象键添加前缀的类型
 * @example
 * type Prefixed = AddPrefixToKeys<{name: string}, 'user_'> // {user_name: string}
 */
export type AddPrefixToKeys<T, Prefix extends string> = { [K in keyof T as `${Prefix}${K & string}`]: T[K] }
