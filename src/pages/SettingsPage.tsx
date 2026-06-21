import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  LogIn,
  LogOut,
  Key,
  HardDrive,
  Database,
  Info,
  ChevronRight,
  RefreshCw,
  Download,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react'
import { useAuthStore } from '@stores/authStore'
import { useCourseStore } from '@stores/courseStore'
import { useThemeStore } from '@stores/themeStore'
import { useLanguageStore, LANGUAGES } from '@stores/languageStore'
import type { Language } from '@stores/languageStore'
import type { UpdateInfo, UpdateStatus } from '@types/index'
import AccountLogin from '@components/AccountLogin'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const navigate = useNavigate()
  const account = useAuthStore(s => s.account)
  const logout = useAuthStore(s => s.logout)
  const courses = useCourseStore(s => s.courses)

  const theme = useThemeStore(s => s.theme)
  const setTheme = useThemeStore(s => s.setTheme)
  const language = useLanguageStore(s => s.language)
  const setLanguage = useLanguageStore(s => s.setLanguage)

  const [showLogin, setShowLogin] = useState(false)
  const [appVersion, setAppVersion] = useState('1.0.0')
  const [pendingLang, setPendingLang] = useState<Language>(language)
  const [langApplied, setLangApplied] = useState(false)

  // 更新检查状态
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    window.electronAPI
      .getAppVersion()
      .then(setAppVersion)
      .catch(() => {})
  }, [])

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking')
    setUpdateError('')
    try {
      const info = await window.electronAPI.checkForUpdates()
      if (info) {
        setUpdateInfo(info)
        setUpdateStatus('available')
      } else {
        setUpdateStatus('not-available')
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : '检查失败')
      setUpdateStatus('error')
    }
  }

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
    }
  }

  const handleApplyLanguage = () => {
    setLanguage(pendingLang)
    setLangApplied(true)
    window.setTimeout(() => setLangApplied(false), 2000)
  }

  // 统计数据
  const totalCourses = courses.length
  const totalFiles = courses.reduce((sum, b) => sum + b.course.files.length, 0)

  // 账号头像首字
  const avatarChar = account?.name?.charAt(0)?.toUpperCase() || '?'

  const navCards = [
    {
      path: '/settings/api',
      icon: Key,
      title: 'API 配置',
      desc: 'DeepSeek 模型密钥与参数',
    },
    {
      path: '/settings/storage',
      icon: HardDrive,
      title: '存储与迁移',
      desc: '资源路径配置与文件迁移',
    },
    {
      path: '/settings/data',
      icon: Database,
      title: '数据管理',
      desc: '课程数据统计与清除',
    },
    {
      path: '/settings/about',
      icon: Info,
      title: '关于',
      desc: '应用信息与检查更新',
    },
  ]

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>设置</h1>
        <p className={styles.subtitle}>应用信息、账户与偏好设置</p>
      </header>

      {/* 1. 应用信息卡片 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.appInfoTop}>
          <div className={styles.appLogo}>
            <Sparkles size={24} strokeWidth={1.8} />
          </div>
          <div className={styles.appInfoText}>
            <h2 className={styles.appName}>ChillPass</h2>
            <p className={styles.appDesc}>AI 驱动的闯关式期末冲刺助手</p>
          </div>
          <div className={styles.versionBadge}>v{appVersion}</div>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{totalCourses}</span>
            <span className={styles.statLabel}>课程</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{totalFiles}</span>
            <span className={styles.statLabel}>课件文件</span>
          </div>
        </div>

        {/* 快速检查更新 */}
        <div className={styles.updateSection}>
          {updateStatus === 'idle' && (
            <button className={styles.updateBtn} onClick={handleCheckUpdate}>
              <RefreshCw size={15} strokeWidth={2} />
              检查更新
            </button>
          )}
          {updateStatus === 'checking' && (
            <div className={styles.updateChecking}>
              <RefreshCw size={15} strokeWidth={2} className={styles.spinIcon} />
              <span>正在检查更新...</span>
            </div>
          )}
          {updateStatus === 'not-available' && (
            <div className={styles.updateToDate}>
              <span>已是最新版本 v{appVersion}</span>
              <button className={styles.recheckBtn} onClick={handleCheckUpdate}>
                重新检查
              </button>
            </div>
          )}
          {updateStatus === 'available' && updateInfo && (
            <div className={styles.updateAvailable}>
              <div className={styles.updateAvailableText}>
                发现新版本 v{updateInfo.version}
                <span className={styles.updateCurrentVer}>（当前 v{updateInfo.currentVersion}）</span>
              </div>
              <button
                className={styles.downloadBtn}
                onClick={() => window.electronAPI.openExternalUrl(updateInfo.downloadUrl)}
              >
                <Download size={15} strokeWidth={2} />
                下载更新
              </button>
            </div>
          )}
          {updateStatus === 'error' && (
            <div className={styles.updateError}>
              <span>{updateError}</span>
              <button className={styles.recheckBtn} onClick={handleCheckUpdate}>
                重试
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. 账户信息卡片 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>账户信息</h2>
          <p className={styles.cardDesc}>校园账号登录，为未来教务系统对接做准备</p>
        </div>

        {account ? (
          <div className={styles.accountCard}>
            <div className={styles.avatar}>{avatarChar}</div>
            <div className={styles.accountInfo}>
              <span className={styles.accountName}>{account.name}</span>
              <span className={styles.accountMeta}>
                {account.school} · {account.studentId}
              </span>
              <span className={styles.accountMeta}>
                {account.college} · {account.major} · {account.grade}
              </span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={16} strokeWidth={2} />
              退出登录
            </button>
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <div className={styles.loginPromptIcon}>
              <GraduationCap size={28} strokeWidth={1.6} />
            </div>
            <div className={styles.loginPromptText}>
              <span className={styles.loginPromptTitle}>尚未登录校园账号</span>
              <span className={styles.loginPromptDesc}>
                登录后可同步课程信息，未来支持教务系统自动导入
              </span>
            </div>
            <button className={styles.loginBtn} onClick={() => setShowLogin(true)}>
              <LogIn size={16} strokeWidth={2} />
              登录
            </button>
          </div>
        )}
      </section>

      {/* 3. 外观与语言 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>外观与语言</h2>
          <p className={styles.cardDesc}>切换浅色/深色主题，选择界面语言</p>
        </div>

        <div className={styles.appearanceRow}>
          <span className={styles.appearanceLabel}>
            <Sun size={16} strokeWidth={2} />
            主题
          </span>
          <div className={styles.themeToggle}>
            <button
              type="button"
              className={`${styles.themeOption} ${theme === 'light' ? styles.themeOptionActive : ''}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={14} strokeWidth={2} />
              浅色
            </button>
            <button
              type="button"
              className={`${styles.themeOption} ${theme === 'dark' ? styles.themeOptionActive : ''}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={14} strokeWidth={2} />
              深色
            </button>
          </div>
        </div>

        <div className={styles.appearanceRow}>
          <span className={styles.appearanceLabel}>
            <Globe size={16} strokeWidth={2} />
            语言
          </span>
          <div className={styles.langGrid}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`${styles.langOption} ${pendingLang === lang.code ? styles.langOptionActive : ''}`}
                onClick={() => setPendingLang(lang.code)}
              >
                <span className={styles.langFlag}>{lang.flag}</span>
                <span className={styles.langLabel}>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {pendingLang !== language && (
          <div className={styles.langApplyRow}>
            {langApplied && (
              <span className={styles.langAppliedHint}>已应用</span>
            )}
            <button
              type="button"
              className={styles.langApplyBtn}
              onClick={handleApplyLanguage}
            >
              <Check size={15} strokeWidth={2.4} />
              应用语言
            </button>
          </div>
        )}
      </section>

      {/* 4. 导航卡片网格 */}
      <section className={styles.navGrid}>
        {navCards.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              className={`liquid-glass ${styles.navCard}`}
              onClick={() => navigate(item.path)}
            >
              <div className={styles.navCardIcon}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div className={styles.navCardText}>
                <span className={styles.navCardTitle}>{item.title}</span>
                <span className={styles.navCardDesc}>{item.desc}</span>
              </div>
              <ChevronRight size={18} strokeWidth={2} className={styles.navCardArrow} />
            </button>
          )
        })}
      </section>

      {/* 登录弹窗 */}
      {showLogin && <AccountLogin onClose={() => setShowLogin(false)} />}
    </div>
  )
}
