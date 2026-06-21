import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Info,
  RefreshCw,
  Download,
  AlertCircle,
  Loader,
  Users,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react'
import type { UpdateInfo, UpdateStatus } from '@types/index'
import styles from './SettingsSub.module.css'

export default function AboutSettings() {
  const navigate = useNavigate()

  const [version, setVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyWechat = () => {
    navigator.clipboard.writeText('Eikawa_Koi').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  // 获取应用版本
  useEffect(() => {
    window.electronAPI
      .getAppVersion()
      .then(v => setVersion(v))
      .catch(() => setVersion('未知'))
  }, [])

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking')
    setErrorMsg('')
    setUpdateInfo(null)
    try {
      const info = await window.electronAPI.checkForUpdates()
      if (info) {
        setUpdateInfo(info)
        setUpdateStatus('available')
      } else {
        setUpdateStatus('not-available')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '检查更新时发生未知错误')
      setUpdateStatus('error')
    }
  }

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      window.electronAPI.openExternalUrl(updateInfo.downloadUrl)
    }
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
          <h1 className={styles.title}>关于</h1>
          <p className={styles.subtitle}>了解 ChillPass 并检查应用更新</p>
        </div>
      </header>

      {/* 应用信息 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>应用信息</h2>
        </div>

        <div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>应用名称</span>
            <span className={styles.infoValue}>ChillPass</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>版本</span>
            <span className={styles.infoValue}>{version || '加载中...'}</span>
          </div>
        </div>
      </section>

      {/* 更新检查 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>更新检查</h2>
          <p className={styles.cardDesc}>检查是否有新版本可用，保持应用为最新</p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCheckUpdate}
            disabled={updateStatus === 'checking'}
          >
            <RefreshCw
              size={16}
              strokeWidth={2}
              style={updateStatus === 'checking' ? { animation: 'spin 0.8s linear infinite' } : undefined}
            />
            {updateStatus === 'checking' ? '检查中...' : '检查更新'}
          </button>
        </div>

        {updateStatus === 'checking' && (
          <div className={styles.updateStatus}>
            <div className={styles.updateStatusText} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader size={16} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} />
              正在检查更新，请稍候...
            </div>
          </div>
        )}

        {updateStatus === 'available' && updateInfo && (
          <div className={`${styles.updateStatus} ${styles.updateStatusAvailable}`}>
            <div className={styles.updateStatusText}>
              发现新版本 <strong>v{updateInfo.version}</strong>（当前 v{updateInfo.currentVersion}）
            </div>
            {updateInfo.releaseDate && (
              <div className={styles.updateStatusText} style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                发布日期：{updateInfo.releaseDate}
              </div>
            )}
            {updateInfo.releaseNotes && (
              <div className={styles.releaseNotes}>{updateInfo.releaseNotes}</div>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleDownload}
              >
                <Download size={16} strokeWidth={2} />
                下载新版本
              </button>
            </div>
          </div>
        )}

        {updateStatus === 'not-available' && (
          <div className={styles.updateStatus}>
            <div className={styles.updateStatusText} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} strokeWidth={2} />
              当前已是最新版本，无需更新
            </div>
          </div>
        )}

        {updateStatus === 'error' && (
          <div className={styles.updateStatus} style={{ borderColor: 'rgba(255, 59, 48, 0.25)', background: 'rgba(255, 59, 48, 0.05)' }}>
            <div className={styles.updateStatusText} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-text)' }}>
              <AlertCircle size={16} strokeWidth={2} />
              检查更新失败：{errorMsg}
            </div>
          </div>
        )}
      </section>

      {/* 加入我们 */}
      <section className={`liquid-glass ${styles.card}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>加入我们</h2>
          <p className={styles.cardDesc}>添加开发者微信，交流反馈或参与项目共建</p>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>微信号</span>
          <span className={styles.infoValue} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={16} strokeWidth={2} />
            Eikawa_Koi
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleCopyWechat}
              style={{ marginLeft: 8, padding: '6px 14px', fontSize: 13 }}
            >
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2} />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={2} />
                  复制
                </>
              )}
            </button>
          </span>
        </div>
      </section>
    </div>
  )
}
