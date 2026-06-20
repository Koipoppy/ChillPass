import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/lessons" element={<LessonPathPage />} />
            <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
            <Route path="/chat" element={<AIChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/api" element={<ApiSettings />} />
            <Route path="/settings/storage" element={<StorageSettings />} />
            <Route path="/settings/data" element={<DataSettings />} />
            <Route path="/settings/about" element={<AboutSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
