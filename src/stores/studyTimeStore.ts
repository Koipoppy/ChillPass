import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudyTimeState {
  /** 累计学习时间（秒） */
  totalSeconds: number
  /** 本次会话开始时间戳 */
  sessionStart: number | null
  /** 增加学习时间 */
  addTime: (seconds: number) => void
  /** 开始会话 */
  startSession: () => void
  /** 结束会话并累计时间 */
  endSession: () => void
  /** 重置 */
  reset: () => void
}

export const useStudyTimeStore = create<StudyTimeState>()(
  persist(
    (set, get) => ({
      totalSeconds: 0,
      sessionStart: null,

      addTime: (seconds) => {
        set(state => ({ totalSeconds: state.totalSeconds + seconds }))
      },

      startSession: () => {
        set({ sessionStart: Date.now() })
      },

      endSession: () => {
        const { sessionStart } = get()
        if (sessionStart) {
          const elapsed = Math.floor((Date.now() - sessionStart) / 1000)
          set(state => ({
            totalSeconds: state.totalSeconds + elapsed,
            sessionStart: null,
          }))
        }
      },

      reset: () => set({ totalSeconds: 0, sessionStart: null }),
    }),
    {
      name: 'chillpass-study-time',
    }
  )
)

/** 格式化学习时间为简短显示 */
export function formatStudyTime(seconds: number): string {
  if (seconds < 60) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h${minutes > 0 ? minutes + 'm' : ''}`
  return `${minutes}m`
}
