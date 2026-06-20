import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { Upload, FileText, Loader, X, ChevronRight, ChevronDown, CheckCircle } from 'lucide-react'
import { useCourseStore, useCurrentBundle } from '@stores/courseStore'
import { parseFile, cleanText } from '@services/fileParser'
import { extractExamPoints } from '@services/deepseek'
import { generateAllLessonsInBackground } from '@services/lessonGenerator'
import type { CourseFile, CourseStatus } from '@types/index'
import styles from './UploadPage.module.css'

type Phase = 'idle' | 'parsing' | 'extracting'
type ImportMode = 'create' | 'append'

/** 课程状态中文标签 */
const STATUS_LABELS: Record<CourseStatus, string> = {
  empty: '空',
  uploaded: '已上传',
  analyzing: '分析中',
  ready: '就绪',
}

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** 规范化扩展名，确保带前导点且小写 */
function normalizeExt(ext: string): string {
  if (!ext) return ''
  const e = ext.toLowerCase()
  return e.startsWith('.') ? e : '.' + e
}

export default function UploadPage() {
  const navigate = useNavigate()
  const bundle = useCurrentBundle()
  const currentCourse = bundle?.course
  const courses = useCourseStore(s => s.courses)
  const createCourse = useCourseStore(s => s.createCourse)
  const addFiles = useCourseStore(s => s.addFiles)
  const setRawText = useCourseStore(s => s.setRawText)
  const setExamPoints = useCourseStore(s => s.setExamPoints)
  const appendRawText = useCourseStore(s => s.appendRawText)
  const mergeExamPoints = useCourseStore(s => s.mergeExamPoints)
  const switchCourse = useCourseStore(s => s.switchCourse)

  const [mode, setMode] = useState<ImportMode>('create')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [courseName, setCourseName] = useState(currentCourse?.name ?? '')
  const [files, setFiles] = useState<CourseFile[]>(currentCourse?.files ?? [])
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const isBusy = phase !== 'idle'
  const hasExistingCourses = courses.length > 0

  /** 计算模式按钮样式 */
  const getModeButtonStyle = (isActive: boolean, disabled: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    background: isActive ? 'var(--text-primary)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isActive ? 'var(--shadow-ambient)' : 'none',
    transition: 'all 0.25s ease',
  })

  /** 切换导入模式 */
  const handleModeChange = (newMode: ImportMode) => {
    if (isBusy) return
    if (newMode === 'append' && !hasExistingCourses) return
    setMode(newMode)
    setError(null)
    // 切换模式时清空已选文件，避免不同模式间文件混淆
    setFiles([])
    if (newMode === 'append') {
      // 默认选中第一个课程（若尚未选择）
      if (!selectedCourseId && hasExistingCourses) {
        const firstId = courses[0].course.id
        setSelectedCourseId(firstId)
        switchCourse(firstId)
      } else if (selectedCourseId) {
        switchCourse(selectedCourseId)
      }
    }
  }

  /** 选择已有课程 */
  const handleSelectCourse = (id: string) => {
    if (isBusy) return
    setSelectedCourseId(id)
    switchCourse(id)
    setError(null)
  }

  /** 点击选择文件 */
  const handleSelectFiles = useCallback(async () => {
    if (isBusy) return
    try {
      const result = await window.electronAPI.openFileDialog()
      if (!result || result.length === 0) return
      const courseFiles: CourseFile[] = result.map(f => ({
        id: nanoid(),
        name: f.name,
        path: f.path,
        ext: normalizeExt(f.ext),
        size: f.size,
        uploadedAt: Date.now(),
      }))
      setFiles(prev => {
        const existing = new Set(prev.map(p => p.path))
        return [...prev, ...courseFiles.filter(f => !existing.has(f.path))]
      })
      setError(null)
    } catch {
      setError('选择文件失败，请重试')
    }
  }, [isBusy])

  /** 拖拽放置 */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (isBusy) return
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length === 0) return
    const courseFiles: CourseFile[] = dropped.map(f => {
      const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
      return {
        id: nanoid(),
        name: f.name,
        path: (f as File & { path: string }).path,
        ext: normalizeExt(ext),
        size: f.size,
        uploadedAt: Date.now(),
      }
    })
    setFiles(prev => {
      const existing = new Set(prev.map(p => p.path))
      return [...prev, ...courseFiles.filter(f => !existing.has(f.path))]
    })
    setError(null)
  }, [isBusy])

  /** 删除文件 */
  const handleRemoveFile = (id: string) => {
    if (isBusy) return
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  /** 新建课程模式：解析流程 */
  const handleCreateParse = async () => {
    if (!courseName.trim()) {
      setError('请输入课程名称')
      return
    }
    if (files.length === 0) {
      setError('请至少上传一个课件文件')
      return
    }

    setError(null)
    setPhase('parsing')
    setProgress(0)
    setProgressText('正在解析课件...')

    try {
      // 创建/重置课程
      createCourse(courseName.trim())
      addFiles(files)

      // 逐个解析文件
      const texts: string[] = []
      for (let i = 0; i < files.length; i++) {
        setProgressText(`正在解析 ${files[i].name}（${i + 1}/${files.length}）`)
        const text = await parseFile(files[i].path, files[i].ext)
        texts.push(text)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      // 合并并清洗文本
      const merged = texts.join('\n\n')
      const cleaned = cleanText(merged)
      setRawText(cleaned)

      // 提炼考点
      setPhase('extracting')
      setProgressText('正在提炼考点，生成闯关路径...')
      const points = await extractExamPoints(cleaned, courseName.trim())
      setExamPoints(points) // 内部会调用 generateLessons 创建关卡骨架

      // 触发后台生成关卡内容（不等待，异步执行）
      const courseId = useCourseStore.getState().currentCourseId
      if (courseId) {
        generateAllLessonsInBackground(courseId)
      }

      // 跳转到闯关路径
      navigate('/lessons')
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败，请重试')
      setPhase('idle')
      setProgress(0)
    }
  }

  /** 增量导入模式：解析流程 */
  const handleAppendParse = async () => {
    if (!selectedCourseId) {
      setError('请选择要导入的课程')
      return
    }
    if (files.length === 0) {
      setError('请至少上传一个课件文件')
      return
    }

    const targetBundle = useCourseStore
      .getState()
      .courses.find(b => b.course.id === selectedCourseId)
    if (!targetBundle) {
      setError('所选课程不存在，请重新选择')
      return
    }
    const courseNameForExtract = targetBundle.course.name

    setError(null)
    setPhase('parsing')
    setProgress(0)
    setProgressText('正在解析新增课件...')

    try {
      // 确保切换到目标课程
      switchCourse(selectedCourseId)
      // 记录新增文件到课程
      addFiles(files)

      // 1. 逐个解析新文件
      const texts: string[] = []
      for (let i = 0; i < files.length; i++) {
        setProgressText(`正在解析 ${files[i].name}（${i + 1}/${files.length}）`)
        const text = await parseFile(files[i].path, files[i].ext)
        texts.push(text)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      // 2. 清洗并追加到已有文本
      const merged = texts.join('\n\n')
      const cleaned = cleanText(merged)
      appendRawText(cleaned)

      // 3. 获取更新后的完整 rawText
      const updatedBundle = useCourseStore
        .getState()
        .courses.find(b => b.course.id === selectedCourseId)
      const completeRawText = updatedBundle?.rawText ?? ''

      // 4. 重新提炼全部考点
      setPhase('extracting')
      setProgressText('正在重新提炼全部考点...')
      const allPoints = await extractExamPoints(completeRawText, courseNameForExtract)

      // 5. 增量合并（只为新考点创建关卡，已有内容的关卡保留）
      setProgressText('正在合并考点，生成新关卡...')
      mergeExamPoints(allPoints)

      // 6. 后台生成关卡内容（已有内容的关卡会自动跳过）
      generateAllLessonsInBackground(selectedCourseId)

      // 7. 跳转到闯关路径
      navigate('/lessons')
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败，请重试')
      setPhase('idle')
      setProgress(0)
    }
  }

  /** 开始解析（按模式分发） */
  const handleStartParse = () => {
    if (mode === 'create') {
      void handleCreateParse()
    } else {
      void handleAppendParse()
    }
  }

  const startButtonText = isBusy
    ? '处理中...'
    : mode === 'create'
      ? '开始解析'
      : '增量导入'

  // 当前选中的课程信息（增量模式用）
  const selectedBundle = mode === 'append' && selectedCourseId
    ? courses.find(b => b.course.id === selectedCourseId)
    : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>导入课件</h1>
        <p className={styles.subtitle}>
          上传你的课程资料，AI 将自动提炼考点并生成闯关路径
        </p>
      </header>

      <div className={`${styles.card} liquid-glass`}>
        {/* 模式选择器 */}
        <div style={modeSelectorStyle}>
          <button
            type="button"
            style={getModeButtonStyle(mode === 'create', isBusy)}
            onClick={() => handleModeChange('create')}
            disabled={isBusy}
          >
            <FileText size={16} strokeWidth={2} />
            <span>新建课程</span>
          </button>
          <button
            type="button"
            style={getModeButtonStyle(mode === 'append', isBusy || !hasExistingCourses)}
            onClick={() => handleModeChange('append')}
            disabled={isBusy || !hasExistingCourses}
            title={!hasExistingCourses ? '暂无已有课程' : '将新课件追加到已有课程'}
          >
            <CheckCircle size={16} strokeWidth={2} />
            <span>导入到已有课程</span>
          </button>
        </div>
        {!hasExistingCourses && (
          <div style={hintStyle}>暂无已有课程，无法使用增量导入</div>
        )}

        {/* 新建课程模式：课程名称 */}
        {mode === 'create' && (
          <div className={styles.field}>
            <label className={styles.label}>课程名称</label>
            <input
              className={styles.input}
              type="text"
              placeholder="例如：高等数学（下）"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              disabled={isBusy}
            />
          </div>
        )}

        {/* 增量导入模式：课程选择 */}
        {mode === 'append' && (
          <div className={styles.field}>
            <label className={styles.label}>选择已有课程</label>
            <div style={selectWrapperStyle}>
              <select
                style={{
                  ...selectStyle,
                  opacity: isBusy ? 0.5 : 1,
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
                value={selectedCourseId}
                onChange={e => handleSelectCourse(e.target.value)}
                disabled={isBusy}
              >
                {courses.map(b => (
                  <option key={b.course.id} value={b.course.id}>
                    {b.course.name}（{STATUS_LABELS[b.course.status]}）
                  </option>
                ))}
              </select>
              <ChevronDown size={16} strokeWidth={2} style={selectIconStyle} />
            </div>
            {selectedBundle && (
              <div style={courseInfoStyle}>
                已选课程：{selectedBundle.course.name}
                {' · '}考点 {selectedBundle.examPoints.length} 个
                {' · '}关卡 {selectedBundle.lessons.length} 个
              </div>
            )}
          </div>
        )}

        {/* 拖拽上传区 */}
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
          onClick={handleSelectFiles}
          onDragOver={e => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
        >
          <div className={styles.dropzoneIcon}>
            <Upload size={32} strokeWidth={1.6} />
          </div>
          <div className={styles.dropzoneText}>
            {mode === 'append' ? '选择要追加的新课件文件，或拖拽到此处' : '点击选择文件，或拖拽到此处'}
          </div>
          <div className={styles.dropzoneHint}>支持 PDF、PPTX、TXT、Markdown</div>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map(file => (
              <div key={file.id} className={styles.fileItem}>
                <div className={styles.fileIcon}>
                  <FileText size={18} strokeWidth={1.8} />
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
                <button
                  className={styles.fileRemove}
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={isBusy}
                  aria-label="删除文件"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className={styles.error}>
            <X size={16} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        {/* 解析进度 */}
        {isBusy && (
          <div className={styles.progress}>
            <div className={styles.progressHeader}>
              <Loader size={18} className={styles.spinnerIcon} />
              <span>{progressText}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: phase === 'extracting' ? '100%' : `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 开始按钮 */}
        <button
          className={styles.parseButton}
          onClick={handleStartParse}
          disabled={isBusy}
        >
          {startButtonText}
          {!isBusy && <ChevronRight size={18} strokeWidth={2} />}
        </button>
      </div>
    </div>
  )
}

/* ===== 内联样式（新增元素，不修改 CSS Module） ===== */

const modeSelectorStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  padding: 4,
  background: 'rgba(0, 0, 0, 0.04)',
  borderRadius: 'var(--radius-pill)',
}

const hintStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-tertiary)',
  padding: '0 4px',
  marginTop: -8,
}

const selectWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 40px 12px 16px',
  fontSize: 16,
  fontFamily: 'inherit',
  color: 'var(--text-primary)',
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  transition: 'all 0.3s ease',
}

const selectIconStyle: React.CSSProperties = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-secondary)',
  pointerEvents: 'none',
}

const courseInfoStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-tertiary)',
  padding: '0 4px',
}
