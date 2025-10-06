import { useState } from "react"
import { Toaster } from "sonner"
import { TodoWindow } from "@/components/todo-window"
import { WindowProvider } from "@/contexts/WindowContext"
import type { Locale } from "@/lib/i18n"

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  return (
    <WindowProvider>
      <TodoWindow locale={locale} onLocaleChange={setLocale} />
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3000}
        theme="system"
      />
    </WindowProvider>
  )
}

export default App
