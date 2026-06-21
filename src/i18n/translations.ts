import type { Language } from '@stores/languageStore'

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.upload'
  | 'nav.lessons'
  | 'nav.wrongbook'
  | 'nav.chat'
  | 'nav.settings'
  | 'nav.levelUnit'
  | 'nav.generating'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.appDesc'
  | 'settings.statsCourses'
  | 'settings.statsFiles'
  | 'settings.checkUpdate'
  | 'settings.checkingUpdate'
  | 'settings.upToDate'
  | 'settings.recheck'
  | 'settings.newVersionFound'
  | 'settings.currentVersion'
  | 'settings.downloadUpdate'
  | 'settings.retry'
  | 'settings.account'
  | 'settings.accountDesc'
  | 'settings.logout'
  | 'settings.logoutConfirm'
  | 'settings.notLoggedIn'
  | 'settings.notLoggedInDesc'
  | 'settings.login'
  | 'settings.api'
  | 'settings.apiDesc'
  | 'settings.storage'
  | 'settings.storageDesc'
  | 'settings.data'
  | 'settings.dataDesc'
  | 'settings.about'
  | 'settings.aboutDesc'
  | 'settings.appearance'
  | 'settings.appearanceDesc'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.themeLight'
  | 'settings.themeDark'
  | 'settings.applied'
  | 'settings.applyLanguage'
  | 'about.subtitle'
  | 'about.appInfo'
  | 'about.appName'
  | 'about.version'
  | 'about.loading'
  | 'about.unknown'
  | 'about.updateCheck'
  | 'about.updateCheckDesc'
  | 'about.checkUpdate'
  | 'about.checking'
  | 'about.checkingUpdate'
  | 'about.latest'
  | 'about.newVersion'
  | 'about.currentVersion'
  | 'about.releaseDate'
  | 'about.download'
  | 'about.checkFailed'
  | 'about.unknownError'
  | 'about.backToSettings'
  | 'about.joinUs'
  | 'about.joinUsDesc'
  | 'about.wechat'
  | 'about.copy'
  | 'about.copied'
  | 'titlebar.studyTime'
  | 'titlebar.focusMode'
  | 'titlebar.exitFocus'
  | 'titlebar.exitFocusConfirm'
  | 'titlebar.exitFocusMsg'
  | 'common.back'
  | 'common.save'
  | 'common.saved'
  | 'common.cancel'
  | 'common.confirm'

const zh: Record<TranslationKey, string> = {
  'nav.dashboard': '首页',
  'nav.upload': '导入课件',
  'nav.lessons': '闯关冲刺',
  'nav.wrongbook': '错题本',
  'nav.chat': 'AI 助教',
  'nav.settings': '设置',
  'nav.levelUnit': '关卡',
  'nav.generating': '生成中...',
  'settings.title': '设置',
  'settings.subtitle': '应用信息、账户与偏好设置',
  'settings.appDesc': 'AI 驱动的闯关式期末冲刺助手',
  'settings.statsCourses': '课程',
  'settings.statsFiles': '课件文件',
  'settings.checkUpdate': '检查更新',
  'settings.checkingUpdate': '正在检查更新...',
  'settings.upToDate': '已是最新版本 v{version}',
  'settings.recheck': '重新检查',
  'settings.newVersionFound': '发现新版本 v{version}',
  'settings.currentVersion': '（当前 v{version}）',
  'settings.downloadUpdate': '下载更新',
  'settings.retry': '重试',
  'settings.account': '账户信息',
  'settings.accountDesc': '校园账号登录，为未来教务系统对接做准备',
  'settings.logout': '退出登录',
  'settings.logoutConfirm': '确定要退出登录吗？',
  'settings.notLoggedIn': '尚未登录校园账号',
  'settings.notLoggedInDesc': '登录后可同步课程信息，未来支持教务系统自动导入',
  'settings.login': '登录',
  'settings.api': 'API 配置',
  'settings.apiDesc': 'DeepSeek 模型密钥与参数',
  'settings.storage': '存储与迁移',
  'settings.storageDesc': '资源路径配置与文件迁移',
  'settings.data': '数据管理',
  'settings.dataDesc': '课程数据统计与清除',
  'settings.about': '关于',
  'settings.aboutDesc': '应用信息与检查更新',
  'settings.appearance': '外观与语言',
  'settings.appearanceDesc': '切换浅色/深色主题，选择界面语言',
  'settings.language': '语言',
  'settings.theme': '外观',
  'settings.themeLight': '浅色',
  'settings.themeDark': '深色',
  'settings.applied': '已应用',
  'settings.applyLanguage': '应用语言',
  'about.subtitle': '了解 ChillPass 并检查应用更新',
  'about.appInfo': '应用信息',
  'about.appName': '应用名称',
  'about.version': '版本',
  'about.loading': '加载中...',
  'about.unknown': '未知',
  'about.updateCheck': '更新检查',
  'about.updateCheckDesc': '检查是否有新版本可用，保持应用为最新',
  'about.checkUpdate': '检查更新',
  'about.checking': '检查中...',
  'about.checkingUpdate': '正在检查更新，请稍候...',
  'about.latest': '当前已是最新版本，无需更新',
  'about.newVersion': '发现新版本',
  'about.currentVersion': '（当前 v{version}）',
  'about.releaseDate': '发布日期：{date}',
  'about.download': '下载新版本',
  'about.checkFailed': '检查更新失败',
  'about.unknownError': '检查更新时发生未知错误',
  'about.backToSettings': '返回设置',
  'about.joinUs': '加入我们',
  'about.joinUsDesc': '添加开发者微信，交流反馈或参与项目共建',
  'about.wechat': '微信号',
  'about.copy': '复制',
  'about.copied': '已复制',
  'titlebar.studyTime': '学习',
  'titlebar.focusMode': '专注模式',
  'titlebar.exitFocus': '退出专注',
  'titlebar.exitFocusConfirm': '退出专注模式？',
  'titlebar.exitFocusMsg': '你正在专注模式中，确定要退出吗？',
  'common.back': '返回',
  'common.save': '保存',
  'common.saved': '已保存',
  'common.cancel': '取消',
  'common.confirm': '确定',
}

