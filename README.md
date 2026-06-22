<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.3-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Electron-31.7.7-9FEAF9?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/DeepSeek-AI-4D6BFE?style=flat-square" alt="DeepSeek" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/License-Educational-green?style=flat-square" alt="License" />
</p>

<h1 align="center">ChillPass</h1>

<p align="center">
  <strong>Turn your finals into a game. Let AI do the heavy lifting.</strong>
</p>

<p align="center">
  <a href="#-key-features">Features</a> &bull;
  <a href="#-installation">Install</a> &bull;
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-tech-stack">Tech Stack</a> &bull;
  <a href="https://github.com/Koipoppy/ChillPass/releases">Download</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/⬇️_Download-ChillPass%20Setup%201.1.3.exe-blue?style=for-the-badge" alt="Download" />
</p>

---

## What is ChillPass?

ChillPass is a **desktop application** that transforms your course materials (PDF, PPTX, TXT, MD) into a **gamified learning experience**. Upload your lecture slides, and the AI engine automatically extracts exam-critical topics, generates structured lessons with worked examples, and creates adaptive quizzes — all prioritized by how likely each topic is to appear on your exam.

Think of it as **Duolingo meets your textbook**, but specifically designed for college students racing against finals.

**How it works:**

```
Upload Materials → AI Extracts Topics → Generates Quest Levels → You Play Through
                         ↓
              Must-Know / High-Frequency / Good-to-Know
                         ↓
        Knowledge Points → Examples → Quiz → Earn Chill Coins
```

---

## ✨ Key Features

### 🎮 Quest-Based Learning Engine

| Feature | Description |
|---------|-------------|
| **AI Topic Extraction** | DeepSeek analyzes your materials and extracts exam topics, classified into 3 priority tiers |
| **Batch Processing** | 200+ page PDFs are split into chunks, extracted in parallel, deduplicated, and consolidated — zero content left behind |
| **Progressive Unlocking** | Complete a level to unlock the next. Each level contains knowledge points, worked examples, and a quiz checkpoint |
| **Adaptive Quizzes** | One question per page with a progress navigator. Answer wrong? The question regenerates on the same topic until you master it |
| **Dynamic Difficulty** | Quiz volume scales with topic priority — Must-Know gets 4-5 questions, Good-to-Know gets 2 |

### 🧠 Four Question Types with AI Grading

```
┌─────────────────┬──────────────────────────────────────────────┐
│   Question Type  │                  Behavior                     │
├─────────────────┼──────────────────────────────────────────────┤
│  Single Choice   │ 4 options, instant correct/wrong feedback    │
│  Multiple Choice │ 4-6 options, ≥2 correct, submit to check     │
│  Fill-in-Blank   │ Free text input, keyword matching + AI grade  │
│  Short Answer    │ Free-form response, AI evaluates, ref shown   │
└─────────────────┴──────────────────────────────────────────────┘
```

Wrong answers trigger **adaptive retry**:
- **Choice questions** → Options are shuffled, try again
- **Fill-in / Short answer** → AI generates a brand-new question on the same topic

### 💰 Chill Coin Economy

A virtual currency that ties studying to tangible rewards:

- **Earn**: Complete quiz levels (30-40 coins) + 1 coin per minute of study time
- **Spend**: Skip difficult levels at equal cost to their reward
- **Track**: Real-time balance on dashboard, sidebar, and quest path

### 🤖 AI Tutor

- **Streaming chat** powered by DeepSeek with context from your course materials
- **Image recognition**: Snap a photo of a problem → Tesseract.js OCR → AI explanation
- **LaTeX rendering**: Full KaTeX support for math formulas (`$E=mc^2$` / `$$\int_0^1$$`)
- **Markdown**: Rich text rendering with code blocks, tables, lists

### 🎨 Four Themes

