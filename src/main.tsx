import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"
import "@fontsource/geist-sans"
import "@fontsource/geist-mono"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="image-todo-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
