# ChillPass — 期末冲刺助手

> AI 驱动的闯关式期末备考桌面应用，让复习像打游戏一样上瘾。

ChillPass 将你的课件转化为 Duolingo 式的闯关课程：上传 PDF/PPT 课件 → AI 自动提炼考点 → 生成必考/高频/了解三级优先级的闯关关卡 → 逐关解锁、答题通关、积累 XP。配合 AI 助教实时答疑和错题本智能复盘，帮你高效冲刺期末。

---

## ✨ 核心功能

### 🎮 闯关式学习
- **AI 提炼考点**：上传课件后，DeepSeek 自动分析并提炼 8-15 个考点，按必考/高频/了解三级分类
- **逐关解锁**：每个考点对应一个关卡，包含知识点讲解、例题演示、小测验收
- **动态题量**：小测题目数量根据考点优先级自动调整（必考 4-5 题、高频 3 题、了解 2 题）
- **进度追踪**：XP 积分、连续学习天数、关卡完成进度一目了然

### 📖 错题本
- 答错的小测题自动收录到错题本
- 每道错题展示你的答案 vs 正确答案对比
- 一键跳转 AI 助教，针对错题发起答疑
- 标记"已掌握"即可从错题本移除

### 🤖 AI 助教
- 基于 DeepSeek 大模型的实时流式对话
- 结合你的课件内容回答问题
- **图片识图**：插入题目截图，本地 Tesseract.js OCR 识别文字后发送给 AI
- 支持 Markdown 格式渲染（加粗、列表、代码块、表格等）

### 📂 资源管理
- **增量导入**：向已有课程追加新课件，AI 增量合并考点，已有关卡内容完整保留
- **资源迁移**：将课件文件迁移到其他磁盘，自动更新路径，释放 C 盘空间
- **按课程管理**：支持多课程切换，每个课程独立存储进度和考试日期

### ⚙️ 设置与更新
- **二级设置界面**：API 配置、存储迁移、数据管理、关于
- **校园账号登录**：本地存储学号/学校/专业信息，为未来教务系统对接预留
- **检查更新**：接入 GitHub Releases，一键检查并下载新版本
- **NSIS 安装器**：中文界面、自定义安装路径、桌面快捷方式、支持增量更新

---

## 🎨 设计特色

### 液态玻璃设计系统
采用正版 Apple Liquid Glass 视觉语言：
- SVG `feDisplacementMap` + `feSpecularLighting` 实现折射和高光效果
- 多层 backdrop-filter 营造真实玻璃质感
- 白色基底 + 半透明浮层，干净通透

### 灵动交互
- **页面切换动画**：framer-motion spring 弹性曲线，新页面从右滑入，旧页面向左淡出
- **窗口圆角统一**：Windows 11 原生圆角窗口 + CSS 12px 圆角，视觉一致
- **微交互**：按钮 hover 缩放、卡片浮起阴影、流式打字动画

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Electron + Vite + React 18 + TypeScript |
| 状态管理 | Zustand（含 persist 持久化） |
| 路由 | React Router v6 |
| 动画 | Framer Motion |
| AI | DeepSeek API（流式对话） |
| OCR | Tesseract.js（中英文本地识图） |
| 文件解析 | PDF.js、JSZip（PPTX 解析） |
| 打包 | electron-builder（NSIS 安装器） |
| 视觉 | CSS Modules + SVG 液态玻璃滤镜 |

---

## 📦 安装

### 方式一：下载安装器（推荐）

