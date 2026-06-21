import type { ExamPoint, LessonContent } from '@types/index'
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
 * 从课件文本中提炼考点
 * @param sourceFile 来源文件名，用于标注考点来源
 */
export async function extractExamPoints(
  courseText: string,
  courseName: string,
  sourceFile?: string
): Promise<ExamPoint[]> {
  // 根据文本长度动态调整考点数量
  const textLength = courseText.length
  let pointRange: string
  if (textLength < 3000) {
    pointRange = '3-6 个'
  } else if (textLength < 8000) {
    pointRange = '5-10 个'
  } else if (textLength < 20000) {
    pointRange = '8-15 个'
  } else {
    pointRange = '10-20 个'
  }

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

考点数量控制在 ${pointRange} 之间，根据课件实际内容容量决定。按重要性排序。`

  const userPrompt = `课程名称：${courseName}\n${sourceFile ? `来源文件：${sourceFile}\n` : ''}\n课件内容：\n${courseText.slice(0, 12000)}`

  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 4096 }
  )

  try {
    // 提取 JSON
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    const json = jsonMatch ? jsonMatch[0] : result
    const points = JSON.parse(json)

    return points.map((p: any, index: number) => ({
      id: `point-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      title: p.title,
      priority: p.priority,
      description: p.description,
      keyFormulas: p.keyFormulas || [],
      pageRefs: p.pageRefs || [],
      sourceFile: sourceFile,
    }))
  } catch {
    throw new Error('AI 返回格式解析失败，请重试')
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
4. 小测题（${quizCount.min}-${quizCount.max} 道，每题 4 个选项，含解析）

小测题要求：
- 题目难度递进，从基础到进阶
- 干扰项要有迷惑性但明确错误
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
      "question": "测验题",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
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
        id: `quiz-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      }))
    }
    return parsed
  } catch {
    throw new Error('关卡内容生成失败，请重试')
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
