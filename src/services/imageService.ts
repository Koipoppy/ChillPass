/**
 * 图片识别服务
 * 优先使用 Electron 主进程中的 tesseract.js 进行 OCR（生产环境可靠）
 * 回退到渲染进程中的 tesseract.js（开发环境）
 */

/**
 * 从图片文件中识别文字
 * @param input File 对象（浏览器）或文件路径（Electron）
 * @returns 识别出的文字内容
 */
export async function recognizeImageText(
  input: string | File | ArrayBuffer
): Promise<string> {
  // 优先使用 Electron 主进程 OCR（生产环境可靠）
  if (typeof input === 'string' && window.electronAPI?.ocrRecognize) {
    return window.electronAPI.ocrRecognize(input)
  }

  // 回退：在渲染进程中使用 tesseract.js
  let imageData: string | File | Buffer
  if (typeof input === 'string') {
    imageData = input
  } else if (input instanceof File) {
    imageData = input
  } else {
    imageData = input
  }

  try {
    const Tesseract = await import('tesseract.js')
    const result = await Tesseract.recognize(imageData, 'chi_sim+eng', {
      logger: () => {},
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