const en: Record<TranslationKey, string> = {
  'nav.dashboard': 'Home',
  'nav.upload': 'Import',
  'nav.lessons': 'Quests',
  'nav.wrongbook': 'Mistakes',
  'nav.chat': 'AI Tutor',
  'nav.settings': 'Settings',
  'nav.levelUnit': 'Levels',
  'nav.generating': 'Generating...',
  'settings.title': 'Settings',
  'settings.subtitle': 'App info, account & preferences',
  'settings.appDesc': 'AI-powered quest-based finals prep assistant',
  'settings.statsCourses': 'Courses',
  'settings.statsFiles': 'Files',
  'settings.checkUpdate': 'Check for Updates',
  'settings.checkingUpdate': 'Checking for updates...',
  'settings.upToDate': 'Already up to date v{version}',
  'settings.recheck': 'Recheck',
  'settings.newVersionFound': 'New version v{version} available',
  'settings.currentVersion': '(current v{version})',
  'settings.downloadUpdate': 'Download Update',
  'settings.retry': 'Retry',
  'settings.account': 'Account',
  'settings.accountDesc': 'Campus account login, preparing for future SIS integration',
  'settings.logout': 'Log Out',
  'settings.logoutConfirm': 'Are you sure you want to log out?',
  'settings.notLoggedIn': 'Not logged in to campus account',
  'settings.notLoggedInDesc': 'Log in to sync course info; future SIS auto-import supported',
  'settings.login': 'Log In',
  'settings.api': 'API Config',
  'settings.apiDesc': 'DeepSeek model key and parameters',
  'settings.storage': 'Storage',
  'settings.storageDesc': 'Resource path config and file migration',
  'settings.data': 'Data',
  'settings.dataDesc': 'Course data statistics and cleanup',
  'settings.about': 'About',
  'settings.aboutDesc': 'App info and update check',
  'settings.appearance': 'Appearance & Language',
  'settings.appearanceDesc': 'Switch light/dark theme and select UI language',
  'settings.language': 'Language',
  'settings.theme': 'Appearance',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.applied': 'Applied',
  'settings.applyLanguage': 'Apply Language',
  'about.subtitle': 'Learn about ChillPass and check for updates',
  'about.appInfo': 'App Info',
  'about.appName': 'App Name',
  'about.version': 'Version',
  'about.loading': 'Loading...',
  'about.unknown': 'Unknown',
  'about.updateCheck': 'Update Check',
  'about.updateCheckDesc': 'Check for new versions and keep the app up to date',
  'about.checkUpdate': 'Check for Updates',
  'about.checking': 'Checking...',
  'about.checkingUpdate': 'Checking for updates, please wait...',
  'about.latest': 'You are using the latest version',
  'about.newVersion': 'New version available',
  'about.currentVersion': '(current v{version})',
  'about.releaseDate': 'Release date: {date}',
  'about.download': 'Download',
  'about.checkFailed': 'Update check failed',
  'about.unknownError': 'An unknown error occurred while checking for updates',
  'about.backToSettings': 'Back to settings',
  'about.joinUs': 'Join Us',
  'about.joinUsDesc': 'Add developer WeChat for feedback or collaboration',
  'about.wechat': 'WeChat',
  'about.copy': 'Copy',
  'about.copied': 'Copied',
  'titlebar.studyTime': 'Study',
  'titlebar.focusMode': 'Focus',
  'titlebar.exitFocus': 'Exit Focus',
  'titlebar.exitFocusConfirm': 'Exit Focus Mode?',
  'titlebar.exitFocusMsg': 'You are in focus mode. Are you sure you want to exit?',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.saved': 'Saved',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
}

