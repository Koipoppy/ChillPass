import { useState, useRef, useEffect, useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ChangeEvent as ReactChangeEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Send, MessageCircle, Trash2, Sparkles, ImageIcon, Loader, X } from 'lucide-react'
import { useChatStore } from '@stores/chatStore'
import { useCurrentBundle } from '@stores/courseStore'
import { chatWithTutor } from '@services/deepseek'
import { recognizeImageText, fileToDataURL } from '@services/imageService'
import type { ChatMessage } from '@types/index'
import { renderMarkdown } from '../utils/markdown'
import styles from './AIChatPage.module.css'

// 建议问题
const SUGGESTIONS = [
  '这个会考吗？',
  '用大白话解释重点',
  '帮我制定复习计划',
]

/** 单条消息气泡 */
function MessageBubble({
  message,
  isTyping,
}: {
  message: ChatMessage
  isTyping: boolean
}) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className={`${styles.messageRow} ${styles.messageRowUser} fade-in`}>
        <div className={`${styles.bubble} ${styles.bubbleUser}`}>
          <p className={styles.bubbleText}>{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.messageRow} ${styles.messageRowAssistant} fade-in`}>
      <div className={`${styles.bubble} ${styles.bubbleAssistant} liquid-glass`}>
        {isTyping ? (
          <div className={styles.typingIndicator}>
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
          </div>
        ) : (
          <div
            className={styles.markdownContent}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
      </div>
    </div>
  )
}

/** AI 助教聊天页面 */
export default function AIChatPage() {
  const messages = useChatStore(s => s.messages)
  const isStreaming = useChatStore(s => s.isStreaming)
  const addMessage = useChatStore(s => s.addMessage)
  const updateMessage = useChatStore(s => s.updateMessage)
  const setStreaming = useChatStore(s => s.setStreaming)
  const clearMessages = useChatStore(s => s.clearMessages)

  const bundle = useCurrentBundle()
  const rawText = bundle?.rawText ?? ''
  const currentCourse = bundle?.course

  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [imageRecognizing, setImageRecognizing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const [recognizedText, setRecognizedText] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(0)

  // 自定义滚动手柄相关状态
  const [showScrollHandle, setShowScrollHandle] = useState(false)
  const [handleOffset, setHandleOffset] = useState(0)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const scrollStart = useRef(0)

  const location = useLocation()

  // 从错题本跳转过来时，预填内容并自动聚焦
  useEffect(() => {
    const prefill = (location.state as any)?.prefill
    if (prefill) {
      setInput(prefill)
      textareaRef.current?.focus()
    }
  }, [location.state])

  // 自动滚动到底部：新消息用平滑滚动，流式更新用即时滚动
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const isNewMessage = messages.length > prevLengthRef.current
    prevLengthRef.current = messages.length

    container.scrollTo({
      top: container.scrollHeight,
      behavior: isNewMessage ? 'smooth' : 'auto',
    })
  }, [messages])

  // 输入框自适应高度 + 检测是否溢出
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    // 内容超出可视区域时显示自定义滚动手柄
    setShowScrollHandle(textarea.scrollHeight > textarea.clientHeight)
  }, [input])

  // 选择图片：Electron 环境用文件对话框获取路径，浏览器环境用 input
  const handleImagePick = useCallback(
    async (e?: ReactChangeEvent<HTMLInputElement>) => {
      let imageBuffer: ArrayBuffer | null = null
      let file: File | null = null

      if (e) {
        // 浏览器环境：从 input 获取 File
        file = e.target.files?.[0] ?? null
        e.target.value = ''
        if (!file) return
      } else if (window.electronAPI?.openImageDialog) {
        // Electron 环境：用文件对话框获取路径，再读取为 ArrayBuffer
        const result = await window.electronAPI.openImageDialog()
        if (!result || result.length === 0) return
        const filePath = result[0].path
        if (window.electronAPI?.readFileBuffer) {
          imageBuffer = await window.electronAPI.readFileBuffer(filePath)
        }
      } else {
        return
      }

      try {
        // 先生成预览
        if (file) {
          const dataUrl = await fileToDataURL(file)
          setAttachedImage(dataUrl)
        } else if (imageBuffer) {
          const dataUrl = await fileToDataURL(imageBuffer)
          setAttachedImage(dataUrl)
        }

        setRecognizedText(null)
        setImageRecognizing(true)
        setOcrProgress('正在加载识别引擎...')

        // OCR 识别：在渲染进程中使用 tesseract.js（CDN 加载资源）
        const text = await recognizeImageText(imageBuffer ?? file!, (status, progress) => {
          const statusMap: Record<string, string> = {
            'loading tesseract core': '加载识别核心...',
            'initializing tesseract': '初始化引擎...',
            'loading language traineddata': '加载语言包...',
            'initializing api': '准备识别...',
            'recognizing text': `识别中... ${Math.round(progress * 100)}%`,
          }
          setOcrProgress(statusMap[status] || status)
        })
        setRecognizedText(text)
      } catch (err) {
        console.error('图片识别失败', err)
        setRecognizedText(null)
        alert(err instanceof Error ? err.message : '图片识别失败，请重试')
      } finally {
        setImageRecognizing(false)
      }
    },
    []
  )

  // 移除已附加的图片
  const handleRemoveImage = useCallback(() => {
    setAttachedImage(null)
    setRecognizedText(null)
    setImageRecognizing(false)
  }, [])

  // 发送消息
  const handleSend = useCallback(
    async (text?: string) => {
      const rawContent = (text ?? input).trim()
      if (!rawContent || isStreaming) return

      // 若有图片识别结果，将其拼接到消息前面
      const content = recognizedText
        ? `[图片识别内容]\n${recognizedText}\n\n${rawContent}`
        : rawContent

      setInput('')
      setAttachedImage(null)
      setRecognizedText(null)

      // 构建对话历史（不包含当前消息，chatWithTutor 会自行追加）
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const courseId = currentCourse?.id

      // 添加用户消息
      addMessage('user', content, courseId)

      // 添加空的 AI 消息，准备接收流式内容
      const assistantId = addMessage('assistant', '', courseId)
      setStreaming(true)

      try {
        let accumulated = ''
        for await (const chunk of chatWithTutor(content, rawText, history)) {
          accumulated += chunk
          updateMessage(assistantId, accumulated)
        }
        // 没有收到任何内容时给出提示
        if (!accumulated) {
          updateMessage(assistantId, '抱歉，我没有收到回复内容，请重试。')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '发生未知错误'
        updateMessage(assistantId, `出错了：${errorMsg}`)
      } finally {
        setStreaming(false)
      }
    },
    [input, isStreaming, messages, rawText, currentCourse, recognizedText, addMessage, updateMessage, setStreaming]
  )

  // 键盘事件：Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 清空对话
  const handleClear = () => {
    if (isStreaming || messages.length === 0) return
    clearMessages()
  }

  // 自定义滚动手柄：拖拽控制 textarea 滚动
  // 逻辑：手柄跟随光标移动，光标往下 → 手柄往下 → 内容往下滚（显示下侧内容）
  const handleScrollStart = (e: ReactPointerEvent) => {
    isDragging.current = true
    dragStartY.current = e.clientY
    scrollStart.current = textareaRef.current?.scrollTop ?? 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleScrollMove = (e: ReactPointerEvent) => {
    if (!isDragging.current || !textareaRef.current) return
    const deltaY = e.clientY - dragStartY.current
    const maxScroll = textareaRef.current.scrollHeight - textareaRef.current.clientHeight
    // 光标往下（deltaY 正）→ 往下滚动（scrollTop 增大）→ 显示下侧内容
    if (maxScroll > 0) {
      textareaRef.current.scrollTop = Math.max(0, Math.min(maxScroll, scrollStart.current + deltaY))
    }
    // 手柄跟随光标移动（限制范围）
    const maxOffset = 30
    setHandleOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaY)))
  }

  const handleScrollEnd = () => {
    isDragging.current = false
    // 弹回中心
    setHandleOffset(0)
  }

  const canSend = input.trim().length > 0 && !isStreaming
  const canClear = messages.length > 0 && !isStreaming
  const canAttachImage = !isStreaming && !imageRecognizing

  return (
    <div className={styles.container}>
      {/* 顶部操作栏 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <MessageCircle size={20} strokeWidth={1.8} />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>AI 助教</h1>
            <p className={styles.subtitle}>
              {isStreaming
                ? '正在输入...'
                : currentCourse
                  ? `基于「${currentCourse.name}」课件`
                  : '通用学习助手'}
            </p>
          </div>
        </div>
        <button
          className={`${styles.clearBtn} ${!canClear ? styles.clearBtnDisabled : ''}`}
          onClick={handleClear}
          disabled={!canClear}
          title="清空对话"
        >
          <Trash2 size={18} strokeWidth={1.8} />
        </button>
      </header>

      {/* 消息区域 */}
      <div className={styles.messagesArea} ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={`${styles.welcomeCard} liquid-glass`}>
              <div className={styles.welcomeIcon}>
                <Sparkles size={32} strokeWidth={1.6} />
              </div>
              <h2 className={styles.welcomeTitle}>AI 助教</h2>
              <p className={styles.welcomeSubtitle}>
                有问题随时问，我结合你的课件来回答
              </p>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    className={styles.suggestionBtn}
                    onClick={() => handleSend(s)}
                    disabled={isStreaming}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1
              const isTyping =
                isStreaming &&
                msg.role === 'assistant' &&
                msg.content.length === 0 &&
                isLast
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isTyping={isTyping}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className={styles.inputArea}>
        {/* 图片预览 */}
        {attachedImage && (
          <div className={`${styles.imagePreview} liquid-glass`}>
            <div className={styles.imagePreviewInner}>
              <img
                src={attachedImage}
                alt="附加图片"
                className={styles.imageThumb}
              />
              <div className={styles.imagePreviewInfo}>
                {imageRecognizing ? (
                  <div className={styles.imageRecognizing}>
                    <Loader size={14} className={styles.spin} />
                    <span>{ocrProgress || '识别中...'}</span>
                  </div>
                ) : recognizedText ? (
                  <div className={styles.imagePreviewHint}>
                    已识别图片文字
                  </div>
                ) : (
                  <div className={styles.imagePreviewHint}>
                    识别失败，可移除后重试
                  </div>
                )}
              </div>
              <button
                className={styles.removeImageBtn}
                onClick={handleRemoveImage}
                title="移除图片"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}

        <div className={`${styles.inputWrapper} liquid-glass`}>
          {/* 图片上传按钮 */}
          <button
            className={`${styles.imageBtn} ${!canAttachImage ? styles.imageBtnDisabled : ''}`}
            onClick={() => {
              if (window.electronAPI?.openImageDialog) {
                handleImagePick()
              } else {
                fileInputRef.current?.click()
              }
            }}
            disabled={!canAttachImage}
            title="插入图片"
          >
            <ImageIcon size={18} strokeWidth={1.8} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImagePick}
          />
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? 'AI 正在回复...'
                : '输入你的问题，Enter 发送，Shift+Enter 换行'
            }
            disabled={isStreaming}
            rows={1}
          />
          {/* 自定义滚动条手柄：仅当内容溢出时显示 */}
          {showScrollHandle && (
            <div
              className={styles.scrollHandle}
              onPointerDown={handleScrollStart}
              onPointerMove={handleScrollMove}
              onPointerUp={handleScrollEnd}
              onPointerLeave={handleScrollEnd}
              style={{ '--handle-offset': `${handleOffset}px` } as React.CSSProperties}
            >
              <div className={styles.scrollHandleThumb} />
            </div>
          )}
          <button
            className={`${styles.sendBtn} ${!canSend ? styles.sendBtnDisabled : ''}`}
            onClick={() => handleSend()}
            disabled={!canSend}
            title="发送"
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
