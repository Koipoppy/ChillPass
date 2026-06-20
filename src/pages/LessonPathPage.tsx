import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, PlayCircle, Upload, Loader } from 'lucide-react'
import { useCurrentBundle } from '@stores/courseStore'
import type { Lesson, Priority } from '@types/index'
import styles from './LessonPathPage.module.css'

const priorityLabel: Record<Priority, string> = {
  must: '必考',
  high: '高频',
  know: '了解',
}

export default function LessonPathPage() {
  const navigate = useNavigate()
  const bundle = useCurrentBundle()
  const course = bundle?.course
  const lessons = bundle?.lessons ?? []
  const progress = bundle?.progress
  const generatingLessons = bundle?.generatingLessons ?? false
  const generationProgress = bundle?.generationProgress ?? { current: 0, total: 0 }

  // 空状态：没有课程或没有关卡
  if (!course || !progress || lessons.length === 0) {
    return (
      <div className={styles.page}>
        <div className={`${styles.empty} liquid-glass`}>
          <div className={styles.emptyIcon}>
            <PlayCircle size={48} strokeWidth={1.4} />
          </div>
          <h2 className={styles.emptyTitle}>还没有闯关路径</h2>
          <p className={styles.emptyText}>
            先导入课件，AI 会自动为你生成考点闯关路径
          </p>
          <button
            className={styles.emptyButton}
            onClick={() => navigate('/upload')}
          >
            <Upload size={18} strokeWidth={2} />
            <span>去导入课件</span>
          </button>
        </div>
      </div>
    )
  }

  const percent =
    progress.totalLessons > 0
      ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
      : 0

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') return
    navigate(`/lessons/${lesson.id}`)
  }

  return (
    <div className={styles.page}>
      {/* 后台生成进度提示 */}
      {generatingLessons && (
        <div
          className="liquid-glass fade-in"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <Loader
              size={16}
              strokeWidth={2}
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <span>
              正在后台生成关卡内容... ({generationProgress.current}/
              {generationProgress.total})
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${
                  generationProgress.total > 0
                    ? (generationProgress.current / generationProgress.total) * 100
                    : 0
                }%`,
                background: 'var(--accent-text)',
              }}
            />
          </div>
        </div>
      )}

      {/* 头部：课程名 + 进度 */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{course.name}</h1>
          <div className={styles.xpBadge}>
            <span className={styles.xpValue}>{progress.totalXP}</span>
            <span className={styles.xpLabel}>XP</span>
          </div>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressInfo}>
            <span className={styles.progressCount}>
              {progress.completedLessons}/{progress.totalLessons} 关卡
            </span>
            <span className={styles.progressPercent}>{percent}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      {/* 闯关路径 */}
      <div className={`${styles.pathCard} liquid-glass`}>
        <div className={styles.path}>
          {lessons.map((lesson, index) => {
            const prevCompleted =
              index > 0 && lessons[index - 1].status === 'completed'
            return (
              <button
                key={lesson.id}
                type="button"
                className={`${styles.lessonRow} ${
                  lesson.status === 'locked' ? styles.row_locked : ''
                }`}
                onClick={() => handleLessonClick(lesson)}
              >
                <div className={styles.nodeColumn}>
                  {index > 0 && (
                    <div className={styles.connector}>
                      <div
                        className={`${styles.connectorLine} ${
                          prevCompleted ? styles.connectorActive : ''
                        }`}
                      />
                    </div>
                  )}
                  <div
                    className={`${styles.nodeCircle} ${styles[`node_${lesson.status}`]}`}
                  >
                    {lesson.status === 'completed' ? (
                      <CheckCircle size={28} strokeWidth={2.2} />
                    ) : lesson.status === 'locked' ? (
                      <Lock size={20} strokeWidth={2} />
                    ) : (
                      <span className={styles.nodeNumber}>{lesson.order}</span>
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.lessonInfo} ${
                    lesson.status === 'locked' ? styles.lessonInfoLocked : ''
                  }`}
                >
                  <div className={styles.lessonMeta}>
                    <span
                      className={`${styles.priorityTag} ${styles[`priority_${lesson.priority}`]}`}
                    >
                      {priorityLabel[lesson.priority]}
                    </span>
                    <span className={styles.lessonXP}>{lesson.xp} XP</span>
                  </div>
                  <div className={styles.lessonTitle}>{lesson.title}</div>
                  {lesson.status === 'completed' ? (
                    <div className={styles.lessonStatusDone}>已完成</div>
                  ) : lesson.status === 'locked' ? (
                    <div className={styles.lessonStatusLocked}>未解锁</div>
                  ) : (
                    <div className={styles.lessonStatusActive}>点击开始</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
