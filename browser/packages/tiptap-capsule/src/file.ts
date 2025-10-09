/**
 * 文件操作工具模块
 * 
 * 这个模块提供了浏览器环境下的文件操作功能，包括：
 * - 文件下载
 * - 文件选择
 * - 图片选择和处理
 * - 文件格式转换
 */

/**
 * 下载文本文件
 * @param text 文件内容
 * @param filename 文件名
 */
export function download(text: string, filename: string) {
  const file = new File([text], filename, { type: 'text/plain' })
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 文件选择器
 * @param opt 选择选项
 * @returns Promise<File[]> 选择的文件数组
 */
export function fileSelect(opt?: { accept?: string; maxSize?: number, multiple?: boolean }) {
  const opts = { accept: '*/*', multiple: false, maxSize: Infinity, ...opt}
  return new Promise<File[]>((resolve, reject) => {
    const input = document.createElement('input')
    input.accept = opts.accept
    input.multiple = opts.multiple
    input.type = 'file'
    input.onchange = () => {
      const errs = Array.from(input.files || []).filter(e => e.size > opts.maxSize)
      if (errs.length) {
        const sizes = errs.map(e => `${e.name} - ${formatBytes(e.size)}`).join('\n')
        const msg = `文件大小超过限制 ${formatBytes(opts.maxSize)}:\n${sizes}`
        alert(msg)
        return reject(msg)
      }
      resolve(Array.from(input.files || []))
    }
    input.click()
  })
}

/**
 * 选择图片文件
 * @param opt 选择选项
 * @returns Promise<string[]> 图片 base64 字符串数组或 URL
 */
export async function chooseImg(opt?: { base64?: boolean, maxSize?: number, multiple?: boolean }) {
  const opts = { base64: false, maxSize: 1024 * 1024 * 5, multiple: false, ...opt}
  const imgs = await fileSelect({ accept: 'image/*', ...opts })
  if (opts.base64) {
    return Promise.all(imgs.map(e => fileToBase64(e)))
  }
  else {
    return imgs.map(e => URL.createObjectURL(e))
  }
}

/**
 * 将文件转换为 base64 字符串
 * @param file 要转换的文件
 * @returns Promise<string> base64 字符串
 */
export function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