const ru: Record<TranslationKey, string> = {
  'nav.dashboard': 'Главная',
  'nav.upload': 'Импорт',
  'nav.lessons': 'Уровни',
  'nav.wrongbook': 'Ошибки',
  'nav.chat': 'ИИ-помощник',
  'nav.settings': 'Настройки',
  'nav.levelUnit': 'Уровни',
  'nav.generating': 'Генерация...',
  'settings.title': 'Настройки',
  'settings.subtitle': 'Информация, аккаунт и настройки',
  'settings.appDesc': 'ИИ-помощник для подготовки к экзаменам в виде квестов',
  'settings.statsCourses': 'Курсы',
  'settings.statsFiles': 'Файлы',
  'settings.checkUpdate': 'Проверить обновления',
  'settings.checkingUpdate': 'Проверка обновлений...',
  'settings.upToDate': 'У вас последняя версия v{version}',
  'settings.recheck': 'Проверить снова',
  'settings.newVersionFound': 'Доступна новая версия v{version}',
  'settings.currentVersion': '(текущая v{version})',
  'settings.downloadUpdate': 'Скачать обновление',
  'settings.retry': 'Повторить',
  'settings.account': 'Аккаунт',
  'settings.accountDesc': 'Вход через кампусный аккаунт, подготовка к интеграции с СДО',
  'settings.logout': 'Выйти',
  'settings.logoutConfirm': 'Вы уверены, что хотите выйти?',
  'settings.notLoggedIn': 'Вход в кампусный аккаунт не выполнен',
  'settings.notLoggedInDesc': 'Войдите для синхронизации курсов; будущий автоимпорт из СДО',
  'settings.login': 'Войти',
  'settings.api': 'API',
  'settings.apiDesc': 'Ключ и параметры модели DeepSeek',
  'settings.storage': 'Хранилище',
  'settings.storageDesc': 'Пути к ресурсам и миграция файлов',
  'settings.data': 'Данные',
  'settings.dataDesc': 'Статистика курсов и очистка данных',
  'settings.about': 'О приложении',
  'settings.aboutDesc': 'Информация о приложении и проверка обновлений',
  'settings.appearance': 'Оформление и язык',
  'settings.appearanceDesc': 'Переключение светлой/тёмной темы и выбор языка',
  'settings.language': 'Язык',
  'settings.theme': 'Оформление',
  'settings.themeLight': 'Светлая',
  'settings.themeDark': 'Тёмная',
  'settings.applied': 'Применено',
  'settings.applyLanguage': 'Применить язык',
  'about.subtitle': 'Узнайте о ChillPass и проверьте обновления',
  'about.appInfo': 'Информация о приложении',
  'about.appName': 'Название',
  'about.version': 'Версия',
  'about.loading': 'Загрузка...',
  'about.unknown': 'Неизвестно',
  'about.updateCheck': 'Проверка обновлений',
  'about.updateCheckDesc': 'Проверка наличия новой версии и поддержание актуальности',
  'about.checkUpdate': 'Проверить обновления',
  'about.checking': 'Проверка...',
  'about.checkingUpdate': 'Проверка обновлений, подождите...',
  'about.latest': 'У вас последняя версия',
  'about.newVersion': 'Доступна новая версия',
  'about.currentVersion': '(текущая v{version})',
  'about.releaseDate': 'Дата выпуска: {date}',
  'about.download': 'Скачать',
  'about.checkFailed': 'Ошибка проверки обновлений',
  'about.unknownError': 'Неизвестная ошибка при проверке обновлений',
  'about.backToSettings': 'Назад к настройкам',
  'about.joinUs': 'Присоединяйтесь',
  'about.joinUsDesc': 'Добавьте WeChat разработчика для обратной связи',
  'about.wechat': 'WeChat',
  'about.copy': 'Копировать',
  'about.copied': 'Скопировано',
  'titlebar.studyTime': 'Учёба',
  'titlebar.focusMode': 'Фокус',
  'titlebar.exitFocus': 'Выйти из фокуса',
  'titlebar.exitFocusConfirm': 'Выйти из режима фокуса?',
  'titlebar.exitFocusMsg': 'Вы в режиме фокуса. Вы уверены, что хотите выйти?',
  'common.back': 'Назад',
  'common.save': 'Сохранить',
  'common.saved': 'Сохранено',
  'common.cancel': 'Отмена',
  'common.confirm': 'ОК',
}

