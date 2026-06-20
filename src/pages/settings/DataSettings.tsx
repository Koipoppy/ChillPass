import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCourseStore } from '@stores/courseStore'
import styles from './SettingsSub.module.css'

export default function DataSettings() {
  const navigate = useNavigate()
  const courses = useCourseStore(s => s.courses)

  const [confirmClear, setConfirmClear] = useState(false)

  const courseCount = courses.length
  const totalFiles = courses.reduce((sum, bundle) => sum + bundle.course.files.length, 0)

  const handleClearData = () => {
    // 清除课程数据（courseStore 的 persist key）
    localStorage.removeItem('chillpass-course-v2')
    // 刷新页面以重置内存状态
    window.location.reload()
  }

  return (
    <div className={`${styles.subPage} fade-in`}>
      <header className={styles.subHeader}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/settings')}
          aria-label="返回设置"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>数据管理</h1>
          <p className={styles.subtitle}>管理本地存储的课程与学习数据</p>
        </div>
      </header>

      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>数据统计</h2>
          <p className={styles.cardDesc}>查看当前本地存储的课程与课件数量</p>
        </div>

        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{courseCount}</span>
            <span className={styles.statLabel}>课程数量</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{totalFiles}</span>
            <span className={styles.statLabel}>课件文件</span>
          </div>
        </div>
      </section>

      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>危险操作</h2>
          <p className={styles.cardDesc}>
            清除操作将删除所有已上传的课件、考点与闯关进度，且不可恢复
          </p>
        </div>

        {!confirmClear ? (
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 size={16} strokeWidth={2} />
            清除所有课程数据
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <div className={styles.confirmText}>
              确定要清除所有课程数据吗？此操作不可恢复，将删除所有已上传的课件、考点与闯关进度。
            </div>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setConfirmClear(false)}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.dangerSolidBtn}
                onClick={handleClearData}
              >
                <Trash2 size={16} strokeWidth={2} />
                确认清除
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
