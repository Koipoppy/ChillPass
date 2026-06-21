import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Course, CourseFile, ExamPoint, Lesson, LessonContent, Progress, Priority, CourseBundle } from '@types/index'

const emptyProgress: Progress = {
  totalLessons: 0,
  completedLessons: 0,
  totalXP: 0,
  currentStreak: 0,
}

function createEmptyBundle(course: Course): CourseBundle {
  return {
    course,
    examPoints: [],
    lessons: [],
    progress: emptyProgress,
    rawText: '',
    generatingLessons: false,
    generationProgress: { current: 0, total: 0 },
  }
}

interface CourseState {
  courses: CourseBundle[]
  currentCourseId: string | null

  // Actions
  createCourse: (name: string) => string
  switchCourse: (id: string) => void
  deleteCourse: (id: string) => void
  addFiles: (files: CourseFile[]) => void
  setRawText: (text: string) => void
  appendRawText: (text: string) => void
  setExamPoints: (points: ExamPoint[]) => void
  mergeExamPoints: (points: ExamPoint[]) => void
  generateLessons: () => void
  setLessonContent: (lessonId: string, content: LessonContent) => void
  setGeneratingLessons: (generating: boolean, progress?: { current: number; total: number }) => void
  completeLesson: (lessonId: string) => void
  setExamDate: (date: string) => void
  resetCourse: () => void
  /** 批量更新文件路径（资源迁移后调用） */
  updateFilePaths: (pathMap: Record<string, string>) => void
}

