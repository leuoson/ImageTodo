import { useState, useRef, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { toast } from 'sonner'
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
  const overlayRef = useRef<HTMLDivElement>(null)

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
    
    // Calculate selection region
    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const width = Math.abs(selection.endX - selection.startX)
    const height = Math.abs(selection.endY - selection.startY)
    
    // Check minimum size
    if (width < 50 || height < 50) {
      toast.error('选择区域过小,请重新选择')
      setSelection(null)
      return
    }
    
    try {
      // Call Rust command to capture screenshot
      const result = await invoke<{success: boolean, path?: string, error?: string}>(
        'capture_screen_region',
        { x, y, width, height }
      )
      
      if (result.success) {
        toast.success('区域截图已保存')
        // Window will be closed by Rust side
      } else {
        toast.error(result.error || '区域截图失败')
        setSelection(null)
      }
    } catch (error) {
      console.error('Screenshot failed:', error)
      toast.error('区域截图失败')
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
      console.log('Key pressed:', e.key, 'Code:', e.code)
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        console.log('Closing window...')
        try {
          const window = getCurrentWindow()
          await window.close()
          console.log('Window closed successfully')
        } catch (error) {
          console.error('Failed to close window:', error)
        }
        return false
      }
    }

    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    // Add multiple event listeners to catch all escape events
    window.addEventListener('keydown', handleKeyDown, true) // Capture phase
    window.addEventListener('keyup', handleKeyUp, true) // Capture phase
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('keyup', handleKeyUp, true)
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