前往 [Releases 页面](https://github.com/Koipoppy/ChillPass/releases) 下载最新的 `ChillPass Setup x.x.x.exe`，双击安装即可。

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/Koipoppy/ChillPass.git
cd ChillPass

# 安装依赖
npm install

# 开发模式运行
npm run electron:preview

# 构建 Windows 安装器
npm run electron:build:win
```

构建产物位于 `release/` 目录下。

---

## 🚀 使用指南

### 1. 配置 API Key
首次使用前，打开 **设置 → API 配置**，填入你的 DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）。

### 2. 导入课件
点击 **导入课件**，选择 PDF/PPTX/TXT/MD 文件，输入课程名称，AI 会自动提炼考点并生成闯关关卡。

### 3. 闯关学习
进入 **闯关冲刺**，从第一关开始解锁。每关包含：
- **知识点**：核心要点 + 详细解释
- **例题**：带解题步骤的示范题
- **小测**：选择题，答对即可完成关卡

### 4. AI 答疑
遇到不懂的问题，打开 **AI 助教**，可以：
- 直接输入问题
- 插入题目截图（自动 OCR 识别）
- 从错题本一键跳转过来提问

### 5. 设置考试日期
在首页倒计时卡片设置期末考试日期，系统会按天数提醒你冲刺节奏。

---

## 📁 项目结构

```
ChillPass/
├── electron/               # Electron 主进程
│   ├── main.ts             # 主进程入口（窗口、IPC、更新检查、文件迁移）
│   └── preload.ts          # 预加载脚本（contextBridge）
├── src/
│   ├── components/         # 通用组件
│   │   ├── layout/         # 布局组件（Sidebar、TitleBar、Background）
│   │   └── common/         # 通用组件（GlassFilter）
│   ├── pages/              # 页面
│   │   ├── Dashboard.tsx           # 首页（倒计时、进度、错题本）
│   │   ├── UploadPage.tsx          # 导入课件
│   │   ├── LessonPathPage.tsx      # 闯关路径
│   │   ├── LessonDetailPage.tsx    # 关卡详情
│   │   ├── AIChatPage.tsx          # AI 助教
│   │   ├── SettingsPage.tsx        # 设置主页
│   │   └── settings/               # 设置子页面
│   ├── stores/             # Zustand 状态管理
│   │   ├── courseStore.ts          # 课程数据
│   │   ├── chatStore.ts            # 聊天记录
│   │   ├── settingsStore.ts        # 应用设置
│   │   ├── authStore.ts            # 校园账号
│   │   └── wrongQuestionStore.ts   # 错题本
│   ├── services/           # 业务服务
│   │   ├── deepseek.ts             # DeepSeek API
│   │   ├── fileParser.ts           # 文件解析
│   │   └── imageService.ts         # 图片 OCR
│   ├── styles/             # 全局样式
│   └── types/              # TypeScript 类型定义
├── public/                 # 静态资源（图标）
└── package.json
```

---

## 🔑 环境要求

- **操作系统**：Windows 10/11（64 位）
- **Node.js**：18+（仅开发需要）
- **DeepSeek API Key**：[在此获取](https://platform.deepseek.com/)

---

## 📝 更新日志

### v1.0.1（2026-06-21）
- ✅ 小测题目数量根据考点优先级动态生成（必考 4-5 题、高频 3 题、了解 2 题）
- ✅ 首页新增"我的错题本"，错题卡片可一键跳转 AI 助教答疑
- ✅ AI 助教支持图片插入，本地 Tesseract.js OCR 识图后发送给 DeepSeek
- ✅ 窗口圆角与界面元素圆角统一
- ✅ 页面切换动画（framer-motion spring 弹性曲线）
- ✅ 接入 GitHub Releases 更新源

### v1.0.0（2026-06-20）
- 🎉 首个正式版本
- 上传课件 → AI 提炼考点 → 生成闯关课程
- AI 助教实时答疑（DeepSeek 流式对话）
- 校园账号登录（为教务系统对接预留）
- 资源迁移工具（释放 C 盘空间）
- NSIS 安装器（中文界面、增量更新）
- 二级设置界面

---

## 📄 开源协议

本项目仅供学习和个人使用。

## 🙏 鸣谢

- [DeepSeek](https://www.deepseek.com/) — AI 大模型
- [Tesseract.js](https://tesseract.projectnaptha.com/) — 本地 OCR
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF 解析
- [electron-builder](https://www.electron.build/) — 应用打包
- [Framer Motion](https://www.framer.com/motion/) — 动画引擎
