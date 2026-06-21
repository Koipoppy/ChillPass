/**
 * 图片识别服务
 * 由于 DeepSeek API 目前不支持原生识图，采用本地 OCR 方案：
 * 使用 Tesseract.js 在本地进行文字识别，然后将识别出的文字发送给 DeepSeek
 */

import Tesseract from 'tesseract.js'

/**
 * 从图片文件中识别文字
 * @param filePath 图片文件路径（Electron 环境）或 File 对象（浏览器环境）
 * @returns 识别出的文字内容
 */
export async function recognizeImageText(
  input: string | File | ArrayBuffer
): Promise<string> {
  let imageData: string | File | Buffer

  if (typeof input === 'string') {
    // Electron 环境：读取文件路径
    // 注意：tesseract.js 的 recognize 方法可以直接接受文件路径
    imageData = input
  } else if (input instanceof File) {
    // 浏览器环境：直接使用 File 对象
    imageData = input
  } else {
    // ArrayBuffer
    imageData = input
  }

  try {
    const result = await Tesseract.recognize(imageData, 'chi_sim+eng', {
      logger: () => {}, // 静默模式，不输出日志
    })
    return result.data.text.trim()
  } catch (err) {
    throw new Error(`图片识别失败: ${err instanceof Error ? err.message : '未知错误'}`)
  }
}

/**
 * 将图片文件转为 Base64 data URL（用于在 UI 中预览）
 */
export function fileToDataURL(file: File | ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    if (file instanceof File) {
      reader.readAsDataURL(file)
    } else {
      const blob = new Blob([file])
      reader.readAsDataURL(blob)
    }
  })
}

/**
 * 从图片文件路径读取为 ArrayBuffer（Electron 环境）
 */
export async function readImageFromPath(filePath: string): Promise<ArrayBuffer> {
  if (window.electronAPI?.readFileBuffer) {
    return window.electronAPI.readFileBuffer(filePath)
  }
  throw new Error('无法读取文件，请在 Electron 环境中运行')
}
