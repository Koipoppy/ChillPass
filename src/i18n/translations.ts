import type { Language } from '@stores/languageStore'

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.upload'
  | 'nav.lessons'
  | 'nav.chat'
  | 'nav.settings'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.account'
  | 'settings.api'
  | 'settings.storage'
  | 'settings.data'
  | 'settings.about'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.themeLight'
  | 'settings.themeDark'
  | 'about.appName'
  | 'about.version'
  | 'about.checkUpdate'
  | 'about.checking'
  | 'about.latest'
  | 'about.newVersion'
  | 'about.download'
  | 'about.checkFailed'
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
  'nav.chat': 'AI 助教',
  'nav.settings': '设置',
  'settings.title': '设置',
  'settings.subtitle': '应用信息、账户与偏好设置',
  'settings.account': '账户信息',
  'settings.api': 'API 配置',
  'settings.storage': '存储与迁移',
  'settings.data': '数据管理',
  'settings.about': '关于',
  'settings.language': '语言',
  'settings.theme': '外观',
  'settings.themeLight': '浅色',
  'settings.themeDark': '深色',
  'about.appName': '应用名称',
  'about.version': '版本',
  'about.checkUpdate': '检查更新',
  'about.checking': '检查中...',
  'about.latest': '当前已是最新版本，无需更新',
  'about.newVersion': '发现新版本',
  'about.download': '下载新版本',
  'about.checkFailed': '检查更新失败',
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
  'nav.chat': 'AI Tutor',
  'nav.settings': 'Settings',
  'settings.title': 'Settings',
  'settings.subtitle': 'App info, account & preferences',
  'settings.account': 'Account',
  'settings.api': 'API Config',
  'settings.storage': 'Storage',
  'settings.data': 'Data',
  'settings.about': 'About',
  'settings.language': 'Language',
  'settings.theme': 'Appearance',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'about.appName': 'App Name',
  'about.version': 'Version',
  'about.checkUpdate': 'Check for Updates',
  'about.checking': 'Checking...',
  'about.latest': 'You are using the latest version',
  'about.newVersion': 'New version available',
  'about.download': 'Download',
  'about.checkFailed': 'Update check failed',
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
  'nav.chat': 'ИИ-помощник',
  'nav.settings': 'Настройки',
  'settings.title': 'Настройки',
  'settings.subtitle': 'Информация, аккаунт и настройки',
  'settings.account': 'Аккаунт',
  'settings.api': 'API',
  'settings.storage': 'Хранилище',
  'settings.data': 'Данные',
  'settings.about': 'О приложении',
  'settings.language': 'Язык',
  'settings.theme': 'Оформление',
  'settings.themeLight': 'Светлая',
  'settings.themeDark': 'Тёмная',
  'about.appName': 'Название',
  'about.version': 'Версия',
  'about.checkUpdate': 'Проверить обновления',
  'about.checking': 'Проверка...',
  'about.latest': 'У вас последняя версия',
  'about.newVersion': 'Доступна новая версия',
  'about.download': 'Скачать',
  'about.checkFailed': 'Ошибка проверки обновлений',
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
  'nav.chat': 'AIチューター',
  'nav.settings': '設定',
  'settings.title': '設定',
  'settings.subtitle': 'アプリ情報、アカウントと設定',
  'settings.account': 'アカウント',
  'settings.api': 'API設定',
  'settings.storage': 'ストレージ',
  'settings.data': 'データ',
  'settings.about': 'について',
  'settings.language': '言語',
  'settings.theme': '外観',
  'settings.themeLight': 'ライト',
  'settings.themeDark': 'ダーク',
  'about.appName': 'アプリ名',
  'about.version': 'バージョン',
  'about.checkUpdate': '更新を確認',
  'about.checking': '確認中...',
  'about.latest': '最新バージョンです',
  'about.newVersion': '新バージョンがあります',
  'about.download': 'ダウンロード',
  'about.checkFailed': '更新確認に失敗',
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
  'nav.chat': 'AI 튜터',
  'nav.settings': '설정',
  'settings.title': '설정',
  'settings.subtitle': '앱 정보, 계정 및 환경설정',
  'settings.account': '계정',
  'settings.api': 'API 설정',
  'settings.storage': '저장소',
  'settings.data': '데이터',
  'settings.about': '정보',
  'settings.language': '언어',
  'settings.theme': '테마',
  'settings.themeLight': '라이트',
  'settings.themeDark': '다크',
  'about.appName': '앱 이름',
  'about.version': '버전',
  'about.checkUpdate': '업데이트 확인',
  'about.checking': '확인 중...',
  'about.latest': '최신 버전입니다',
  'about.newVersion': '새 버전이 있습니다',
  'about.download': '다운로드',
  'about.checkFailed': '업데이트 확인 실패',
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
