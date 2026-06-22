import type { ExamPoint, LessonContent, QuizQuestion } from '@types/index'
import { useSettingsStore } from '@stores/settingsStore'

const API_URL = 'https://api.deepseek.com/chat/completions'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * 调用 DeepSeek API（非流式）
 */
async function callDeepSeek(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { apiKey, model } = useSettingsStore.getState()
  if (!apiKey) throw new Error('未设置 API Key，请在设置中配置')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * 流式调用 DeepSeek API
 */
export async function* callDeepSeekStream(
  messages: ChatMessage[],
  options?: { temperature?: number }
): AsyncGenerator<string> {
  const { apiKey, model } = useSettingsStore.getState()
  if (!apiKey) throw new Error('未设置 API Key，请在设置中配置')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices[0]?.delta?.content
          if (content) yield content
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

/**
 * 将文本按段落边界分块
 */
function chunkText(text: string, chunkSize: number = 8000): string[] {
  if (text.length <= chunkSize) return [text]

  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length)
    // 在段落边界切分
    if (end < text.length) {
      const lastParagraph = text.lastIndexOf('\n\n', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const lastPeriod = text.lastIndexOf('。', end)
      if (lastParagraph > start + chunkSize * 0.5) {
        end = lastParagraph
      } else if (lastNewline > start + chunkSize * 0.5) {
        end = lastNewline
      } else if (lastPeriod > start + chunkSize * 0.5) {
        end = lastPeriod + 1
      }
    }
    chunks.push(text.slice(start, end))
    start = end
  }
  return chunks
}

/**
 * 标题相似度检查（>60% 相同字符视为重复）
 */
function isTitleDuplicate(title1: string, title2: string): boolean {
  const t1 = title1.replace(/[（）()【】\[\]""''""''：:，,。.!！？?]/g, '').trim()
  const t2 = title2.replace(/[（）()【】\[\]""''""''：:，,。.!！？?]/g, '').trim()
  if (t1 === t2) return true
  // 检查一个是否包含另一个
  if (t1.length > 3 && t2.length > 3 && (t1.includes(t2) || t2.includes(t1))) return true
  // 计算字符重叠率
  const set1 = new Set(t1.split(''))
  const set2 = new Set(t2.split(''))
  let common = 0
  for (const c of set1) if (set2.has(c)) common++
  const overlapRate = common / Math.min(set1.size, set2.size)
  return overlapRate > 0.7
}

/**
 * 从课件文本中提炼考点
 * 支持大文本分块提取、去重与合并
 * @param sourceFile 来源文件名，用于标注考点来源
 */
export async function extractExamPoints(
  courseText: string,
  courseName: string,
  sourceFile?: string
): Promise<ExamPoint[]> {
  const chunks = chunkText(courseText, 8000)

  // 如果只有一块，直接提取
  if (chunks.length === 1) {
    return extractFromSingleChunk(chunks[0], courseName, sourceFile, '3-20 个')
  }

  // 多块：逐块提取
  const allPoints: any[] = []
  for (let i = 0; i < chunks.length; i++) {
    const points = await extractFromSingleChunk(
      chunks[i],
      courseName,
      sourceFile,
      '3-8 个',
      `（第 ${i + 1}/${chunks.length} 部分）`
    )
    allPoints.push(...points)
  }

  // 去重
  const deduped: any[] = []
  for (const p of allPoints) {
    const isDup = deduped.some(existing => isTitleDuplicate(existing.title, p.title))
    if (!isDup) deduped.push(p)
  }

  // 如果去重后超过 30 个考点，请求 AI 合并
  if (deduped.length > 30) {
    return await consolidatePoints(deduped, courseName, sourceFile)
  }

  // 分配 ID
  return deduped.map((p, index) => ({
    id: `point-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    title: p.title,
    priority: p.priority,
    description: p.description,
    keyFormulas: p.keyFormulas || [],
    pageRefs: p.pageRefs || [],
    sourceFile: sourceFile,
  }))
}

/**
 * 从单个文本块提取考点
 */
async function extractFromSingleChunk(
  text: string,
  courseName: string,
  sourceFile: string | undefined,
  pointRange: string,
  chunkLabel?: string
): Promise<ExamPoint[]> {
  const systemPrompt = `你是一位经验丰富的大学考试辅导专家。你的任务是分析课件内容，提炼出考试考点。

请按以下 JSON 格式返回考点列表，不要包含任何其他文字：
[
  {
    "title": "考点名称（简洁，10字以内）",
    "priority": "must" | "high" | "know",
    "description": "考点详细描述（50-100字）",
    "keyFormulas": ["关键公式或概念（可选）"],
    "pageRefs": ["相关章节或页码引用（可选）"]
  }
]

优先级说明：
- must: 必考，核心重点，几乎每年都考
- high: 高频，经常出现，需要掌握
- know: 了解，可能考但不是重点

考点数量控制在 ${pointRange} 之间。按重要性排序。${chunkLabel ? `\n这是课件的${chunkLabel}，请专注于这部分内容中的考点。` : ''}`

  const userPrompt = `课程名称：${courseName}\n${sourceFile ? `来源文件：${sourceFile}\n` : ''}\n课件内容：\n${text}`

  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 4096 }
  )

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    const json = jsonMatch ? jsonMatch[0] : result
    return JSON.parse(json)
  } catch {
    return []
  }
}

/**
 * 将过多的考点合并整理为 15-25 个核心考点
 */
async function consolidatePoints(
  points: any[],
  courseName: string,
  sourceFile?: string
): Promise<ExamPoint[]> {
  const pointsSummary = points.map((p, i) =>
    `${i + 1}. [${p.priority}] ${p.title}: ${p.description}`
  ).join('\n')

  const systemPrompt = `你是一位经验丰富的大学考试辅导专家。以下是从课件中提取的多个考点，请将它们合并整理为 15-25 个核心考点。

合并规则：
- 相似考点合并为一个
- 保留所有重要考点
- 重新评估优先级

返回 JSON 格式：
[
  {
    "title": "考点名称（简洁，10字以内）",
    "priority": "must" | "high" | "know",
    "description": "考点详细描述（50-100字）",
    "keyFormulas": ["关键公式或概念（可选）"],
    "pageRefs": ["相关章节或页码引用（可选）"]
  }
]`

  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `课程名称：${courseName}\n\n待合并考点：\n${pointsSummary}` },
    ],
    { temperature: 0.3, maxTokens: 4096 }
  )

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    const json = jsonMatch ? jsonMatch[0] : result
    const consolidated = JSON.parse(json)
    return consolidated.map((p: any, index: number) => ({
      id: `point-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      title: p.title,
      priority: p.priority,
      description: p.description,
      keyFormulas: p.keyFormulas || [],
      pageRefs: p.pageRefs || [],
      sourceFile: sourceFile,
    }))
  } catch {
    // 合并失败，返回前 25 个
    return points.slice(0, 25).map((p, index) => ({
      id: `point-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      title: p.title,
      priority: p.priority,
      description: p.description,
      keyFormulas: p.keyFormulas || [],
      pageRefs: p.pageRefs || [],
      sourceFile: sourceFile,
    }))
  }
}

/**
 * 根据考点优先级决定小测题目数量
 * - must（必考）：4-5 题，核心重点需要充分练习
 * - high（高频）：3 题，需要巩固
 * - know（了解）：2 题，基础检验即可
 */
function getQuizCount(priority: string): { min: number; max: number } {
  switch (priority) {
    case 'must':
      return { min: 4, max: 5 }
    case 'high':
      return { min: 3, max: 3 }
    case 'know':
      return { min: 2, max: 2 }
    default:
      return { min: 2, max: 3 }
  }
}

/**
 * 为单个考点生成关卡内容
 */
export async function generateLessonContent(
  examPoint: ExamPoint,
  courseText: string
): Promise<LessonContent> {
  const quizCount = getQuizCount(examPoint.priority)
  const exampleCount = examPoint.priority === 'must' ? '2-3' : examPoint.priority === 'high' ? '1-2' : '1'

  const systemPrompt = `你是一位大学考试辅导老师，正在为学生准备冲刺复习内容。

请为给定考点生成一个 5-10 分钟的闯关学习内容，包含：
1. 核心知识点（3-5 个要点）
2. 详细解释（通俗易懂，200-400字）
3. 例题（${exampleCount} 道，含详细步骤）
4. 小测题（${quizCount.min}-${quizCount.max} 道，含解析）

重要格式要求：
- 数学公式必须使用 LaTeX 语法，行内公式用 $...$ 包裹，块级公式用 $$...$$ 包裹
- 例如：$E=mc^2$、$\\\\frac{a}{b}$、$$\\\\int_0^1 x^2 dx$$

小测题要求：
- 题目难度递进，从基础到进阶
- 题目类型混合：单选题（type="choice"，4个选项，correctIndex为正确选项索引）、多选题（type="multi"，4-6个选项，correctIndices为正确选项索引数组）、填空题（type="fill"）、简答题（type="short"）
- 多选题至少有2个正确选项
- 选择题的干扰项要有迷惑性但明确错误
- 填空题提供 answer（标准答案）和 acceptableAnswers（可接受的其他答案数组）
- 简答题提供 answer（参考答案）和 acceptableAnswers（关键词数组，只要答案包含这些关键词即可算正确）
- 每题解析要说明为什么对、为什么错

返回 JSON 格式：
{
  "keyPoints": ["知识点1", "知识点2", ...],
  "explanation": "详细解释...",
  "examples": [
    {
      "question": "题目",
      "answer": "答案",
      "steps": ["步骤1", "步骤2", ...]
    }
  ],
  "quiz": [
    {
      "type": "choice",
      "question": "单选题",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "解析"
    },
    {
      "type": "multi",
      "question": "多选题",
      "options": ["A", "B", "C", "D"],
      "correctIndices": [0, 2],
      "explanation": "解析"
    },
    {
      "type": "fill",
      "question": "填空题：____是...",
      "answer": "标准答案",
      "acceptableAnswers": ["其他可接受答案1", "其他可接受答案2"],
      "explanation": "解析"
    },
    {
      "type": "short",
      "question": "简答题：请简述...",
      "answer": "参考答案",
      "acceptableAnswers": ["关键词1", "关键词2"],
      "explanation": "解析"
    }
  ]
}`

  const userPrompt = `考点：${examPoint.title}
优先级：${examPoint.priority}
描述：${examPoint.description}

课件相关内容：
${courseText.slice(0, 6000)}`

  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.5, maxTokens: 6144 }
  )

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    const json = jsonMatch ? jsonMatch[0] : result
    const parsed = JSON.parse(json)
    // 为每道小测题生成唯一 ID，确保答题状态独立
    if (parsed.quiz && Array.isArray(parsed.quiz)) {
      parsed.quiz = parsed.quiz.map((q: any, i: number) => ({
        ...q,
        type: q.type || 'choice', // 默认为选择题（兼容旧数据）
        id: `quiz-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        examPointTitle: examPoint.title,
      }))
    }
    return parsed
  } catch {
    throw new Error('关卡内容生成失败，请重试')
  }
}

