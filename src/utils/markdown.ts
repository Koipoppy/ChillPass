import { marked } from 'marked'
import DOMPurify from 'dompurify'
import katex from 'katex'

// Configure marked with custom renderer for math
const renderer = new marked.Renderer()
const originalParagraph = renderer.paragraph.bind(renderer)
renderer.paragraph = (text) => {
  return originalParagraph(text)
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

// Render LaTeX math expressions using KaTeX
function renderMath(text: string): string {
  // Inline math: $...$ or \(...\)
  text = text.replace(/\$([^\$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false })
    } catch {
      return `$${math}$`
    }
  })
  text = text.replace(/\\\((.+?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false })
    } catch {
      return `\\(${math}\\)`
    }
  })
  // Display math: $$...$$ or \[...\]
  text = text.replace(/\$\$([^\$]+)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false })
    } catch {
      return `$$${math}$$`
    }
  })
  text = text.replace(/\\\[(.+?)\\\]/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false })
    } catch {
      return `\\[${math}\\]`
    }
  })
  return text
}

export function renderMarkdown(content: string): string {
  // First render math, then markdown
  const withMath = renderMath(content)
  const rawHtml = marked.parse(withMath) as string
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['span', 'math', 'semantics', 'annotation'],
    ADD_ATTR: ['class', 'style'],
  })
}

/** 将 Markdown 内容渲染为安全的内联 HTML（不包裹 <p>，适合放在 span/按钮等内联元素中） */
export function renderInlineMarkdown(content: string): string {
  const withMath = renderMath(content)
  const rawHtml = marked.parseInline(withMath) as string
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['span', 'math', 'semantics', 'annotation'],
    ADD_ATTR: ['class', 'style'],
  })
}
