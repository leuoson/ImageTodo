/**
 * AI模型列表
 * 注意: 用于文本总结,不是Vision模型
 * https://openrouter.ai/models
 */

export interface AIModel {
  id: string
  name: string
  description?: string
}

export const DEEPSEEK_MODELS: AIModel[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: '性价比极高,中文优秀'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: '代码理解和生成专用'
  }
]

export const OPENROUTER_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: '最强文本理解和总结能力'
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'OpenAI最新模型,性价比高'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Google的高性能模型'
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Meta开源模型,性能优秀'
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    description: 'Mistral最强模型'
  }
]

export const OLLAMA_MODELS: AIModel[] = [
  {
    id: 'llama3.1',
    name: 'Llama 3.1 (8B)',
    description: '本地运行,速度快'
  },
  {
    id: 'llama3.1:70b',
    name: 'Llama 3.1 (70B)',
    description: '本地运行,性能强'
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    description: '阿里开源模型,中文优秀'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: '轻量级模型'
  }
]

