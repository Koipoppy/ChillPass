# ChillPass — Gamified Exam Prep Assistant

> AI-powered desktop app that turns your course materials into Duolingo-style quests. Built for college students racing against finals.

ChillPass transforms your lecture slides and PDFs into a level-based learning journey: upload course materials → AI extracts key exam topics → generates prioritized lessons (Must-Know / High-Frequency / Good-to-Know) → unlock levels, take quizzes, earn Chill Coins, and track your progress. Paired with a real-time AI tutor and a smart mistake notebook, it keeps you focused and on track during crunch time.

---

## ✨ Key Features

### 🎮 Quest-Based Learning
- **AI Topic Extraction**: Upload your slides, and DeepSeek automatically analyzes and extracts exam topics, classified by priority (Must-Know / High-Frequency / Good-to-Know)
- **Batch Extraction for Large PDFs**: 200+ page documents are split into chunks, with topics extracted per chunk, deduplicated, and consolidated — ensuring full content coverage
- **Progressive Unlocking**: Each topic maps to a level with knowledge points, worked examples, and a quiz checkpoint
- **Dynamic Quiz Volume**: Quiz question count scales with topic priority (Must-Know: 4-5 questions, High-Frequency: 3, Good-to-Know: 2)
- **One-Question-Per-Page Quizzes**: Each quiz question gets its own page with a progress dot navigator. Answer wrong? The question regenerates (choice questions shuffle options; fill-in/short-answer questions get a brand-new question on the same topic) until you get it right

### 🧠 Multiple Question Types with AI Grading
- **Single Choice**: Classic 4-option questions with instant feedback
- **Multiple Choice**: Multi-select questions with 4-6 options and at least 2 correct answers
- **Fill-in-the-Blank**: Type your answer, AI grades it with keyword matching + DeepSeek fallback
- **Short Answer**: Free-form responses graded by AI, with reference answers always shown after submission

