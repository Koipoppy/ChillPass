# ChillPass v1.2.0 Release Notes

**Release Date:** 2026-06-23

---

## Overview

v1.2.0 is the largest update yet, transforming ChillPass from a quiz-based study tool into a comprehensive AI-powered academic platform. This release introduces **Athena** — a full AI agent with task workflows, **Teacher Workspace** for exam paper generation, a new **Codex theme**, and dozens of quality improvements across themes, formula rendering, and API reliability.

---

## Major New Features

### Athena AI Agent

The AI tutor has been upgraded from a simple chatbot to a full agent with:

- **Task Workflows**: Paper writing, report writing, knowledge summary, and revision planning — each with structured information collection forms
- **Ability Management**: Auto-discovered and manually added skills, with export/import for cross-device migration
- **Memory System**: Charter memory (user-managed identity, rules, personality) + Flow memory (agent-managed context)
- **Status Indicator**: Real-time status bar showing idle / thinking / tasking state
- **Auto-Summarization**: Abilities and memories are automatically summarized for compact storage

### Teacher Workspace

A dedicated workspace for educators (enable in Settings → "I am a Teacher"):

- **6 Question Types**: Single choice, multiple choice, fill-in-blank, short answer, calculation, essay
- **AI Generation**: Generate questions from course materials with adjustable difficulty (easy/medium/hard) and count (5/10/15/20)
- **Smart Grouping**: Questions auto-grouped by type, each group collapsible/expandable
- **Full Content Preview**: Every question displayed in full with KaTeX formula rendering — no truncation
- **PDF Export**: Professional exam papers with:
  - Bordered student info frame (name, student ID, class)
  - Section headers with point totals
  - Answer lines for subjective questions
  - Separate answer key page with solution steps for calculation problems
  - KaTeX formula pre-rendering in print output
- **5-Language Export**: Full AI translation of all question content before PDF export (Chinese, English, Japanese, Korean, Russian)

### Codex Theme

A terminal-inspired dark theme with monospace accents and green-on-black code aesthetic — the 5th theme joining Light, Dark, Vista, and Win95.

### Calculation Question Type

New question type with step-by-step solution rendering:
- AI generates complete solution steps (`steps[]` array)
- Steps displayed in question list and PDF answer key
- 15 points per calculation question by default

---

## Improvements

### Dark Theme Button Contrast

Introduced `--btn-primary-bg` / `--btn-primary-fg` CSS variables across all 5 themes. Replaced 22 instances of `background: var(--text-primary)` with `background: var(--btn-primary-bg)` across 9 CSS module files. Dark theme now uses light backgrounds with dark text for primary buttons (inverted from light theme).

### API Reliability

- **3-retry logic** with exponential backoff (1.5s, 3s, 4.5s)
- **90-second timeout** via AbortController
- **Dynamic maxTokens**: `1024 * count + 2048` (capped at 8192) based on question count
- **Specific error messages** for timeout vs. network failure vs. API error

### Formula Rendering

- **Question list**: All text content (questions, options, answers, steps, explanations) now rendered through `renderInlineMarkdown()` with KaTeX support
- **PDF export**: KaTeX HTML pre-rendered on the application side — PDF only needs KaTeX CSS, no JavaScript
- **CSS loading detection**: Checks `link.sheet` before printing to ensure KaTeX styles are applied

### Question List UX

- Questions grouped by type with collapsible headers showing count and points
- Full content display (removed 2-line truncation)
- `word-break: break-word` for proper long-text wrapping
- Expandable detail view with options, answer, steps, acceptable answers, and explanation

### i18n Expansion

- 74+ translation keys added covering titlebar, dashboard, upload, lessons, lesson, wrongbook, and athena namespaces
- All 5 languages (Chinese, English, Russian, Japanese, Korean) fully updated
- "AI 助教" renamed to "Athena" across all languages

### Chill Coin System

- NaN protection: All coin operations use `typeof x === 'number' ? x : 0` guards
- Negative coin prevention: `Math.max(0, coins - cost)` in skip logic
- Bounce animation on coin increase (600ms)

---

## Bug Fixes

- **Fill-in-blank input**: `user-select: none` on `body` was preventing text input — added `user-select: text` for `input`, `textarea`, `select`
- **Option prefix duplication**: AI sometimes returned options with "A." prefix, causing "A.A. text" — added prompt instruction + regex cleanup `^[A-Z][.、．)]\s*`
- **Calculation questions showing options**: Non-choice questions no longer display options in UI or PDF
- **PDF student info frame**: Header and info bar now wrapped in a single bordered container with proper top border
- **`window.open()` failure in Electron**: Replaced with hidden iframe approach for PDF printing
- **Vista sidebar text visibility**: Added `color: #ffffff !important` for sidebar text
- **Win95 duplicate selectors**: Fixed `button:active, button:active` → `button:active`

---

## Technical Changes

### New Files
- `src/pages/TeacherWorkspace.tsx` — Teacher workspace page
- `src/pages/TeacherWorkspace.module.css` — Teacher workspace styles
- `src/stores/athenaStore.ts` — Athena agent state management

### Modified Files (29 total)
- `src/styles/global.css` — 5-theme button variables, input user-select fix
- `src/services/deepseek.ts` — Retry logic, timeout, exam generation, translation function
- `src/types/index.ts` — `calculation` type, `steps` field
- `src/utils/markdown.ts` — KaTeX placeholder pipeline
- `src/i18n/translations.ts` — 74+ new keys
- `src/pages/AIChatPage.tsx` — Athena agent UI
- `src/pages/LessonDetailPage.tsx` — Calculation question support
- `src/stores/courseStore.ts` — Chill coin NaN guards
- `src/stores/settingsStore.ts` — `isTeacher` flag
- `src/stores/themeStore.ts` — Codex theme
- 9 CSS module files — `--btn-primary-bg` / `--btn-primary-fg` migration

---

## Download

**Platform:** Windows 10/11 (64-bit)

**File:** `ChillPass Setup 1.2.0.exe`

**Size:** ~95 MB

[Download from GitHub Releases](https://github.com/Koipoppy/ChillPass/releases/tag/v1.2.0)

---

## Requirements

- Windows 10/11 (64-bit)
- [DeepSeek API Key](https://platform.deepseek.com/api_keys)
- Node.js 18+ (for building from source)

---

## What's Next

- Athena plugin system for custom task types
- Exam paper templates (multiple choice only, mixed, etc.)
- Collaborative features for study groups
- macOS support

---

*Built with ❤️ for students who'd rather chill than cram.*
