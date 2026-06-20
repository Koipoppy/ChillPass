import { NavLink } from 'react-router-dom'
import { Home, Upload, BookOpen, MessageCircle, Settings } from 'lucide-react'
import styles from './Sidebar.module.css'
import { useCourseStore, useCurrentBundle } from '@stores/courseStore'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/upload', label: '导入课件', icon: Upload },
  { path: '/lessons', label: '闯关冲刺', icon: BookOpen },
  { path: '/chat', label: 'AI 助教', icon: MessageCircle },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Sidebar() {
  const bundle = useCurrentBundle()
  const course = bundle?.course
  const progress = bundle?.progress

  return (
    <aside className={styles.sidebar}>
      <div className={`${styles.sidebarInner} liquid-glass`}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoText}>ChillPass</span>
        </div>

        {/* 导航 */}
        <nav className={styles.nav}>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* 课程进度卡片 */}
        {course && course.status === 'ready' && (
          <div className={styles.progressCard}>
            <div className={styles.progressCourseName}>{course.name}</div>
            <div className={styles.progressStats}>
              <span className={styles.progressNumber}>
                {progress!.completedLessons}/{progress!.totalLessons}
              </span>
              <span className={styles.progressLabel}>关卡</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${progress!.totalLessons > 0
                    ? (progress!.completedLessons / progress!.totalLessons) * 100
                    : 0}%`
                }}
              />
            </div>
            <div className={styles.progressXP}>
              <span style={{ color: 'var(--success-text)' }}>{progress!.totalXP} XP</span>
              {bundle!.generatingLessons && (
                <span className={styles.generatingBadge}>生成中...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
