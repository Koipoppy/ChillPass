// ===== 核心类型定义 =====

/** 考点优先级 */
export type Priority = 'must' | 'high' | 'know'

/** 课程状态 */
export type CourseStatus = 'empty' | 'uploaded' | 'analyzing' | 'ready'

/** 关卡状态 */
export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed'

/** 课件文件类型 */
export interface CourseFile {
  id: string
  name: string
  path: string
  ext: string
  size: number
  uploadedAt: number
}

/** 课程 */
export interface Course {
  id: string
  name: string
  files: CourseFile[]
  status: CourseStatus
  examDate?: string
  createdAt: number
  updatedAt: number
}

/** 考点 */
export interface ExamPoint {
  id: string
  title: string
  priority: Priority
  description: string
  keyFormulas?: string[]
  examples?: string[]
  pageRefs?: string[]
}

/** 关卡（学习单元） */
export interface Lesson {
  id: string
  courseId: string
  order: number
  title: string
  examPointId: string
  priority: Priority
  status: LessonStatus
  xp: number
  content?: LessonContent
  completedAt?: number
}

/** 关卡内容 */
export interface LessonContent {
  keyPoints: string[]
  explanation: string
  examples: ExampleItem[]
  quiz: QuizQuestion[]
}

/** 例题 */
export interface ExampleItem {
  question: string
  answer: string
  steps?: string[]
}

/** 测验题 */
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

/** 错题记录 */
export interface WrongQuestion {
  id: string
  courseId: string
  courseName: string
  lessonId: string
  lessonTitle: string
  question: string
  options: string[]
  correctIndex: number
  selectedIndex: number
  explanation: string
  /** 考点标题 */
  examPointTitle: string
  /** 优先级 */
  priority: Priority
  /** 记录时间 */
  createdAt: number
  /** 是否已掌握（从错题本移除标记） */
  resolved: boolean
}

/** 聊天消息 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  courseId?: string
}

/** 学习进度 */
export interface Progress {
  totalLessons: number
  completedLessons: number
  totalXP: number
  currentStreak: number
  lastStudyDate?: string
}

/** 课程数据包（一个课程的完整数据） */
export interface CourseBundle {
  course: Course
  examPoints: ExamPoint[]
  lessons: Lesson[]
  progress: Progress
  rawText: string
  generatingLessons: boolean
  generationProgress: { current: number; total: number }
}

// ===== 校园账号类型 =====

/** 校园账号信息（为未来接入教务系统做准备） */
export interface CampusAccount {
  studentId: string
  name: string
  school: string
  college: string
  major: string
  grade: string
  /** 教务系统类型，为未来对接不同教务系统预留 */
  academicSystem?: string
  /** 登录时间戳 */
  loggedAt: number
  /** 未来教务系统 token（暂未使用） */
  authToken?: string
}

// ===== 更新检查类型 =====

/** 更新状态 */
export type UpdateStatus = 'idle' | 'checking' | 'available' | 'not-available' | 'error'

/** 更新信息 */
export interface UpdateInfo {
  version: string
  releaseNotes: string
  downloadUrl: string
  releaseDate: string
  currentVersion: string
}

// ===== 资源迁移类型 =====

/** 迁移结果 */
export interface MigrationResult {
  success: boolean
  migratedFiles: number
  totalSize: number
  errors: string[]
  /** 迁移后的新路径映射：旧路径 → 新路径 */
  pathMap: Record<string, string>
}

/** 文件信息（含路径） */
export interface FileInfo {
  path: string
  name: string
  ext: string
  size: number
}

// ===== Electron API 类型声明 =====

export interface ElectronAPI {
  openFileDialog: () => Promise<FileInfo[] | null>
  openDirectoryDialog: () => Promise<string | null>
  readFileBuffer: (filePath: string) => Promise<ArrayBuffer>
  readTextFile: (filePath: string) => Promise<string>
  getUserDataPath: () => Promise<string>
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => void
  // 专注模式
  enterFocusMode: () => void
  exitFocusMode: () => void
  focusExitConfirm: () => void
  isFullScreen: () => Promise<boolean>
  onFocusExited: (callback: () => void) => () => void
  platform: string
  // 应用版本
  getAppVersion: () => Promise<string>
  // 更新检查
  checkForUpdates: () => Promise<UpdateInfo | null>
  openExternalUrl: (url: string) => Promise<void>
  // 资源迁移
  migrateFiles: (filePaths: string[], targetDir: string, move?: boolean) => Promise<MigrationResult>
  getFileSize: (filePath: string) => Promise<number>
  fileExists: (filePath: string) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
