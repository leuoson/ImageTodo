import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import { DEEPSEEK_MODELS, OPENROUTER_MODELS, OLLAMA_MODELS } from '@/lib/ai-models'
import type { Settings } from '@/lib/settings'

interface AIProviderSettingsProps {
  settings: Settings
  onSettingsChange: (updates: Partial<Settings>) => void
}

interface AIProvider {
  name: string
  api_base: string
  api_key: string | null
  model: string
  enabled: boolean
}

export function AIProviderSettings({ settings, onSettingsChange }: AIProviderSettingsProps) {
  const [testing, setTesting] = useState(false)

  const testConnection = async () => {
    setTesting(true)
    try {
      const providers = await invoke<AIProvider[]>('get_available_ai_providers')

      if (providers.length === 0) {
        toast.error('未配置AI提供商')
        return
      }

      toast.success(
        `找到 ${providers.length} 个AI提供商: ${providers.map(p => p.name).join(', ')}`
      )
    } catch (error) {
      toast.error(`测试失败: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI提供商</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={testing}
        >
          {testing ? '测试中...' : '测试连接'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        配置AI提供商用于智能总结OCR识别的文本。AI功能是可选的,默认使用OCR原文。
      </p>

      {/* DeepSeek */}
      <div className="space-y-3 p-4 border rounded-lg bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">DeepSeek</Label>
            <span className="text-xs text-green-600 ml-2">推荐 - 性价比最高</span>
          </div>
          <span className="text-xs text-muted-foreground">DeepSeek Chat</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deepseek-key" className="text-sm">
            API密钥
          </Label>
          <Input
            id="deepseek-key"
            type="password"
            placeholder="sk-..."
            value={settings.deepseekApiKey || ''}
            onChange={(e) => onSettingsChange({ deepseekApiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            从 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.deepseek.com</a> 获取密钥
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deepseek-model" className="text-sm">
            模型
          </Label>
          <select
            id="deepseek-model"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={settings.deepseekModel || DEEPSEEK_MODELS[0].id}
            onChange={(e) => onSettingsChange({ deepseekModel: e.target.value })}
          >
            {DEEPSEEK_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* OpenAI */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">OpenAI</Label>
          <span className="text-xs text-muted-foreground">GPT-4 Turbo</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="openai-key" className="text-sm">
            API密钥
          </Label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={settings.openaiApiKey || ''}
            onChange={(e) => onSettingsChange({ openaiApiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            从 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a> 获取密钥
          </p>
        </div>
      </div>

      {/* OpenRouter */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">OpenRouter</Label>
          <span className="text-xs text-muted-foreground">支持多个模型</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="openrouter-key" className="text-sm">
            API密钥
          </Label>
          <Input
            id="openrouter-key"
            type="password"
            placeholder="sk-or-..."
            value={settings.openrouterApiKey || ''}
            onChange={(e) => onSettingsChange({ openrouterApiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            从 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a> 获取密钥
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="openrouter-model" className="text-sm">
            模型
          </Label>
          <select
            id="openrouter-model"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={settings.openrouterModel || OPENROUTER_MODELS[0].id}
            onChange={(e) => onSettingsChange({ openrouterModel: e.target.value })}
          >
            {OPENROUTER_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ollama */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Ollama</Label>
            <p className="text-xs text-muted-foreground mt-1">
              本地模型,完全免费和离线
            </p>
          </div>
          <Switch
            checked={settings.useOllama || false}
            onCheckedChange={(checked: boolean) => onSettingsChange({ useOllama: checked })}
          />
        </div>
        {settings.useOllama && (
          <div className="space-y-2">
            <Label htmlFor="ollama-model" className="text-sm">
              模型
            </Label>
            <select
              id="ollama-model"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={settings.ollamaModel || OLLAMA_MODELS[0].id}
              onChange={(e) => onSettingsChange({ ollamaModel: e.target.value })}
            >
              {OLLAMA_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              需要先安装Ollama: <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ollama.ai</a>
            </p>
          </div>
        )}
      </div>

      {/* 优先级说明 */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium mb-2">AI提供商优先级</h4>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>DeepSeek (如果配置) - 推荐,性价比最高</li>
          <li>OpenAI (如果配置)</li>
          <li>OpenRouter (如果配置)</li>
          <li>Ollama (如果启用)</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-2">
          系统会按顺序尝试每个提供商,直到成功。如果所有提供商都失败,将使用OCR原文。
        </p>
      </div>
    </div>
  )
}

