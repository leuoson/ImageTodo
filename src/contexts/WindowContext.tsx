import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

interface WindowContextType {
  windowId: string
  isLoading: boolean
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windowId, setWindowId] = useState<string>('main')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectWindowId = async () => {
      try {
        const window = getCurrentWindow()
        const label = window.label
        
        // Extract window ID from label
        // Main window has label "main", new windows have "todo-window-{timestamp}-{counter}"
        if (label === 'main') {
          setWindowId('main')
        } else if (label.startsWith('todo-window-')) {
          // Use the full label as the window ID for uniqueness
          setWindowId(label)
        } else {
          // Fallback to main if label format is unexpected
          console.warn(`Unexpected window label format: ${label}, using 'main'`)
          setWindowId('main')
        }
      } catch (error) {
        console.error('Failed to detect window ID:', error)
        setWindowId('main') // Fallback to main
      } finally {
        setIsLoading(false)
      }
    }

    detectWindowId()
  }, [])

  return (
    <WindowContext.Provider value={{ windowId, isLoading }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindow() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider')
  }
  return context
}