const ja: Record<TranslationKey, string> = {
  'nav.dashboard': 'ホーム',
  'nav.upload': 'インポート',
  'nav.lessons': 'クエスト',
  'nav.wrongbook': '間違い帳',
  'nav.chat': 'AIチューター',
  'nav.settings': '設定',
  'nav.levelUnit': 'レベル',
  'nav.generating': '生成中...',
  'settings.title': '設定',
  'settings.subtitle': 'アプリ情報、アカウントと設定',
  'settings.appDesc': 'AI駆動のクエスト式期末対策アシスタント',
  'settings.statsCourses': 'コース',
  'settings.statsFiles': 'ファイル',
  'settings.checkUpdate': '更新を確認',
  'settings.checkingUpdate': '更新を確認中...',
  'settings.upToDate': '最新バージョンです v{version}',
  'settings.recheck': '再確認',
  'settings.newVersionFound': '新バージョン v{version} があります',
  'settings.currentVersion': '（現在 v{version}）',
  'settings.downloadUpdate': '更新をダウンロード',
  'settings.retry': '再試行',
  'settings.account': 'アカウント',
  'settings.accountDesc': 'キャンパスアカウントでログイン、将来の教务システム連携に備える',
  'settings.logout': 'ログアウト',
  'settings.logoutConfirm': 'ログアウトしますか？',
  'settings.notLoggedIn': 'キャンパスアカウント未ログイン',
  'settings.notLoggedInDesc': 'ログインでコース情報を同期、将来の教务システム自動インポート対応',
  'settings.login': 'ログイン',
  'settings.api': 'API設定',
  'settings.apiDesc': 'DeepSeekモデルのキーとパラメータ',
  'settings.storage': 'ストレージ',
  'settings.storageDesc': 'リソースパス設定とファイル移行',
  'settings.data': 'データ',
  'settings.dataDesc': 'コースデータの統計と削除',
  'settings.about': 'について',
  'settings.aboutDesc': 'アプリ情報と更新確認',
  'settings.appearance': '外観と言語',
  'settings.appearanceDesc': 'ライト/ダークテーマの切替と言語選択',
  'settings.language': '言語',
  'settings.theme': '外観',
  'settings.themeLight': 'ライト',
  'settings.themeDark': 'ダーク',
  'settings.applied': '適用済み',
  'settings.applyLanguage': '言語を適用',
  'about.subtitle': 'ChillPassについて知り、更新を確認する',
  'about.appInfo': 'アプリ情報',
  'about.appName': 'アプリ名',
  'about.version': 'バージョン',
  'about.loading': '読み込み中...',
  'about.unknown': '不明',
  'about.updateCheck': '更新確認',
  'about.updateCheckDesc': '新バージョンの確認とアプリの最新化',
  'about.checkUpdate': '更新を確認',
  'about.checking': '確認中...',
  'about.checkingUpdate': '更新を確認中です、お待ちください...',
  'about.latest': '最新バージョンです',
  'about.newVersion': '新バージョンがあります',
  'about.currentVersion': '（現在 v{version}）',
  'about.releaseDate': 'リリース日：{date}',
  'about.download': 'ダウンロード',
  'about.checkFailed': '更新確認に失敗',
  'about.unknownError': '更新確認中に不明なエラーが発生しました',
  'about.backToSettings': '設定に戻る',
  'about.joinUs': '参加する',
  'about.joinUsDesc': 'WeChatでフィードバックや協力',
  'about.wechat': 'WeChat',
  'about.copy': 'コピー',
  'about.copied': 'コピー済み',
  'titlebar.studyTime': '学習',
  'titlebar.focusMode': '集中',
  'titlebar.exitFocus': '集中終了',
  'titlebar.exitFocusConfirm': '集中モードを終了しますか？',
  'titlebar.exitFocusMsg': '集中モード中です。本当に終了しますか？',
  'common.back': '戻る',
  'common.save': '保存',
  'common.saved': '保存済み',
  'common.cancel': 'キャンセル',
  'common.confirm': '確認',
}

