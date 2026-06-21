/**
 * 浏览器预览用的 Electron API Mock
 * 仅在非 Electron 环境下使用
 */
export function setupElectronMock() {
  if (window.electronAPI) return

  const mockAPI = {
    openFileDialog: async () => {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = '.pdf,.pptx,.ppt,.txt,.md'
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          if (!files || files.length === 0) {
            resolve(null)
            return
          }
          const result = Array.from(files).map(f => ({
            path: (f as File & { path?: string }).path || f.name,
            name: f.name,
            ext: '.' + (f.name.split('.').pop() || '').toLowerCase(),
            size: f.size,
          }))
          resolve(result)
        }
        input.click()
      })
    },
    openDirectoryDialog: async () => {
      const path = window.prompt('输入存储目录路径（浏览器预览模拟）')
      return path || null
    },
    readFileBuffer: async (_filePath: string) => {
      return new ArrayBuffer(0)
    },
    readTextFile: async (_filePath: string) => {
      return ''
    },
    getUserDataPath: async () => {
      return '/tmp/chillpass'
    },
    windowMinimize: () => {
      console.log('[Mock] windowMinimize')
    },
    windowMaximize: () => {
      console.log('[Mock] windowMaximize')
    },
    windowClose: () => {
      console.log('[Mock] windowClose')
    },
    windowIsMaximized: async () => false,
    onWindowMaximizeChange: (_callback: (isMaximized: boolean) => void) => {
      return () => {}
    },
    enterFocusMode: () => { console.log('[Mock] enterFocusMode') },
    exitFocusMode: () => { console.log('[Mock] exitFocusMode') },
    focusExitConfirm: () => { console.log('[Mock] focusExitConfirm') },
    isFullScreen: async () => false,
    onFocusExited: (_callback: () => void) => { return () => {} },
    platform: 'win32',
    // 应用版本
    getAppVersion: async () => '1.0.0',
    // 更新检查
    checkForUpdates: async () => null,
    openExternalUrl: async (url: string) => {
      window.open(url, '_blank')
    },
    // 资源迁移
    migrateFiles: async (_filePaths: string[], _targetDir: string, _move?: boolean) => {
      return {
        success: true,
        migratedFiles: 0,
        totalSize: 0,
        errors: [],
        pathMap: {},
      }
    },
    getFileSize: async (_filePath: string) => 0,
    fileExists: async (_filePath: string) => false,
  }

  Object.defineProperty(window, 'electronAPI', {
    value: mockAPI,
    writable: false,
    configurable: true
  })
}
