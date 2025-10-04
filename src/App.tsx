import { useState } from "react"
import { Toaster } from "sonner"
import { TodoWindow } from "@/components/todo-window"
import { PhaseTest } from "@/test-phase"
import type { Locale } from "@/lib/i18n"

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  return (
    <>
      <TodoWindow locale={locale} onLocaleChange={setLocale} />
      {/* 阶段性测试组件 */}
      <div className="fixed bottom-4 right-4 z-50 w-96">
        <PhaseTest />
      </div>
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
