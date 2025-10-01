export type Locale = "en" | "zh-CN"

export const translations = {
  en: {
    addTodo: "Add a new task...",
    emptyState: "No tasks yet. Add one to get started!",
    deleteAll: "Delete all completed",
    taskCount: (count: number) => `${count} ${count === 1 ? "task" : "tasks"}`,
  },
  "zh-CN": {
    addTodo: "添加新任务...",
    emptyState: "还没有任务。添加一个开始吧！",
    deleteAll: "删除所有已完成",
    taskCount: (count: number) => `${count} 个任务`,
  },
}

export function useTranslation(locale: Locale) {
  return translations[locale]
}