### 💰 Chill Coin System
- **Earn Coins**: Complete quiz levels to earn Chill Coins (Must-Know: 40, High-Frequency: 35, Good-to-Know: 30). Study time also earns coins — 1 coin per minute
- **Skip Levels**: Stuck on a hard level? Spend Chill Coins to skip it (cost equals the level's reward)
- **Balance Tracking**: Coin balance displayed on the dashboard, sidebar, and lesson path

### 📖 Mistake Notebook
- Wrong answers are automatically collected, organized by course
- Each entry shows your answer vs. the correct answer side-by-side
- One-click jump to AI Tutor for a targeted explanation
- Mark as "Mastered" to remove from the notebook
- Full KaTeX formula rendering for math-heavy content

### 🤖 AI Tutor
- Real-time streaming chat powered by DeepSeek
- Context-aware: answers based on your uploaded course materials
- **Image Recognition**: Insert a photo of a problem, Tesseract.js OCR extracts the text (CDN-loaded, works in packaged builds), and sends it to the AI
- **LaTeX Formula Rendering**: Inline (`$...$`) and block (`$$...$$`) math expressions rendered with KaTeX
- Full Markdown support (bold, lists, code blocks, tables, etc.)

### 📂 Resource Management
- **Incremental Import**: Append new materials to existing courses. AI merges new topics while preserving your progress. Duplicate content detection (>70% sentence overlap = skip)
- **Course Renaming**: Rename any course directly from the dashboard
- **Multi-Course Support**: Switch between courses, each with independent progress and exam dates
- **Storage Insights**: View app install path, data location, and per-course disk usage

### 🎨 Themes
- **Light**: Clean, translucent liquid glass (default)
- **Dark**: High-contrast dark mode with optimized readability
- **Vista**: Windows Vista Aero Glass aesthetic — blue gradient desktop, frosted glass windows, glossy buttons
- **Win95**: Retro Windows 95 style — teal desktop, beveled gray windows, MS Sans Serif font, classic scrollbars

### 🌐 Internationalization
- 5 languages: Chinese, English, Russian, Japanese, Korean
- Language switch applies instantly across navigation, settings, and about pages

### ⚙️ Settings & Updates
- **API Configuration**: DeepSeek API key management with a direct link to the DeepSeek platform
- **Data Management**: Clear data, view storage info and disk usage
- **Focus Mode**: One-click fullscreen for distraction-free studying
- **Study Time Tracking**: Cumulative study time displayed in the title bar
- **Check for Updates**: Connected to GitHub Releases
- **NSIS Installer**: Custom install path, desktop shortcut, incremental updates

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Electron + Vite + React 18 + TypeScript |
| State Management | Zustand (with persist middleware) |
| Routing | React Router v6 |
| Animation | Framer Motion |
| AI | DeepSeek API (streaming chat + AI grading) |
| OCR | Tesseract.js (CDN-loaded worker/core/lang) |
| Math Rendering | KaTeX (placeholder strategy to avoid marked.js escaping) |
| File Parsing | PDF.js, JSZip (PPTX parsing) |
| Packaging | electron-builder (NSIS installer) |
| Styling | CSS Modules + SVG liquid glass filters |

---

## 📦 Installation

### Option 1: Download Installer (Recommended)

Go to the [Releases page](https://github.com/Koipoppy/ChillPass/releases) and download the latest `ChillPass Setup x.x.x.exe`. Double-click to install.

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/Koipoppy/ChillPass.git
cd ChillPass

# Install dependencies
npm install

# Run in development mode
npm run electron:preview

# Build a Windows installer
npm run electron:build:win
```

Build artifacts are in the `release/` directory.

---

## 🚀 Quick Start

### 1. Configure API Key
On first launch, open **Settings → API Configuration** and enter your DeepSeek API Key. A direct link to the [DeepSeek platform](https://platform.deepseek.com/api_keys) is provided for convenience.

### 2. Import Course Materials
Click **Import Materials**, select PDF/PPTX/TXT/MD files, and enter a course name. AI will extract exam topics and generate quest levels. For large PDFs, content is processed in batches to ensure full coverage.

### 3. Start Questing
Navigate to **Quest Sprint** and unlock levels starting from the first. Each level includes:
- **Key Points**: Core concepts with detailed explanations
- **Examples**: Worked problems with step-by-step solutions
- **Quiz**: One question per page — single choice, multiple choice, fill-in-the-blank, or short answer. Get it wrong and a new question on the same topic appears. Get it right to unlock the next page.

### 4. Earn & Spend Chill Coins
- Complete quizzes to earn Chill Coins
- Study for 1 minute = 1 Chill Coin
- Use coins to skip difficult levels

### 5. AI Tutor
Stuck on something? Open **AI Tutor** to:
- Chat with AI in real-time (streaming responses)
- Insert a photo of a problem (auto-OCR)
- Jump directly from a mistake notebook entry

### 6. Set Exam Date
Set your final exam date on the dashboard countdown card for a personalized study pace.

---

## 📁 Project Structure

```
ChillPass/
├── electron/               # Electron main process
│   ├── main.ts             # Main entry (window, IPC, updates, file migration)
│   └── preload.ts          # Preload script (contextBridge)
├── src/
│   ├── components/         # Shared components
│   │   ├── layout/         # Layout (Sidebar, TitleBar, Background)
│   │   └── common/         # Common (GlassFilter)
│   ├── pages/              # Pages
│   │   ├── Dashboard.tsx           # Home (countdown, progress, rename)
│   │   ├── UploadPage.tsx          # Import materials
│   │   ├── LessonPathPage.tsx      # Quest path (skip levels)
│   │   ├── LessonDetailPage.tsx    # Level detail (quiz, AI grading)
│   │   ├── WrongBookPage.tsx       # Mistake notebook
│   │   ├── AIChatPage.tsx          # AI tutor
│   │   ├── SettingsPage.tsx        # Settings hub
│   │   └── settings/               # Settings sub-pages
│   ├── stores/             # Zustand state management
│   │   ├── courseStore.ts          # Course data (coins, skip, rename)
│   │   ├── chatStore.ts            # Chat history
│   │   ├── settingsStore.ts        # App settings
│   │   ├── studyTimeStore.ts       # Study time + coin rewards
│   │   ├── themeStore.ts           # Theme (light/dark/vista/win95)
│   │   ├── languageStore.ts        # i18n (5 languages)
│   │   └── wrongQuestionStore.ts   # Mistake notebook
│   ├── services/           # Business services
│   │   ├── deepseek.ts             # DeepSeek API + AI grading + batch extraction
│   │   ├── fileParser.ts           # File parsing
│   │   └── imageService.ts         # Image OCR (CDN tesseract.js)
│   ├── utils/              # Utilities
│   │   └── markdown.ts             # Markdown + KaTeX rendering
│   ├── i18n/               # Internationalization
│   ├── styles/             # Global styles
│   └── types/              # TypeScript definitions
├── public/                 # Static assets (icons)
└── package.json
```

---

## 🔑 Requirements

- **OS**: Windows 10/11 (64-bit)
- **Node.js**: 18+ (development only)
- **DeepSeek API Key**: [Get one here](https://platform.deepseek.com/api_keys)

---

## 📝 Changelog

### v1.1.3 (2026-06-22)
- 🆕 Chill Coin system replacing XP — earn coins from quizzes and study time, spend to skip levels
- 🆕 Multiple choice question type in quizzes
- 🆕 Course renaming from the dashboard
- 🆕 Standard answer always shown after fill-in/short-answer grading
- 🔧 Large PDF batch extraction — chunked processing with deduplication and consolidation

### v1.1.2 (2026-06-22)
- 🔧 Image OCR fully fixed — moved to renderer process with CDN-loaded resources
- 🔧 KaTeX formula rendering rewritten with placeholder strategy
- 🆕 One-question-per-page quiz with progress dots and retry-on-wrong
- 🆕 Fill-in-the-blank and short-answer questions with AI grading
- 🔧 Mistake notebook white screen fix

### v1.1.1 (2026-06-22)
- 🆕 KaTeX math formula rendering
- 🆕 Vista and Win95 themes
- 🆕 DeepSeek platform link in API settings
- 🆕 Storage info (install path, data location, per-course disk usage)
- 🔧 Dark mode contrast optimization
- 🔧 Image OCR moved to Electron main process (interim fix)

### v1.1.0 (2026-06-21)
- 🆕 Standalone mistake notebook page with course grouping
- 🆕 Incremental import with duplicate content detection
- 🆕 Language switching (5 languages) with instant UI update
- 🔧 Import page white screen fix (TDZ issue)
- 🔧 Page transition animation (sync mode + absolute positioning)
- 🔧 AI tutor scroll joystick fix
- 🔧 Quiz independent answer judgment (unique quiz IDs)

### v1.0.1 (2026-06-21)
- 🆕 Dynamic quiz volume based on topic priority
- 🆕 Mistake notebook on dashboard
- 🆕 Image OCR with Tesseract.js
- 🆕 Page transition animations (Framer Motion)
- 🆕 GitHub Releases update integration

### v1.0.0 (2026-06-20)
- 🎉 Initial release
- Upload materials → AI topic extraction → quest-based courses
- AI tutor with streaming chat (DeepSeek)
- Resource migration tool
- NSIS installer with incremental updates

---

## 📄 License

This project is for personal and educational use only.

## 🙏 Acknowledgments

- [DeepSeek](https://www.deepseek.com/) — AI language model
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR engine
- [KaTeX](https://katex.org/) — Math formula rendering
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF parsing
- [electron-builder](https://www.electron.build/) — App packaging
- [Framer Motion](https://www.framer.com/motion/) — Animation engine
