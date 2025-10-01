export type Locale = "en" | "zh-CN"

export const translations = {
  en: {
    addTodo: "Add a new task...",
    emptyState: "No tasks yet. Add one to get started!",
    deleteAll: "Delete all completed",
    taskCount: (count: number) => `${count} ${count === 1 ? "task" : "tasks"}`,
    // Settings popup
    settings: "Settings",
    language: "Language",
    screenshotShortcut: "Screenshot Shortcut",
    clickToSetShortcut: "Click to set shortcut",
    pressingShortcut: "Press shortcut keys...",
    shortcutConflict: "Shortcut conflicts with system shortcuts",
    chinese: "Chinese",
    english: "English",
    // Error and feedback messages
    settingsSaveError: "Failed to save settings",
    settingsLoadError: "Failed to load settings",
    shortcutRegisterError: "Failed to register shortcut",
    shortcutInvalidError: "Invalid shortcut combination",
    checkPermissions: "Please check app permissions and try again",
    shortcutAlreadyUsed: "This shortcut is already in use",
    shortcutRegistered: "Shortcut registered successfully",
    settingsSaved: "Settings saved successfully",
    noShortcutSet: "No shortcut set",
    shortcutCleared: "Shortcut cleared",
    invalidShortcut: "Please use Ctrl/Cmd + letter/number combinations",
  },
  "zh-CN": {
    addTodo: "添加新任务...",
    emptyState: "还没有任务。添加一个开始吧！",
    deleteAll: "删除所有已完成",
    taskCount: (count: number) => `${count} 个任务`,
    // Settings popup
    settings: "设置",
    language: "语言",
    screenshotShortcut: "截图快捷键",
    clickToSetShortcut: "点击设置快捷键",
    pressingShortcut: "按下快捷键...",
    shortcutConflict: "快捷键与系统快捷键冲突",
    chinese: "中文",
    english: "英文",
    // Error and feedback messages
    settingsSaveError: "设置保存失败",
    settingsLoadError: "设置加载失败",
    shortcutRegisterError: "快捷键注册失败",
    shortcutInvalidError: "无效的快捷键组合",
    checkPermissions: "请检查应用权限并重试",
    shortcutAlreadyUsed: "此快捷键已被占用",
    shortcutRegistered: "快捷键注册成功",
    settingsSaved: "设置保存成功",
    noShortcutSet: "未设置快捷键",
    shortcutCleared: "快捷键已清除",
    invalidShortcut: "请使用 Ctrl/Cmd + 字母/数字 组合键",
  },
}

export function useTranslation(locale: Locale) {
  return translations[locale]
}

