import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import https from 'https'
import { URL } from 'url'

// Vite dev server URL（由 vite-plugin-electron 注入）
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL as string | undefined

// 更新检查 URL（可配置，默认使用 GitHub Releases API 格式）
// 实际发布时替换为真实的版本检查地址
const UPDATE_CHECK_URL = 'https://api.github.com/repos/Koipoppy/ChillPass/releases/latest'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    // macOS 风格：隐藏标题栏但保留交通灯按钮（macOS）或完全无框（Windows/Linux）
    titleBarStyle: 'hidden',
    frame: false,
    backgroundColor: '#f5f5f7',
    // Windows 11 圆角窗口（与界面元素的 --radius-xl: 32px 视觉统一）
    // Windows 10 及以下会自动忽略此属性，使用直角
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  // 开发环境加载 Vite dev server，生产环境加载打包后的文件
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 外部链接在默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 通知渲染进程窗口最大化状态变化
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximizeChanged', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximizeChanged', false)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ===== IPC 通信 =====

// 选择文件对话框
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择课件文件',
    filters: [
      { name: '课件文件', extensions: ['pdf', 'pptx', 'ppt', 'txt', 'md'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections']
  })

  if (result.canceled) return null

  return result.filePaths.map(filePath => ({
    path: filePath,
    name: path.basename(filePath),
    ext: path.extname(filePath).toLowerCase(),
    size: fs.statSync(filePath).size
  }))
})

// 选择目录对话框
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择资源存储位置',
    properties: ['openDirectory', 'createDirectory']
  })

  if (result.canceled) return null
  return result.filePaths[0]
})

// 读取文件内容
ipcMain.handle('file:readBuffer', async (_event, filePath: string) => {
  const buffer = fs.readFileSync(filePath)
  return buffer
})

// 读取文本文件
ipcMain.handle('file:readText', async (_event, filePath: string) => {
  return fs.readFileSync(filePath, 'utf-8')
})

// 获取用户数据目录（用于持久化存储）
ipcMain.handle('app:getUserDataPath', () => {
  return app.getPath('userData')
})

// ===== 应用版本 =====

ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

// ===== 更新检查 =====

/** 从任意 tag 字符串中提取纯语义化版本号（如 "1.0.0"） */
function extractSemver(tag: string): string {
  const match = tag.match(/(\d+\.\d+\.\d+)/)
  return match ? match[1] : '0.0.0'
}

/** 比较语义化版本号：返回 1 表示 v1 > v2，-1 表示 v1 < v2，0 表示相等 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = extractSemver(v1).split('.').map(Number)
  const parts2 = extractSemver(v2).split('.').map(Number)
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0
    const b = parts2[i] || 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

/** 通过 HTTPS 获取 JSON */
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'ChillPass-Update-Checker',
        'Accept': 'application/vnd.github+json',
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject(new Error('无法解析更新信息'))
        }
      })
    })
    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('更新检查超时'))
    })
    req.end()
  })
}

ipcMain.handle('update:check', async () => {
  const currentVersion = app.getVersion()
  try {
    const release = await fetchJson(UPDATE_CHECK_URL)

    // GitHub Releases API 返回格式
    const latestVersion = release.tag_name || '0.0.0'
    // 优先使用 exe 安装器的直接下载链接，其次使用 Release 页面
    const exeAsset = release.assets?.find((a: any) => a.name.endsWith('.exe') && !a.name.endsWith('.blockmap'))
    const downloadUrl = exeAsset?.browser_download_url || release.html_url || ''
    const releaseNotes = release.body || '暂无更新说明'
    const releaseDate = release.published_at || new Date().toISOString()

    if (compareVersions(latestVersion, currentVersion) > 0) {
      return {
        version: latestVersion,
        releaseNotes,
        downloadUrl,
        releaseDate,
        currentVersion,
      }
    }

    return null
  } catch (err) {
    throw new Error(`更新检查失败: ${err instanceof Error ? err.message : '未知错误'}`)
  }
})

// 打开外部 URL
ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  await shell.openExternal(url)
})

// ===== 资源迁移 =====

/** 确保目录存在 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/** 生成不冲突的文件名：如果目标已存在，追加序号 */
function getUniquePath(targetDir: string, fileName: string): string {
  const ext = path.extname(fileName)
  const base = path.basename(fileName, ext)
  let candidate = path.join(targetDir, fileName)
  let counter = 1
  while (fs.existsSync(candidate)) {
    candidate = path.join(targetDir, `${base} (${counter})${ext}`)
    counter++
  }
  return candidate
}

ipcMain.handle('file:migrate', async (_event, filePaths: string[], targetDir: string, move: boolean = false) => {
  const result = {
    success: true,
    migratedFiles: 0,
    totalSize: 0,
    errors: [] as string[],
    pathMap: {} as Record<string, string>,
  }

  try {
    ensureDir(targetDir)
  } catch {
    result.success = false
    result.errors.push(`无法创建目标目录: ${targetDir}`)
    return result
  }

  for (const srcPath of filePaths) {
    try {
      if (!fs.existsSync(srcPath)) {
        result.errors.push(`文件不存在: ${srcPath}`)
        continue
      }

      const fileName = path.basename(srcPath)
      const destPath = getUniquePath(targetDir, fileName)
      const stat = fs.statSync(srcPath)

      if (move) {
        fs.renameSync(srcPath, destPath)
      } else {
        // 复制文件
        fs.copyFileSync(srcPath, destPath)
      }

      result.pathMap[srcPath] = destPath
      result.migratedFiles++
      result.totalSize += stat.size
    } catch (err) {
      result.errors.push(`迁移失败 ${path.basename(srcPath)}: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  if (result.errors.length > 0 && result.migratedFiles === 0) {
    result.success = false
  }

  return result
})

// 获取文件大小
ipcMain.handle('file:getSize', async (_event, filePath: string) => {
  try {
    const stat = fs.statSync(filePath)
    return stat.size
  } catch {
    return 0
  }
})

// 检查文件是否存在
ipcMain.handle('file:exists', async (_event, filePath: string) => {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
})

// ===== 窗口控制 =====

ipcMain.on('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})
