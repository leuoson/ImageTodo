import { useState } from "react"
import { TodoWindow } from "@/components/todo-window"
import type { Locale } from "@/lib/i18n"

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  return (
    <main className="min-h-screen gradient-bg flex items-center justify-center p-8">
      <TodoWindow locale={locale} onLocaleChange={setLocale} />
    </main>
  )
}

export default App
