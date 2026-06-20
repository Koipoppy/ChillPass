import { useState, useEffect } from 'react'
import styles from './TitleBar.module.css'

/**
 * macOS 风格窗口标题栏
 * 红黄绿三个圆点：关闭、最小化、最大化
 */
export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // 获取初始最大化状态
    window.electronAPI?.windowIsMaximized().then(setIsMaximized)

    // 监听最大化状态变化
    const cleanup = window.electronAPI?.onWindowMaximizeChange(setIsMaximized)
    return () => cleanup?.()
  }, [])

  const handleClose = () => {
    window.electronAPI?.windowClose()
  }

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.windowMaximize()
  }

  return (
    <div className={styles.titleBar}>
      <div className={styles.trafficLights}>
        <button
          className={styles.light}
          style={{ '--light-color': '#ff5f57' } as React.CSSProperties}
          onClick={handleClose}
          title="关闭"
          aria-label="关闭窗口"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </button>
        <button
          className={styles.light}
          style={{ '--light-color': '#febc2e' } as React.CSSProperties}
          onClick={handleMinimize}
          title="最小化"
          aria-label="最小化窗口"
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
    </div>
  )
}