const ko: Record<TranslationKey, string> = {
  'nav.dashboard': '홈',
  'nav.upload': '가져오기',
  'nav.lessons': '퀘스트',
  'nav.wrongbook': '오답노트',
  'nav.chat': 'AI 튜터',
  'nav.settings': '설정',
  'nav.levelUnit': '레벨',
  'nav.generating': '생성 중...',
  'settings.title': '설정',
  'settings.subtitle': '앱 정보, 계정 및 환경설정',
  'settings.appDesc': 'AI 기반 퀘스트식 기말고사 대비 도우미',
  'settings.statsCourses': '코스',
  'settings.statsFiles': '파일',
  'settings.checkUpdate': '업데이트 확인',
  'settings.checkingUpdate': '업데이트 확인 중...',
  'settings.upToDate': '최신 버전입니다 v{version}',
  'settings.recheck': '다시 확인',
  'settings.newVersionFound': '새 버전 v{version}이 있습니다',
  'settings.currentVersion': '(현재 v{version})',
  'settings.downloadUpdate': '업데이트 다운로드',
  'settings.retry': '재시도',
  'settings.account': '계정',
  'settings.accountDesc': '캠퍼스 계정 로그인, 향후 학사시스템 연동 대비',
  'settings.logout': '로그아웃',
  'settings.logoutConfirm': '로그아웃하시겠습니까?',
  'settings.notLoggedIn': '캠퍼스 계정 미로그인',
  'settings.notLoggedInDesc': '로그인 시 코스 정보 동기화, 향후 학사시스템 자동 가져오기 지원',
  'settings.login': '로그인',
  'settings.api': 'API 설정',
  'settings.apiDesc': 'DeepSeek 모델 키 및 매개변수',
  'settings.storage': '저장소',
  'settings.storageDesc': '리소스 경로 설정 및 파일 마이그레이션',
  'settings.data': '데이터',
  'settings.dataDesc': '코스 데이터 통계 및 삭제',
  'settings.about': '정보',
  'settings.aboutDesc': '앱 정보 및 업데이트 확인',
  'settings.appearance': '테마 및 언어',
  'settings.appearanceDesc': '라이트/다크 테마 전환 및 언어 선택',
  'settings.language': '언어',
  'settings.theme': '테마',
  'settings.themeLight': '라이트',
  'settings.themeDark': '다크',
  'settings.applied': '적용됨',
  'settings.applyLanguage': '언어 적용',
  'about.subtitle': 'ChillPass에 대해 알아보고 업데이트를 확인하세요',
  'about.appInfo': '앱 정보',
  'about.appName': '앱 이름',
  'about.version': '버전',
  'about.loading': '로딩 중...',
  'about.unknown': '알 수 없음',
  'about.updateCheck': '업데이트 확인',
  'about.updateCheckDesc': '새 버전 확인 및 앱 최신 상태 유지',
  'about.checkUpdate': '업데이트 확인',
  'about.checking': '확인 중...',
  'about.checkingUpdate': '업데이트 확인 중, 잠시만 기다려 주세요...',
  'about.latest': '최신 버전입니다',
  'about.newVersion': '새 버전이 있습니다',
  'about.currentVersion': '(현재 v{version})',
  'about.releaseDate': '출시일: {date}',
  'about.download': '다운로드',
  'about.checkFailed': '업데이트 확인 실패',
  'about.unknownError': '업데이트 확인 중 알 수 없는 오류가 발생했습니다',
  'about.backToSettings': '설정으로 돌아가기',
  'about.joinUs': '참여하기',
  'about.joinUsDesc': 'WeChat으로 피드백 및 협업',
  'about.wechat': 'WeChat',
  'about.copy': '복사',
  'about.copied': '복사됨',
  'titlebar.studyTime': '학습',
  'titlebar.focusMode': '집중',
  'titlebar.exitFocus': '집중 종료',
  'titlebar.exitFocusConfirm': '집중 모드를 종료하시겠습니까?',
  'titlebar.exitFocusMsg': '집중 모드 중입니다. 정말 종료하시겠습니까?',
  'common.back': '뒤로',
  'common.save': '저장',
  'common.saved': '저장됨',
  'common.cancel': '취소',
  'common.confirm': '확인',
}

const translations: Record<Language, Record<TranslationKey, string>> = {
  zh, en, ru, ja, ko,
}

export function translate(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] ?? translations.zh[key] ?? key
}
