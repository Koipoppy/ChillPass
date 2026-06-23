import { useState, useEffect, useRef } from 'react'
import { Clock, Maximize2, Minimize2 } from 'lucide-react'
import { useStudyTimeStore, formatStudyTime } from '@stores/studyTimeStore'
import { useT } from '../../i18n'
import styles from './TitleBar.module.css'

/**
 * macOS 风格窗口标题栏
 * 红黄绿三个圆点：关闭、最小化、最大化
 * 中间显示学习时长，右侧专注模式按钮
 */
export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [, setTick] = useState(0)
  const t = useT()

  const totalSeconds = useStudyTimeStore(s => s.totalSeconds)
  const sessionStart = useStudyTimeStore(s => s.sessionStart)
  const startSession = useStudyTimeStore(s => s.startSession)
  const endSession = useStudyTimeStore(s => s.endSession)

  const secondTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const persistTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 获取初始最大化状态
    window.electronAPI?.windowIsMaximized().then(setIsMaximized)
    // 监听最大化状态变化
    const maxCleanup = window.electronAPI?.onWindowMaximizeChange(setIsMaximized)

    // 获取初始全屏（专注）状态
    window.electronAPI?.isFullScreen().then(setIsFocusMode)
    // 监听专注模式退出回调
    const focusCleanup = window.electronAPI?.onFocusExited(() => {
      setIsFocusMode(false)
    })

    // 学习时长：开始会话
    startSession()

    // 每秒更新显示
    secondTimerRef.current = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)

    // 每 60 秒持久化一次
    persistTimerRef.current = setInterval(() => {
      endSession()
      startSession()
    }, 60 * 1000)

    return () => {
      maxCleanup?.()
      focusCleanup?.()
      if (secondTimerRef.current) clearInterval(secondTimerRef.current)
      if (persistTimerRef.current) clearInterval(persistTimerRef.current)
      // 卸载时结束会话以累计时间
      endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 计算当前显示的学习时长（累计 + 本次会话已过时间）
  const sessionElapsed = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0
  const displaySeconds = totalSeconds + sessionElapsed

  const handleClose = () => {
    window.electronAPI?.windowClose()
  }

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.windowMaximize()
  }

  const handleFocusToggle = () => {
    if (isFocusMode) {
      // 退出专注：弹出原生确认对话框
      window.electronAPI?.focusExitConfirm()
    } else {
      // 进入专注
      window.electronAPI?.enterFocusMode()
      setIsFocusMode(true)
    }
  }

  return (
    <div className={styles.titleBar}>
      <div className={styles.trafficLights}>
        <button
          className={styles.light}
          style={{ '--light-color': '#ff5f57' } as React.CSSProperties}
          onClick={handleClose}
          title={t('titlebar.close')}
          aria-label={t('titlebar.close')}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </button>
        <button
          className={styles.light}
          style={{ '--light-color': '#febc2e' } as React.CSSProperties}
          onClick={handleMinimize}
          title={t('titlebar.minimize')}
          aria-label={t('titlebar.minimize')}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4H6.5" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </button>
        <button
          className={styles.light}
          style={{ '--light-color': '#28c840' } as React.CSSProperties}
          onClick={handleMaximize}
          title={isMaximized ? '还原' : '最大化'}
          aria-label="最大化窗口"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M2 2L6 2L6 6M6 2L2 6" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          </svg>
        </button>
      </div>

      <div className={styles.centerArea}>
        <div className={styles.studyTime}>
          <Clock size={12} strokeWidth={2} />
          <span>{formatStudyTime(displaySeconds)}</span>
        </div>
      </div>

      <div className={styles.rightArea}>
        <button
          className={`${styles.focusBtn} ${isFocusMode ? styles.focusBtnActive : ''}`}
          onClick={handleFocusToggle}
          title={isFocusMode ? t('titlebar.exitFocus') : t('titlebar.focusMode')}
        >
          {isFocusMode ? (
            <>
              <Minimize2 size={13} strokeWidth={2} />
              <span>{t('titlebar.exitFocus')}</span>
            </>
          ) : (
            <>
              <Maximize2 size={13} strokeWidth={2} />
              <span>{t('titlebar.focusMode')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
