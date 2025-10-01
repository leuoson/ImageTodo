import React from "react"
import ReactDOM from "react-dom/client"
import RootLayout from "../app/layout"
import Home from "../app/page"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootLayout>
      <Home />
    </RootLayout>
  </React.StrictMode>,
)