/**
 * AI 评阅填空/简答题
 * @param question 题目
 * @param userAnswer 用户答案
 * @param correctAnswer 标准答案
 * @param acceptableAnswers 可接受的关键词/答案
 * @returns { correct: boolean, feedback: string }
 */
export async function gradeAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  acceptableAnswers: string[] = []
): Promise<{ correct: boolean; feedback: string }> {
  // 先做本地快速判断：完全匹配或包含关键词
  const normalizedUser = userAnswer.trim().toLowerCase()
  const normalizedCorrect = correctAnswer.trim().toLowerCase()

  if (normalizedUser === normalizedCorrect) {
    return { correct: true, feedback: '回答完全正确！' }
  }

  // 检查是否包含所有关键词
  if (acceptableAnswers.length > 0) {
    const allKeywordsPresent = acceptableAnswers.every(
      kw => normalizedUser.includes(kw.trim().toLowerCase())
    )
    if (allKeywordsPresent) {
      return { correct: true, feedback: '回答正确，包含了所有关键点！' }
    }
    // 检查是否包含部分关键词（至少50%）
    const matchedCount = acceptableAnswers.filter(
      kw => normalizedUser.includes(kw.trim().toLowerCase())
    ).length
    if (matchedCount >= Math.ceil(acceptableAnswers.length * 0.5)) {
      return {
        correct: false,
        feedback: `部分正确（命中 ${matchedCount}/${acceptableAnswers.length} 个关键点），但还不够完整。参考答案：${correctAnswer}`,
      }
    }
  }

  // 本地无法确定时，调用 AI 评阅
  try {
    const systemPrompt = `你是一位严格的阅卷老师。请判断学生的答案是否正确。

题目：${question}
标准答案：${correctAnswer}
可接受的关键词：${acceptableAnswers.join('、')}
学生答案：${userAnswer}

请返回 JSON 格式：
{
  "correct": true/false,
  "feedback": "评语（简短，说明对错原因）"
}

判断标准：
- 答案意思正确即可，不要求字面完全一致
- 关键概念/公式必须正确
- 计算结果必须正确
- 如果答案有明显错误，correct 为 false`

    const result = await callDeepSeek(
      [{ role: 'system', content: systemPrompt }],
      { temperature: 0.1, maxTokens: 512 }
    )

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    const json = jsonMatch ? jsonMatch[0] : result
    const parsed = JSON.parse(json)
    return {
      correct: !!parsed.correct,
      feedback: parsed.feedback || (parsed.correct ? '回答正确！' : '回答不正确'),
    }
  } catch {
    // AI 评阅失败时，保守判断为错误
    return {
      correct: false,
      feedback: `无法自动评阅，参考答案：${correctAnswer}`,
    }
  }
}

