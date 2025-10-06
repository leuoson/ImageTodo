import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSection } from "@/components/language-section"
import { ShortcutSection } from "@/components/shortcut-section"
import { AIProviderSettings } from "@/components/ai-provider-settings"
import { AISystemPromptSettings } from "@/components/ai-system-prompt-settings"
import { useTranslation } from "@/lib/i18n"
import { type Settings } from "@/lib/settings"
import { cn } from "@/lib/utils"

interface SettingsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSettingsChange: (updates: Partial<Settings>) => void
}

export function SettingsPopup({
  open,
  onOpenChange,
  settings,
  onSettingsChange
}: SettingsPopupProps) {
  const t = useTranslation(settings.locale)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-card border-t border-border/50 rounded-t-xl",
            "max-h-[70vh] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {t.settings}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Language Section */}
            <LanguageSection
              locale={settings.locale}
              onLocaleChange={(locale) => onSettingsChange({ locale })}
            />

            {/* Separator */}
            <div className="border-t border-border/50" />

            {/* Region Capture Shortcut Section */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">
                {t.regionCaptureShortcut}
              </div>
              <ShortcutSection
                locale={settings.locale}
                shortcut={settings.regionCaptureShortcut}
                onShortcutChange={(shortcut) => onSettingsChange({ regionCaptureShortcut: shortcut })}
              />
              <p className="text-xs text-muted-foreground">
                {t.restartRequired}
              </p>
            </div>

            {/* Separator */}
            <div className="border-t border-border/50" />

            {/* AI Provider Settings */}
            <AIProviderSettings
              settings={settings}
              onSettingsChange={onSettingsChange}
            />

            {/* Separator */}
            <div className="border-t border-border/50" />

            {/* AI System Prompt Settings */}
            <AISystemPromptSettings
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
