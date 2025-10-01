import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { type Locale, useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface ShortcutSectionProps {
  locale: Locale
  shortcut: string
  onShortcutChange: (shortcut: string) => void
  onError?: (error: string) => void
}

export function ShortcutSection({
  locale,
  shortcut,
  onShortcutChange,
  onError
}: ShortcutSectionProps) {
  const t = useTranslation(locale)
  const [isCapturing, setIsCapturing] = useState(false)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isCapturing) return

    e.preventDefault()
    e.stopPropagation()

    // Don't process modifier-only keys or escape key
    const isModifierOnly = ['Control', 'Meta', 'Shift', 'Alt', 'AltGraph'].includes(e.key)
    if (isModifierOnly) {
      return // Wait for the actual key combination
    }

    // Handle escape key to cancel capture
    if (e.key === 'Escape') {
      setIsCapturing(false)
      return
    }

    const keys: string[] = []

    // Add modifier keys in consistent order
    if (e.ctrlKey || e.metaKey) {
      keys.push(e.ctrlKey ? 'Ctrl' : 'Cmd')
    }
    if (e.altKey) {
      keys.push('Alt')
    }
    if (e.shiftKey) {
      keys.push('Shift')
    }

    // Add main key (only letters, numbers, and function keys)
    let mainKey = ''
    if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
      mainKey = e.key.toUpperCase()
    } else if (/^F\d+$/.test(e.key)) {
      mainKey = e.key
    } else if (['Space', 'Enter', 'Tab', 'Backspace', 'Delete'].includes(e.key)) {
      mainKey = e.key
    }

    if (mainKey) {
      keys.push(mainKey)
    }

    // Only accept combinations with at least one modifier + main key
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
    if (hasModifier && mainKey && keys.length >= 2) {
      const shortcutString = keys.join('+')
      onShortcutChange(shortcutString)
      setIsCapturing(false)

      // Don't show success toast here, let parent handle it
    } else if (mainKey) {
      // Show error for invalid shortcut (no modifier)
      toast.error(t.invalidShortcut)
      onError?.(t.invalidShortcut)
      setIsCapturing(false)
    }
    // If no main key, just ignore (user is still typing)
  }

  const handleInputClick = () => {
    setIsCapturing(true)
  }

  const handleClearShortcut = () => {
    onShortcutChange('')
    toast.success(t.shortcutCleared)
  }

  // Add/remove event listener for key capture
  useEffect(() => {
    if (isCapturing) {
      document.addEventListener('keydown', handleKeyDown, true)
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [isCapturing])

  // Auto-cancel capture after 5 seconds
  useEffect(() => {
    if (isCapturing) {
      const timer = setTimeout(() => {
        setIsCapturing(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isCapturing])

  const displayValue = () => {
    if (isCapturing) {
      return t.pressingShortcut
    }
    if (shortcut && shortcut.trim() !== '') {
      return shortcut
    }
    return t.clickToSetShortcut
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">
        {t.screenshotShortcut}
      </h3>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={displayValue()}
            placeholder={t.clickToSetShortcut}
            readOnly
            onClick={handleInputClick}
            className={cn(
              "flex-1 px-3 py-2 text-sm rounded-md border border-input",
              "bg-background text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              "cursor-pointer transition-colors",
              isCapturing && "ring-2 ring-ring border-ring bg-accent/50"
            )}
          />
          {shortcut && shortcut.trim() !== '' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearShortcut}
              className="px-3"
            >
              清除
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t.invalidShortcut}
        </p>
        {isCapturing && (
          <p className="text-xs text-primary">
            {t.pressingShortcut}
          </p>
        )}
      </div>
    </div>
  )
}