/**
 * 重新生成一道考察相同知识点的小测题
 */
export async function regenerateQuizQuestion(
  examPointTitle: string,
  previousQuestion: string,
  courseText: string
): Promise<QuizQuestion> {
  const systemPrompt = `你是一位大学考试辅导老师。请生成一道新的小测题，考察与以下题目相同的知识点。

之前的题目：${previousQuestion}
考点：${examPointTitle}

要求：
- 新题目必须考察相同的知识点，但题目内容和表述不同
- 数学公式使用 LaTeX 语法（$...$ 或 $$...$$）
- 返回 JSON 格式，包含 type、question、options/correctIndex（选择题）或 answer/acceptableAnswers（填空/简答题）、explanation

返回 JSON：
{
  "type": "choice",
  "question": "新题目",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "解析"
}`

  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `课件相关内容：\n${courseText.slice(0, 3000)}` },
    ],
    { temperature: 0.7, maxTokens: 2048 }
  )

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    const json = jsonMatch ? jsonMatch[0] : result
    const parsed = JSON.parse(json)
    return {
      ...parsed,
      type: parsed.type || 'choice',
      id: `quiz-regen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      examPointTitle,
    }
  } catch {
    throw new Error('题目重新生成失败，请重试')
  }
}

/**
 * AI 助教对话
 */
export async function* chatWithTutor(
  userMessage: string,
  courseContext: string,
  history: ChatMessage[]
): AsyncGenerator<string> {
  const systemPrompt = `你是 ChillPass 的 AI 助教，专门帮助大学生备考期末考试。

你的特点：
1. 回答简洁明了，用大白话解释复杂概念
2. 结合学生的课件内容回答问题
3. 如果学生问"这个会考吗"，根据课件内容分析重要性
4. 鼓励学生，保持积极正面的态度
5. 适当使用 Markdown 格式（加粗、列表）让回答更清晰

${courseContext ? `学生当前课件内容摘要：\n${courseContext.slice(0, 3000)}` : ''}`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // 保留最近 10 条历史
    { role: 'user', content: userMessage },
  ]

  yield* callDeepSeekStream(messages, { temperature: 0.7 })
}
