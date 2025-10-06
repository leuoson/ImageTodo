import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'
import type { Settings } from '@/lib/settings'
import { RotateCcw } from 'lucide-react'

interface AISystemPromptSettingsProps {
  settings: Settings
  onSettingsChange: (updates: Partial<Settings>) => void
}

export function AISystemPromptSettings({ settings, onSettingsChange }: AISystemPromptSettingsProps) {
  const t = useTranslation(settings.locale)
  const [isResetting, setIsResetting] = useState(false)

  // 获取当前语言的提示词配置
  const getCurrentLocalePrompts = () => {
    return settings.aiSystemPrompts?.[settings.locale] || {}
  }

  // 获取默认提示词
  const getDefaultPrompt = () => {
    const language = settings.locale === 'zh-CN' ? '中文' : 'English'
    return t.aiSystemPrompts.defaultTodoTaskPrompt.replace('{language}', language)
  }

  // 更新当前语言的提示词
  const updatePrompt = (prompt: string) => {
    const currentPrompts = getCurrentLocalePrompts()
    const updatedPrompts = {
      ...settings.aiSystemPrompts,
      [settings.locale]: {
        ...currentPrompts,
        todoTaskPrompt: prompt
      }
    }
    onSettingsChange({ aiSystemPrompts: updatedPrompts })
  }

  // 重置当前语言的提示词
  const resetPrompt = async () => {
    setIsResetting(true)
    try {
      const defaultPrompt = getDefaultPrompt()
      console.log(`[AI提示词重置] 当前语言: ${settings.locale}`)
      console.log(`[AI提示词重置] 从国际化配置读取的默认提示词: ${defaultPrompt}`)

      const updatedPrompts = {
        ...settings.aiSystemPrompts,
        [settings.locale]: {
          todoTaskPrompt: defaultPrompt
        }
      }
      onSettingsChange({ aiSystemPrompts: updatedPrompts })
      toast.success(t.aiSystemPrompts.promptReset)
    } catch (error) {
      toast.error('重置失败')
    } finally {
      setIsResetting(false)
    }
  }

  const currentPrompt = getCurrentLocalePrompts().todoTaskPrompt || getDefaultPrompt()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t.aiSystemPrompts.title}
          <Button
            variant="outline"
            size="sm"
            onClick={resetPrompt}
            disabled={isResetting}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t.aiSystemPrompts.resetPrompt}
          </Button>
        </CardTitle>
        <CardDescription>
          {t.aiSystemPrompts.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="todo-task-prompt">
            {t.aiSystemPrompts.todoTaskPrompt}
          </Label>
          <Textarea
            id="todo-task-prompt"
            placeholder={t.aiSystemPrompts.todoTaskPromptPlaceholder}
            value={currentPrompt}
            onChange={(e) => updatePrompt(e.target.value)}
            rows={4}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            提示词将用于指导AI生成待办任务。点击重置按钮将恢复当前语言的默认提示词。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}