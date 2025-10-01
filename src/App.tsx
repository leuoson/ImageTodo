import { useState } from "react"
import { TodoWindow } from "@/components/todo-window"
import type { Locale } from "@/lib/i18n"

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  return <TodoWindow locale={locale} onLocaleChange={setLocale} />
}

export default App
