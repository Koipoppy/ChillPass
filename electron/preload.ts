import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // 文件对话框
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),

  // 目录对话框
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),

  // 读取文件（Buffer，用于 PDF 解析）
  readFileBuffer: (filePath: string) => ipcRenderer.invoke('file:readBuffer', filePath),

  // 读取文本文件
  readTextFile: (filePath: string) => ipcRenderer.invoke('file:readText', filePath),

  // 获取用户数据目录
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),

  // 窗口控制
  windowMinimize: () => ipcRenderer.send('window:minimize'),
  windowMaximize: () => ipcRenderer.send('window:maximize'),
  windowClose: () => ipcRenderer.send('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: any, isMaximized: boolean) => callback(isMaximized)
    ipcRenderer.on('window:maximizeChanged', handler)
    return () => ipcRenderer.removeListener('window:maximizeChanged', handler)
  },

  // 平台信息
  platform: process.platform,

  // 应用版本
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),

  // 更新检查
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  openExternalUrl: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // 资源迁移
  migrateFiles: (filePaths: string[], targetDir: string, move?: boolean) =>
    ipcRenderer.invoke('file:migrate', filePaths, targetDir, move),
  getFileSize: (filePath: string) => ipcRenderer.invoke('file:getSize', filePath),
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
