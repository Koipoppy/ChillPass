import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Lightbulb,
  PenTool,
  HelpCircle,
  Check,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useCourseStore, useCurrentBundle } from '@stores/courseStore'
import { useWrongQuestionStore } from '@stores/wrongQuestionStore'
import { generateLessonContent } from '@services/deepseek'
import type { Priority } from '@types/index'
import { renderMarkdown, renderInlineMarkdown } from '../utils/markdown'
import styles from './LessonDetailPage.module.css'

const priorityLabel: Record<Priority, string> = {
  must: '必考',
  high: '高频',
  know: '了解',
}

type Tab = 'points' | 'examples' | 'quiz'

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const bundle = useCurrentBundle()
  const lessons = bundle?.lessons ?? []
  const examPoints = bundle?.examPoints ?? []
  const rawText = bundle?.rawText ?? ''
  const generatingLessons = bundle?.generatingLessons ?? false

  const completeLesson = useCourseStore(s => s.completeLesson)
  const setLessonContent = useCourseStore(s => s.setLessonContent)
  const addWrongQuestion = useWrongQuestionStore(s => s.addWrongQuestion)

  const lesson = lessons.find(l => l.id === lessonId)
  const content = lesson?.content ?? null

  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('points')
  const [answers, setAnswers] = useState<Record<string, number>>({})

  // 切换关卡时重置本地状态
  useEffect(() => {
    setRegenerating(false)
    setError(null)
    setTab('points')
    setAnswers({})
  }, [lessonId])

  // 关卡不存在
  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={`${styles.notFound} liquid-glass`}>
          <p className={styles.notFoundText}>关卡不存在或已被移除</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/lessons')}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>返回关卡列表</span>
          </button>
        </div>
      </div>
    )
  }

  const examPoint = examPoints.find(p => p.id === lesson.examPointId)
  const isCompleted = lesson.status === 'completed'

  /** 手动重新生成关卡内容 */
  const handleRegenerate = async () => {
    if (!examPoint) {
      setError('找不到对应考点信息')
      return
    }
    setRegenerating(true)
    setError(null)
    try {
      const c = await generateLessonContent(examPoint, rawText)
      setLessonContent(lesson.id, c)
      setTab('points')
      setAnswers({})
    } catch (err) {
      setError(err instanceof Error ? err.message : '内容生成失败，请重试')
    } finally {
      setRegenerating(false)
    }
  }

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (answers[questionId] !== undefined) return // 已作答不可更改
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))

    // 答错时记录到错题本
    if (content && examPoint && bundle) {
      const q = content.quiz.find(item => item.id === questionId)
      if (q && optionIndex !== q.correctIndex) {
        addWrongQuestion({
          courseId: bundle.course.id,
          courseName: bundle.course.name,
          lessonId: lesson!.id,
          lessonTitle: lesson!.title,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          selectedIndex: optionIndex,
          explanation: q.explanation,
          examPointTitle: examPoint.title,
          priority: lesson!.priority,
        })
      }
    }
  }

  const allQuizAnswered = content
    ? content.quiz.length === 0 ||
      content.quiz.every(q => answers[q.id] !== undefined)
    : false

  const handleComplete = () => {
    completeLesson(lesson.id)
    navigate('/lessons')
  }

  return (
    <div className={styles.page}>
      {/* 顶部返回栏 */}
      <div className={styles.topbar}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/lessons')}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span>返回关卡列表</span>
        </button>
      </div>

      {/* 标题区 */}
      <div className={`${styles.header} liquid-glass`}>
        <div className={styles.headerMeta}>
          <span
            className={`${styles.priorityTag} ${styles[`priority_${lesson.priority}`]}`}
          >
            {priorityLabel[lesson.priority]}
          </span>
          <span className={styles.order}>第 {lesson.order} 关</span>
          <span className={styles.xp}>{lesson.xp} XP</span>
          {isCompleted && (
            <span className={styles.completedBadge}>
              <CheckCircle size={14} strokeWidth={2.2} />
              已完成
            </span>
          )}
        </div>
        <h1 className={styles.title}>{lesson.title}</h1>
      </div>

      {/* 手动重新生成中 */}
      {regenerating && (
        <div className={`${styles.loadingCard} liquid-glass`}>
          <Loader size={32} className={styles.spinnerIcon} />
          <p className={styles.loadingText}>正在重新生成学习内容...</p>
        </div>
      )}

      {/* 内容已存在：直接显示 */}
      {!regenerating && content && (
        <>
          {/* Tab 切换 */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'points' ? styles.tabActive : ''}`}
              onClick={() => setTab('points')}
            >
              <Lightbulb size={16} strokeWidth={2} />
              <span>知识点</span>
            </button>
            <button
              className={`${styles.tab} ${tab === 'examples' ? styles.tabActive : ''}`}
              onClick={() => setTab('examples')}
            >
              <PenTool size={16} strokeWidth={2} />
              <span>例题</span>
            </button>
            <button
              className={`${styles.tab} ${tab === 'quiz' ? styles.tabActive : ''}`}
              onClick={() => setTab('quiz')}
            >
              <HelpCircle size={16} strokeWidth={2} />
              <span>小测</span>
            </button>
          </div>

          {/* 知识点 */}
          {tab === 'points' && (
            <div className={`${styles.contentCard} liquid-glass`}>
              <h2 className={styles.sectionTitle}>
                <Lightbulb size={18} strokeWidth={2} />
                核心知识点
              </h2>
              <ul className={styles.keyPoints}>
                {content.keyPoints.map((point, i) => (
                  <li key={i} className={styles.keyPoint}>
                    <span className={styles.keyPointDot} />
                    <span
                      className={styles.markdownContent}
                      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(point) }}
                    />
                  </li>
                ))}
              </ul>

              <h2 className={styles.sectionTitle}>
                <PenTool size={18} strokeWidth={2} />
                详细解释
              </h2>
              <div
                className={`${styles.explanation} ${styles.markdownContent}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content.explanation) }}
              />
            </div>
          )}

          {/* 例题 */}
          {tab === 'examples' && (
            <div className={styles.contentList}>
              {content.examples.length === 0 && (
                <div className={`${styles.emptyHint} liquid-glass`}>
                  本关暂无例题
                </div>
              )}
              {content.examples.map((ex, i) => (
                <div key={i} className={`${styles.exampleCard} liquid-glass`}>
                  <div className={styles.exampleHeader}>例题 {i + 1}</div>
                  <div
                    className={`${styles.exampleQuestion} ${styles.markdownContent}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(ex.question) }}
                  />
                  {ex.steps && ex.steps.length > 0 && (
                    <div className={styles.exampleSteps}>
                      <div className={styles.stepsLabel}>解题步骤</div>
                      {ex.steps.map((step, j) => (
                        <div key={j} className={styles.step}>
                          <span className={styles.stepIndex}>{j + 1}</span>
                          <span
                            className={styles.markdownContent}
                            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(step) }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.exampleAnswer}>
                    <span className={styles.answerLabel}>答案</span>
                    <span
                      className={`${styles.answerText} ${styles.markdownContent}`}
                      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(ex.answer) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 小测 */}
          {tab === 'quiz' && (
            <div className={styles.contentList}>
              {content.quiz.length === 0 && (
                <div className={`${styles.emptyHint} liquid-glass`}>
                  本关暂无小测题
                </div>
              )}
              {content.quiz.map((q, i) => {
                const selected = answers[q.id]
                const answered = selected !== undefined
                return (
                  <div key={q.id} className={`${styles.quizCard} liquid-glass`}>
                    <div className={styles.quizHeader}>问题 {i + 1}</div>
                    <div
                      className={`${styles.quizQuestion} ${styles.markdownContent}`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(q.question) }}
                    />
                    <div className={styles.quizOptions}>
                      {q.options.map((opt, oi) => {
                        const isCorrect = oi === q.correctIndex
                        const isSelected = selected === oi
                        let cls = styles.quizOption
                        if (answered) {
                          if (isCorrect) {
                            cls = `${styles.quizOption} ${styles.quizOptionCorrect}`
                          } else if (isSelected) {
                            cls = `${styles.quizOption} ${styles.quizOptionWrong}`
                          } else {
                            cls = `${styles.quizOption} ${styles.quizOptionDim}`
                          }
                        }
                        return (
                          <button
                            key={oi}
                            className={cls}
                            onClick={() => handleAnswer(q.id, oi)}
                            disabled={answered}
                          >
                            <span className={styles.optionLabel}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span
                              className={`${styles.optionText} ${styles.markdownContent}`}
                              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(opt) }}
                            />
                            {answered && isCorrect && (
                              <Check size={16} className={styles.optionIcon} />
                            )}
                            {answered && isSelected && !isCorrect && (
                              <X size={16} className={styles.optionIcon} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {answered && (
                      <div
                        className={`${styles.quizExplanation} ${
                          selected === q.correctIndex
                            ? styles.quizExplanationCorrect
                            : styles.quizExplanationWrong
                        }`}
                      >
                        <span className={styles.explanationLabel}>
                          {selected === q.correctIndex ? '回答正确' : '回答错误'}
                        </span>
                        <span
                          className={styles.markdownContent}
                          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(q.explanation) }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* 完成关卡 */}
              {allQuizAnswered && !isCompleted && (
                <button
                  className={styles.completeButton}
                  onClick={handleComplete}
                >
                  <CheckCircle size={18} strokeWidth={2} />
                  <span>完成关卡</span>
                </button>
              )}
              {allQuizAnswered && isCompleted && (
                <div className={styles.alreadyCompleted}>
                  <CheckCircle size={18} strokeWidth={2} />
                  <span>本关已完成</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 内容正在后台生成中 */}
      {!regenerating && !content && generatingLessons && (
        <div className={`${styles.loadingCard} liquid-glass`}>
          <Loader size={32} className={styles.spinnerIcon} />
          <p className={styles.loadingText}>内容正在生成中，请稍候...</p>
        </div>
      )}

      {/* 生成失败：显示重新生成按钮 */}
      {!regenerating && !content && !generatingLessons && (
        <div className={`${styles.startCard} liquid-glass`}>
          {error && (
            <div className={styles.error}>
              <X size={16} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}
          <div className={styles.startIcon}>
            <AlertCircle size={40} strokeWidth={1.5} />
          </div>
          <p className={styles.startText}>
            关卡内容生成失败，你可以尝试手动重新生成。
          </p>
          <button className={styles.startButton} onClick={handleRegenerate}>
            <RefreshCw size={18} strokeWidth={2} />
            <span>重新生成</span>
          </button>
        </div>
      )}
    </div>
  )
}