| Theme | Style |
|-------|-------|
| **Light** | Translucent liquid glass, clean and minimal |
| **Dark** | High-contrast (#0d0d0f base), pure white text, optimized readability |
| **Vista** | Windows Aero Glass — blue gradient, frosted windows, glossy buttons |
| **Win95** | Retro classic — teal desktop, beveled gray windows, MS Sans Serif |

### 🌐 5 Languages

Chinese, English, Russian, Japanese, Korean — switch instantly from settings.

---

## 📦 Installation

### Download (Recommended)

Go to [Releases](https://github.com/Koipoppy/ChillPass/releases) → Download `ChillPass Setup 1.1.3.exe` → Install.

> Windows 10/11 (64-bit). Data auto-preserved on updates.

### Build from Source

```bash
git clone https://github.com/Koipoppy/ChillPass.git
cd ChillPass
npm install
npm run electron:preview       # Dev mode
npm run electron:build:win     # Build installer → release/
```

---

## 🚀 Quick Start

**1.** Open **Settings → API Config** → Enter your [DeepSeek API Key](https://platform.deepseek.com/api_keys)

**2.** Click **Import Materials** → Select your PDF/PPTX files → Name your course → Wait for AI to generate levels

**3.** Enter **Quest Sprint** → Start from Level 1 → Read key points → Study examples → Pass the quiz

**4.** Earn Chill Coins from quizzes and study time. Use them to skip levels when stuck.

**5.** Stuck on a concept? Open **AI Tutor** → Ask anything → Get instant, context-aware explanations

**6.** Set your exam date on the dashboard to see a countdown timer.

---

## 🛠️ Tech Stack

```
Electron 31     ── Desktop shell
React 18        ── UI components
TypeScript 5    ── Type safety
Vite 5          ── Build pipeline
Zustand         ── State management (persist)
Framer Motion   ── Page transitions & animations
DeepSeek API    ── AI chat, grading, topic extraction
KaTeX           ── LaTeX formula rendering
Tesseract.js    ── OCR (CDN-loaded, packaged-build safe)
PDF.js          ── PDF text extraction
JSZip           ── PPTX parsing
CSS Modules     ── Scoped styling
SVG Filters     ── Liquid glass visual effects
electron-builder ── NSIS installer
```

---

## 📁 Architecture

```
src/
├── components/layout/     Sidebar, TitleBar, Background
├── pages/                 Dashboard, Upload, QuestPath, QuestDetail,
│                          WrongBook, AIChat, Settings
├── stores/                courseStore, chatStore, settingsStore,
│                          studyTimeStore, themeStore, languageStore,
│                          wrongQuestionStore
├── services/              deepseek (API + grading + batch extraction),
│                          fileParser, imageService (OCR)
├── utils/                 markdown (KaTeX + marked pipeline)
├── i18n/                  5-language translations
├── styles/                Global CSS + theme variables
└── types/                 TypeScript interfaces
```

---

## 🔑 Requirements

| | |
|-|-|
| **OS** | Windows 10/11 (64-bit) |
| **Runtime** | DeepSeek API Key ([get one](https://platform.deepseek.com/api_keys)) |
| **Dev** | Node.js 18+ |

---

## 📝 Changelog

<details>
<summary><strong>v1.1.3</strong> — 2026-06-22</summary>

- Chill Coin economy system (earn from quizzes + study time, spend to skip levels)
- Multiple choice questions in quizzes
- Course renaming from dashboard
- Standard answer always shown after fill-in/short-answer grading
- Large PDF batch extraction with deduplication and consolidation
</details>

<details>
<summary><strong>v1.1.2</strong> — 2026-06-22</summary>

- Image OCR fully fixed (renderer process + CDN resources)
- KaTeX formula rendering (placeholder strategy)
- One-question-per-page quiz with progress dots
- Fill-in-the-blank and short answer with AI grading
- Mistake notebook white screen fix
</details>

<details>
<summary><strong>v1.1.1</strong> — 2026-06-22</summary>

- KaTeX math formula rendering
- Vista and Win95 themes
- DeepSeek platform link in API settings
- Storage info panel
- Dark mode contrast optimization
</details>

<details>
<summary><strong>v1.1.0</strong> — 2026-06-21</summary>

- Standalone mistake notebook with course grouping
- Incremental import with duplicate detection
- 5-language i18n with instant switch
- Page transition animation (sync + absolute positioning)
</details>

<details>
<summary><strong>v1.0.0</strong> — 2026-06-20</summary>

- Initial release: upload → AI extraction → quest levels → AI tutor
</details>

---

## 📄 License

This project is for **personal and educational use only**.

## 🙏 Acknowledgments

[DeepSeek](https://www.deepseek.com/) &bull; [Tesseract.js](https://tesseract.projectnaptha.com/) &bull; [KaTeX](https://katex.org/) &bull; [PDF.js](https://mozilla.github.io/pdf.js/) &bull; [electron-builder](https://www.electron.build/) &bull; [Framer Motion](https://www.framer.com/motion/)

---

<p align="center">
  <sub>Built with ❤️ for students who'd rather chill than cram.</sub>
</p>
