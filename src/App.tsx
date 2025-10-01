import { useState } from "react"
import { Toaster } from "sonner"
import { TodoWindow } from "@/components/todo-window"
import type { Locale } from "@/lib/i18n"

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  return (
    <>
      <TodoWindow locale={locale} onLocaleChange={setLocale} />
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3000}
        theme="system"
      />
    </>
  )
}

export default App
