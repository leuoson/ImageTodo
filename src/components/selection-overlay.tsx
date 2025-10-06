import { useState, useRef, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { toast } from 'sonner'
import { loadSettings } from '@/lib/settings'
import { useTranslation, type Locale } from '@/lib/i18n'
import './selection-overlay.css'

interface SelectionRect {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function SelectionOverlay() {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [locale, setLocale] = useState<Locale>('zh-CN')
  const [scaleFactor, setScaleFactor] = useState<number>(1.0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const t = useTranslation(locale)

  // Load locale from settings
  useEffect(() => {
    loadSettings().then(settings => {
      setLocale(settings.locale)
    }).catch(error => {
      console.error('Failed to load locale:', error)
    })
  }, [])

  // Get window scale factor on mount and ensure focus
  useEffect(() => {
    getCurrentWindow()
      .scaleFactor()
      .then(factor => {
        setScaleFactor(factor)
        console.log('Window scale factor:', factor)
      })
      .catch(err => {
        console.error('Failed to get scale factor:', err)
        // Keep default value 1.0
      })

    // Ensure window is focused when component mounts
    const ensureFocus = () => {
      getCurrentWindow()
        .setFocus()
        .then(() => {
          console.log('Window focus set successfully')
        })
        .catch(err => {
          console.error('Failed to set window focus:', err)
        })
    }

    // Initial focus attempt
    ensureFocus()

    // Also try to set focus after a short delay
    const focusTimer = setTimeout(() => {
      ensureFocus()
    }, 100)

    return () => clearTimeout(focusTimer)
  }, [])

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only handle left button
    
    setIsSelecting(true)
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
    })
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selection) return
    
    setSelection({
      ...selection,
      endX: e.clientX,
      endY: e.clientY,
    })
  }

  // Handle mouse up
  const handleMouseUp = async () => {
    if (!isSelecting || !selection) return

    setIsSelecting(false)

    // Calculate selection region (CSS pixels)
    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const width = Math.abs(selection.endX - selection.startX)
    const height = Math.abs(selection.endY - selection.startY)

    // Check minimum size
    if (width < 50 || height < 50) {
      toast.error(t.regionTooSmall)
      setSelection(null)
      return
    }

    // Convert CSS pixels to physical pixels
    const physicalX = Math.round(x * scaleFactor)
    const physicalY = Math.round(y * scaleFactor)
    const physicalWidth = Math.round(width * scaleFactor)
    const physicalHeight = Math.round(height * scaleFactor)

    console.log('CSS coordinates:', { x, y, width, height })
    console.log('Physical coordinates:', {
      x: physicalX,
      y: physicalY,
      width: physicalWidth,
      height: physicalHeight
    })

    try {
      // Call Rust command to capture screenshot with physical pixels
      const result = await invoke<{success: boolean, path?: string, message?: string, error?: string}>(
        'capture_screen_region',
        {
          x: physicalX,
          y: physicalY,
          width: physicalWidth,
          height: physicalHeight
        }
      )

      if (result.success) {
        // Display message from Rust (includes clipboard status)
        toast.success(result.message || t.screenshotSaved)
        // Window will be closed by Rust side
      } else {
        toast.error(result.error || t.screenshotFailed)
        setSelection(null)
      }
    } catch (error) {
      console.error('Screenshot failed:', error)
      toast.error(t.screenshotFailed)
      setSelection(null)
    }
  }

  // Handle right click to cancel
  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await getCurrentWindow().close()
    } catch (error) {
      console.error('Failed to close window:', error)
    }
  }

  // Handle Esc key to cancel
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'Code:', e.code, 'Target:', e.target)
      if (e.key === 'Escape' || e.code === 'Escape') {
        console.log('Escape key detected, preventing default and closing window...')
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        // Immediately close window without async to prevent interference
        try {
          const window = getCurrentWindow()
          window.close().then(() => {
            console.log('Window closed successfully')
          }).catch(error => {
            console.error('Failed to close window:', error)
          })
        } catch (error) {
          console.error('Failed to get window:', error)
        }
        return false
      }
    }

    // Add event listeners with highest priority
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })

    // Also add on capture phase for body
    document.body.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true, passive: false } as any)
      document.removeEventListener('keydown', handleKeyDown, { capture: true, passive: false } as any)
      document.body.removeEventListener('keydown', handleKeyDown, { capture: true, passive: false } as any)
    }
  }, [])

  // Calculate selection box style
  const getSelectionStyle = () => {
    if (!selection) return {}
    
    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const width = Math.abs(selection.endX - selection.startX)
    const height = Math.abs(selection.endY - selection.startY)
    
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  }

  // Calculate size display position
  const getSizeDisplayStyle = () => {
    if (!selection) return {}
    
    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const width = Math.abs(selection.endX - selection.startX)
    
    return {
      left: `${x + width + 10}px`,
      top: `${y - 30}px`,
    }
  }

  const width = selection ? Math.abs(selection.endX - selection.startX) : 0
  const height = selection ? Math.abs(selection.endY - selection.startY) : 0

  return (
    <div
      ref={overlayRef}
      className="selection-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Semi-transparent mask */}
      <div className="overlay-mask" />
      
      {/* Selection box */}
      {selection && (
        <>
          <div className="selection-box" style={getSelectionStyle()} />
          <div className="size-display" style={getSizeDisplayStyle()}>
            {width} × {height}
          </div>
        </>
      )}
    </div>
  )
}

