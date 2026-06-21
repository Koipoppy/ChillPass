import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import TitleBar from './components/layout/TitleBar'
import GlassFilter from './components/common/GlassFilter'
import Background from './components/layout/Background'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import LessonPathPage from './pages/LessonPathPage'
import LessonDetailPage from './pages/LessonDetailPage'
import AIChatPage from './pages/AIChatPage'
import SettingsPage from './pages/SettingsPage'
import ApiSettings from './pages/settings/ApiSettings'
import StorageSettings from './pages/settings/StorageSettings'
import DataSettings from './pages/settings/DataSettings'
import AboutSettings from './pages/settings/AboutSettings'
import styles from './App.module.css'

/**
 * 页面切换动画变体
 * 参考 Apple HIG 的灵动过渡：新页面从右侧丝滑滑入，旧页面向左淡出
 * 使用 spring 弹性曲线营造灵动感
 */
const pageVariants = {
  initial: {
    opacity: 0,
    x: '100%',
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      x: { type: 'spring', stiffness: 380, damping: 38, mass: 0.8 },
    },
  },
  exit: {
    opacity: 0,
    x: '-30%',
    transition: {
      opacity: { duration: 0.2, ease: 'easeIn' },
      x: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
}

/** 带动画的页面包装器 */
function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={styles.pageWrapper}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'ChillPass — 期末冲刺助手'
  }, [])

  return (
    <>
      <GlassFilter />
      <Background />
      <TitleBar />
      <div className={styles.app}>
        <Sidebar />
        <main className={styles.main}>
          <AnimatePresence mode="popLayout">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
              <Route path="/upload" element={<AnimatedPage><UploadPage /></AnimatedPage>} />
              <Route path="/lessons" element={<AnimatedPage><LessonPathPage /></AnimatedPage>} />
              <Route path="/lessons/:lessonId" element={<AnimatedPage><LessonDetailPage /></AnimatedPage>} />
              <Route path="/chat" element={<AnimatedPage><AIChatPage /></AnimatedPage>} />
              <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
              <Route path="/settings/api" element={<AnimatedPage><ApiSettings /></AnimatedPage>} />
              <Route path="/settings/storage" element={<AnimatedPage><StorageSettings /></AnimatedPage>} />
              <Route path="/settings/data" element={<AnimatedPage><DataSettings /></AnimatedPage>} />
              <Route path="/settings/about" element={<AnimatedPage><AboutSettings /></AnimatedPage>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}
