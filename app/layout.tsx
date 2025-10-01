import { ReactNode } from 'react'
import '@fontsource/geist-sans'
import '@fontsource/geist-mono'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>Image Todo</title>
        <meta name="description" content="Desktop Todo App" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}

