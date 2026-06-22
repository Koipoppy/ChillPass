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
import {
  generateLessonContent,
  gradeAnswer,
  regenerateQuizQuestion,
} from '@services/deepseek'
import type { Priority, QuizQuestion, QuizType } from '@types/index'
import { renderMarkdown, renderInlineMarkdown } from '../utils/markdown'
import styles from './LessonDetailPage.module.css'

const priorityLabel: Record<Priority, string> = {
  must: '必考',
  high: '高频',
  know: '了解',
}

/** 打乱选择题选项顺序，返回新 correctIndex */
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  if (!q.options || q.correctIndex === undefined) return q
  const correctOption = q.options[q.correctIndex]
  const shuffled = [...q.options].sort(() => Math.random() - 0.5)
  const newCorrectIndex = shuffled.indexOf(correctOption)
  return { ...q, options: shuffled, correctIndex: newCorrectIndex }
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
  // 小测状态：一题一页
  const [quizPage, setQuizPage] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [pageSolved, setPageSolved] = useState<Set<number>>(new Set())
  const [textAnswer, setTextAnswer] = useState('')
  const [grading, setGrading] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null)
  const [choiceSelected, setChoiceSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  // 切换关卡时重置本地状态
  useEffect(() => {
    setRegenerating(false)
    setError(null)
    setTab('points')
    setQuizPage(0)
    setPageSolved(new Set())
    setTextAnswer('')
    setGrading(false)
    setFeedback(null)
    setChoiceSelected(null)
    setRevealed(false)
  }, [lessonId])

  // 同步小测题目（内容加载或重新生成时）
  useEffect(() => {
    if (content?.quiz) {
      setQuizQuestions(content.quiz)
      setQuizPage(0)
      setPageSolved(new Set())
      setTextAnswer('')
      setFeedback(null)
      setChoiceSelected(null)
      setRevealed(false)
    }
  }, [content])

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '内容生成失败，请重试')
    } finally {
      setRegenerating(false)
    }
  }

  const handleComplete = () => {
    completeLesson(lesson.id)
    navigate('/lessons')
  }

  /** 选择题：点击选项 */
  const handleChoiceAnswer = (optionIndex: number) => {
    if (revealed) return
    const q = quizQuestions[quizPage]
    if (!q || q.correctIndex === undefined) return

    setChoiceSelected(optionIndex)
    setRevealed(true)

    if (optionIndex === q.correctIndex) {
      setPageSolved(prev => new Set(prev).add(quizPage))
    } else if (examPoint && bundle) {
      addWrongQuestion({
        courseId: bundle.course.id,
        courseName: bundle.course.name,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        question: q.question,
        quizType: q.type,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: optionIndex,
        explanation: q.explanation,
        examPointTitle: examPoint.title,
        priority: lesson.priority,
      })
    }
  }

  /** 选择题：再试一次（打乱选项） */
  const handleRetryChoice = () => {
    const q = quizQuestions[quizPage]
    if (!q) return
    const shuffled = shuffleOptions(q)
    setQuizQuestions(prev => prev.map((item, i) => (i === quizPage ? shuffled : item)))
    setChoiceSelected(null)
    setRevealed(false)
  }

  /** 填空/简答题：提交答案 */
  const handleSubmitText = async () => {
    const q = quizQuestions[quizPage]
    if (!q || !textAnswer.trim()) return

    setGrading(true)
    try {
      const result = await gradeAnswer(
        q.question,
        textAnswer,
        q.answer || '',
        q.acceptableAnswers || []
      )
      setFeedback({ correct: result.correct, text: result.feedback })
      if (result.correct) {
        setPageSolved(prev => new Set(prev).add(quizPage))
      } else if (examPoint && bundle) {
        addWrongQuestion({
          courseId: bundle.course.id,
          courseName: bundle.course.name,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          question: q.question,
          quizType: q.type,
          userAnswer: textAnswer,
          correctAnswer: q.answer,
          explanation: q.explanation,
          examPointTitle: examPoint.title,
          priority: lesson.priority,
        })
      }
    } catch {
      setFeedback({ correct: false, text: '评阅失败，请重试' })
    } finally {
      setGrading(false)
    }
  }

  /** 填空/简答题：换一道（重新生成） */
  const handleRegenerateQuestion = async () => {
    const q = quizQuestions[quizPage]
    if (!q || !examPoint) return

    setGrading(true)
    try {
      const newQ = await regenerateQuizQuestion(
        q.examPointTitle || examPoint.title,
        q.question,
        rawText
      )
      setQuizQuestions(prev => prev.map((item, i) => (i === quizPage ? newQ : item)))
      setTextAnswer('')
      setFeedback(null)
      setChoiceSelected(null)
      setRevealed(false)
    } catch {
      setFeedback({ correct: false, text: '题目重新生成失败，请重试' })
    } finally {
      setGrading(false)
    }
  }

  /** 下一题 */
  const handleNextPage = () => {
    if (quizPage < quizQuestions.length - 1) {
      setQuizPage(prev => prev + 1)
      setTextAnswer('')
      setFeedback(null)
      setChoiceSelected(null)
      setRevealed(false)
    }
  }

  /** 跳转到已完成的题目 */
  const handleNavigateToPage = (pageIndex: number) => {
    if (pageSolved.has(pageIndex)) {
      setQuizPage(pageIndex)
      setTextAnswer('')
      setFeedback(null)
      setChoiceSelected(null)
      setRevealed(false)
    }
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
            {content.quiz.length > 0 && (
              <button
                className={`${styles.tab} ${tab === 'quiz' ? styles.tabActive : ''}`}
                onClick={() => setTab('quiz')}
              >
                <HelpCircle size={16} strokeWidth={2} />
                <span>小测</span>
              </button>
            )}
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
              {quizQuestions.length === 0 ? (
                <div className={`${styles.emptyHint} liquid-glass`}>
                  本关暂无小测题
                </div>
              ) : (
                <>
                  {/* 进度点 */}
                  <div className={styles.quizProgress}>
                    {quizQuestions.map((_, i) => {
                      const isCompleted = pageSolved.has(i)
                      const isCurrent = i === quizPage
                      let dotClass = styles.progressDot
                      if (isCompleted) {
                        dotClass += ` ${styles.progressDotCompleted}`
                      } else if (isCurrent) {
                        dotClass += ` ${styles.progressDotCurrent}`
                      } else {
                        dotClass += ` ${styles.progressDotLocked}`
                      }
                      return (
                        <div
                          key={i}
                          className={dotClass}
                          onClick={() => isCompleted && handleNavigateToPage(i)}
                        >
                          {isCompleted && <Check size={10} strokeWidth={3} />}
                        </div>
                      )
                    })}
                  </div>

                  {/* 当前题目 */}
                  {(() => {
                    const q = quizQuestions[quizPage]
                    if (!q) return null
                    const qType: QuizType = q.type || 'choice'
                    const isSolved = pageSolved.has(quizPage)
                    const isLastPage = quizPage === quizQuestions.length - 1
                    const allSolved = pageSolved.size === quizQuestions.length

                    return (
                      <div className={`${styles.quizPageCard} liquid-glass`}>
                        <div className={styles.quizHeader}>
                          <span>问题 {quizPage + 1} / {quizQuestions.length}</span>
                          <span className={styles.quizTypeTag}>
                            {qType === 'choice' ? '选择题' : qType === 'fill' ? '填空题' : '简答题'}
                          </span>
                        </div>
                        <div
                          className={`${styles.quizQuestion} ${styles.markdownContent}`}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(q.question) }}
                        />

                        {/* 选择题 */}
                        {qType === 'choice' && q.options && (
                          <div className={styles.quizOptions}>
                            {q.options.map((opt, oi) => {
                              const isCorrect = oi === q.correctIndex
                              const isSelected = choiceSelected === oi
                              let cls = styles.quizOption
                              if (revealed) {
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
                                  onClick={() => handleChoiceAnswer(oi)}
                                  disabled={revealed}
                                >
                                  <span className={styles.optionLabel}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <span
                                    className={`${styles.optionText} ${styles.markdownContent}`}
                                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(opt) }}
                                  />
                                  {revealed && isCorrect && (
                                    <Check size={16} className={styles.optionIcon} />
                                  )}
                                  {revealed && isSelected && !isCorrect && (
                                    <X size={16} className={styles.optionIcon} />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* 填空题 */}
                        {qType === 'fill' && (
                          <input
                            type="text"
                            className={styles.textInput}
                            value={textAnswer}
                            onChange={e => setTextAnswer(e.target.value)}
                            placeholder="请输入你的答案"
                            disabled={feedback?.correct === true}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !grading && feedback?.correct !== true) {
                                handleSubmitText()
                              }
                            }}
                          />
                        )}

                        {/* 简答题 */}
                        {qType === 'short' && (
                          <textarea
                            className={styles.textareaInput}
                            value={textAnswer}
                            onChange={e => setTextAnswer(e.target.value)}
                            placeholder="请输入你的答案"
                            disabled={feedback?.correct === true}
                            rows={4}
                          />
                        )}

                        {/* 提交按钮（填空/简答） */}
                        {(qType === 'fill' || qType === 'short') &&
                          feedback?.correct !== true && (
                            <button
                              className={styles.submitBtn}
                              onClick={handleSubmitText}
                              disabled={grading || !textAnswer.trim()}
                            >
                              {grading && (
                                <Loader size={16} className={styles.submitSpinner} />
                              )}
                              {grading ? '评阅中...' : '提交'}
                            </button>
                          )}

                        {/* 反馈（填空/简答） */}
                        {feedback && (
                          <div
                            className={`${styles.feedback} ${
                              feedback.correct
                                ? styles.feedbackCorrect
                                : styles.feedbackWrong
                            }`}
                          >
                            <span className={styles.explanationLabel}>
                              {feedback.correct ? '回答正确' : '回答错误'}
                            </span>
                            <span>{feedback.text}</span>
                          </div>
                        )}

                        {/* 解析（选择题） */}
                        {qType === 'choice' && revealed && (
                          <div
                            className={`${styles.quizExplanation} ${
                              choiceSelected === q.correctIndex
                                ? styles.quizExplanationCorrect
                                : styles.quizExplanationWrong
                            }`}
                          >
                            <span className={styles.explanationLabel}>
                              {choiceSelected === q.correctIndex ? '回答正确' : '回答错误'}
                            </span>
                            <span
                              className={styles.markdownContent}
                              dangerouslySetInnerHTML={{
                                __html: renderInlineMarkdown(q.explanation),
                              }}
                            />
                          </div>
                        )}

                        {/* 导航 */}
                        <div className={styles.quizNav}>
                          <div>
                            {qType === 'choice' &&
                              revealed &&
                              choiceSelected !== q.correctIndex && (
                                <button
                                  className={styles.retryBtn}
                                  onClick={handleRetryChoice}
                                >
                                  <RefreshCw size={14} strokeWidth={2} />
                                  <span>再试一次</span>
                                </button>
                              )}
                            {(qType === 'fill' || qType === 'short') &&
                              feedback &&
                              !feedback.correct && (
                                <button
                                  className={styles.retryBtn}
                                  onClick={handleRegenerateQuestion}
                                  disabled={grading}
                                >
                                  <RefreshCw size={14} strokeWidth={2} />
                                  <span>换一道</span>
                                </button>
                              )}
                          </div>
                          <div>
                            {isSolved && !isLastPage && (
                              <button
                                className={styles.quizNavBtn}
                                onClick={handleNextPage}
                              >
                                <span>下一题</span>
                              </button>
                            )}
                            {isSolved && isLastPage && allSolved && !isCompleted && (
                              <button
                                className={styles.quizNavBtn}
                                onClick={handleComplete}
                              >
                                <CheckCircle size={16} strokeWidth={2} />
                                <span>完成关卡</span>
                              </button>
                            )}
                            {isSolved && isLastPage && allSolved && isCompleted && (
                              <div className={styles.alreadyCompleted}>
                                <CheckCircle size={16} strokeWidth={2} />
                                <span>本关已完成</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </>
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