/** 更新当前课程的辅助函数 */
function updateCurrentBundle(state: CourseState, updater: (bundle: CourseBundle) => CourseBundle): Partial<CourseState> {
  if (!state.currentCourseId) return {}
  return {
    courses: state.courses.map(b =>
      b.course.id === state.currentCourseId ? updater(b) : b
    )
  }
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [],
      currentCourseId: null,

      createCourse: (name) => {
        const id = nanoid()
        const course: Course = {
          id,
          name,
          files: [],
          status: 'empty',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set(state => ({
          courses: [...state.courses, createEmptyBundle(course)],
          currentCourseId: id,
        }))
        return id
      },

      switchCourse: (id) => {
        set({ currentCourseId: id })
      },

      deleteCourse: (id) => {
        set(state => {
          const courses = state.courses.filter(b => b.course.id !== id)
          const currentCourseId = state.currentCourseId === id
            ? (courses[0]?.course.id ?? null)
            : state.currentCourseId
          return { courses, currentCourseId }
        })
      },

      addFiles: (files) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          course: {
            ...bundle.course,
            files: [...bundle.course.files, ...files],
            status: 'uploaded',
            updatedAt: Date.now(),
          }
        })))
      },

      setRawText: (text) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          course: { ...bundle.course, status: 'uploaded', updatedAt: Date.now() },
          rawText: text,
        })))
      },

      appendRawText: (text) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          course: { ...bundle.course, status: 'uploaded', updatedAt: Date.now() },
          rawText: bundle.rawText + '\n\n' + text,
        })))
      },

      setExamPoints: (points) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          course: { ...bundle.course, status: 'ready', updatedAt: Date.now() },
          examPoints: points,
        })))
        get().generateLessons()
      },

      mergeExamPoints: (newPoints) => {
        const state = get()
        if (!state.currentCourseId) return
        const bundle = state.courses.find(b => b.course.id === state.currentCourseId)
        if (!bundle) return

        // 用标题去重：已有的考点保留，新增的考点追加
        const existingTitles = new Set(bundle.examPoints.map(p => p.title))
        const trulyNewPoints = newPoints.filter(p => !existingTitles.has(p.title))

        if (trulyNewPoints.length === 0) {
          // 没有新考点，只需更新状态
          set(s => updateCurrentBundle(s, b => ({
            ...b,
            course: { ...b.course, status: 'ready', updatedAt: Date.now() },
          })))
          return
        }

        // 合并考点列表
        const allPoints = [...bundle.examPoints, ...trulyNewPoints]

        // 按优先级排序
        const priorityOrder: Record<Priority, number> = { must: 0, high: 1, know: 2 }
        const sortedPoints = [...allPoints].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

        // 保留已有关卡，只为新考点创建关卡
        const existingLessons = bundle.lessons
        const newLessons: Lesson[] = trulyNewPoints.map(point => ({
          id: nanoid(),
          courseId: bundle.course.id,
          order: 0, // 稍后重新编号
          title: point.title,
          examPointId: point.id,
          priority: point.priority,
          status: 'locked',
          xp: point.priority === 'must' ? 40 : point.priority === 'high' ? 35 : 30,
          sourceFile: point.sourceFile,
        }))

        // 合并所有关卡并按优先级重新排序
        const allLessons = [...existingLessons, ...newLessons]
        const sortedLessons = [...allLessons].sort((a, b) => {
          const pa = priorityOrder[a.priority]
          const pb = priorityOrder[b.priority]
          if (pa !== pb) return pa - pb
          return 0 // 同优先级保持原有顺序
        })

        // 重新编号 order，并确保第一个未完成的关卡是 available
        let foundFirstIncomplete = false
        const reorderedLessons = sortedLessons.map((lesson, index) => {
          let status = lesson.status
          if (status !== 'completed') {
            if (!foundFirstIncomplete) {
              status = 'available'
              foundFirstIncomplete = true
            } else {
              status = 'locked'
            }
          }
          return { ...lesson, order: index + 1, status }
        })

        set(s => updateCurrentBundle(s, b => ({
          ...b,
          course: { ...b.course, status: 'ready', updatedAt: Date.now() },
          examPoints: sortedPoints,
          lessons: reorderedLessons,
          progress: {
            ...b.progress,
            totalLessons: reorderedLessons.length,
          },
        })))
      },

      generateLessons: () => {
        const state = get()
        if (!state.currentCourseId) return
        const bundle = state.courses.find(b => b.course.id === state.currentCourseId)
        if (!bundle || bundle.examPoints.length === 0) return

        const priorityOrder: Record<Priority, number> = { must: 0, high: 1, know: 2 }
        const sorted = [...bundle.examPoints].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

        const lessons: Lesson[] = sorted.map((point, index) => ({
          id: nanoid(),
          courseId: bundle.course.id,
          order: index + 1,
          title: point.title,
          examPointId: point.id,
          priority: point.priority,
          status: index === 0 ? 'available' : 'locked',
          xp: point.priority === 'must' ? 40 : point.priority === 'high' ? 35 : 30,
          sourceFile: point.sourceFile,
        }))

        set(s => updateCurrentBundle(s, b => ({
          ...b,
          lessons,
          progress: {
            totalLessons: lessons.length,
            completedLessons: 0,
            totalXP: 0,
            currentStreak: 0,
          },
        })))
      },

      setLessonContent: (lessonId, content) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          lessons: bundle.lessons.map(l =>
            l.id === lessonId ? { ...l, content } : l
          ),
        })))
      },

      setGeneratingLessons: (generating, progress) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          generatingLessons: generating,
          generationProgress: progress ?? bundle.generationProgress,
        })))
      },

      completeLesson: (lessonId) => {
        set(state => updateCurrentBundle(state, bundle => {
          const lesson = bundle.lessons.find(l => l.id === lessonId)
          if (!lesson || lesson.status === 'completed') return bundle

          const updatedLessons = bundle.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, status: 'completed' as const, completedAt: Date.now() }
            }
            if (l.order === lesson.order + 1 && l.status === 'locked') {
              return { ...l, status: 'available' as const }
            }
            return l
          })

          return {
            ...bundle,
            lessons: updatedLessons,
            progress: {
              ...bundle.progress,
              completedLessons: bundle.progress.completedLessons + 1,
              totalXP: bundle.progress.totalXP + lesson.xp,
            },
          }
        }))
      },

      setExamDate: (date) => {
        set(state => updateCurrentBundle(state, bundle => ({
          ...bundle,
          course: { ...bundle.course, examDate: date, updatedAt: Date.now() },
        })))
      },

      resetCourse: () => {
        set(state => updateCurrentBundle(state, bundle => createEmptyBundle({
          ...bundle.course,
          files: [],
          status: 'empty',
          examDate: undefined,
          updatedAt: Date.now(),
        })))
      },

      updateFilePaths: (pathMap) => {
        set(state => ({
          courses: state.courses.map(bundle => ({
            ...bundle,
            course: {
              ...bundle.course,
              files: bundle.course.files.map(f => {
                const newPath = pathMap[f.path]
                return newPath ? { ...f, path: newPath } : f
              }),
            },
          })),
        }))
      },
    }),
    {
      name: 'chillpass-course-v2',
    }
  )
)

/** 获取当前课程数据包的 hook 辅助函数 */
export function useCurrentBundle(): CourseBundle | null {
  return useCourseStore(s => {
    if (!s.currentCourseId) return null
    return s.courses.find(b => b.course.id === s.currentCourseId) ?? null
  })
}
