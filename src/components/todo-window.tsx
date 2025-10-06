import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Plus, Grid3x3, Settings as SettingsIcon, ChevronLeft, ChevronRight, Minimize2, Trash2, MoreVertical, Pin, Image, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { SettingsPopup } from "@/components/settings-popup"
import { ImageViewDialog } from "@/components/image-view-dialog"
import { type Locale, useTranslation } from "@/lib/i18n"
import { loadSettings, saveSettings, type Settings } from "@/lib/settings"
import type { Todo } from "@/lib/types"
import { load } from '@tauri-apps/plugin-store'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'

interface TodoWindowProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function TodoWindow({ locale, onLocaleChange }: TodoWindowProps) {
  const t = useTranslation(locale)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false) // 窗口固定状态
  const [settings, setSettings] = useState<Settings>({
    locale,
    regionCaptureShortcut: "Alt+Shift+P"
  })

  // 图像处理相关状态
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [imageProcessingProgress, setImageProcessingProgress] = useState<string>('')
  const [selectedImageTodo, setSelectedImageTodo] = useState<Todo | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  // Load todos from Tauri store on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const store = await load('todos.json', { autoSave: true, defaults: {} })
        const savedTodos = await store.get<Todo[]>('todos')
        if (savedTodos) {
          setTodos(savedTodos)
        }
      } catch (error) {
        console.error('Failed to load todos:', error)
      }
    }
    loadTodos()
  }, [])

  // Load settings and initialize shortcuts on mount
  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const loadedSettings = await loadSettings()
        setSettings(loadedSettings)
        console.log('Settings loaded:', loadedSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadAppSettings()
  }, [])

  // Save todos to Tauri store whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        const store = await load('todos.json', { autoSave: true, defaults: {} })
        await store.set('todos', todos)
        await store.save()
      } catch (error) {
        console.error('Failed to save todos:', error)
      }
    }
    if (todos.length > 0 || todos.length === 0) {
      saveTodos()
    }
  }, [todos])

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        createdAt: Date.now(),
      }
      setTodos([...todos, newTodo])
      setNewTodoText("")
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleSettingsChange = async (updates: Partial<Settings>) => {
    try {
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)
      await saveSettings(newSettings)

      // If locale changed, update parent
      if (updates.locale && updates.locale !== locale) {
        onLocaleChange(updates.locale)
      }

      toast.success(t.settingsSaved || '设置已保存')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(t.settingsSaveError || '保存设置失败')

      // Revert on error
      try {
        const revertedSettings = await loadSettings()
        setSettings(revertedSettings)
      } catch (loadError) {
        console.error('Failed to revert settings:', loadError)
      }
    }
  }

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    // 检查是否有图像
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        await handleImagePaste()
        return
      }
    }
  }

  // 处理图像粘贴
  const handleImagePaste = async () => {
    try {
      setIsProcessingImage(true)
      setImageProcessingProgress('正在读取剪贴板...')

      // 1. 从剪贴板读取图像
      const imageData = await invoke<{ bytes: number[], width: number, height: number }>('read_clipboard_image')

      // 2. 生成待办事项ID
      const todoId = Date.now().toString()

      setImageProcessingProgress('正在保存图像...')

      // 3. 保存图像
      const imagePath = await invoke<string>('save_image', {
        imageData: imageData.bytes,
        width: imageData.width,
        height: imageData.height,
        todoId
      })

      setImageProcessingProgress('正在识别文字...')

      // 4. OCR处理图像
      const ocrResult = await invoke<{ text: string, confidence: number, language: string }>('process_image_ocr', {
        imagePath
      })

      setImageProcessingProgress('正在生成摘要...')

      // 5. 尝试AI总结
      let summary = ''
      let method: 'ocr' | 'ai' = 'ocr'
      let aiFailed = false

      try {
        const aiSummary = await invoke<string>('summarize_text_multi_provider', {
          text: ocrResult.text,
          locale
        })
        summary = aiSummary
        method = 'ai'
      } catch (aiError) {
        console.log('AI summarization failed:', aiError)
        // AI失败,文本留空,显示警告
        aiFailed = true
        toast.error('AI处理失败,请配置AI提供商或查看图像中的OCR文本')
      }

      // 6. 创建待办事项
      const newTodo: Todo = {
        id: todoId,
        text: summary, // AI失败时为空字符串
        completed: false,
        createdAt: Date.now(),
        hasImage: true,
        imagePath,
        imageProcessingMethod: method,
        originalImageText: ocrResult.text,
        aiFailed // 新增字段标记AI失败
      }

      const updatedTodos = [...todos, newTodo]
      setTodos(updatedTodos)

      // 保存到store
      const store = await load('todos.json', { autoSave: true, defaults: {} })
      await store.set('todos', updatedTodos)
      await store.save()

      toast.success('图像待办事项已创建')

    } catch (error) {
      console.error('Image processing failed:', error)
      toast.error(`图像处理失败: ${error}`)
    } finally {
      setIsProcessingImage(false)
      setImageProcessingProgress('')
    }
  }

  // 处理待办事项点击
  const handleTodoClick = (todo: Todo) => {
    if (todo.hasImage) {
      setSelectedImageTodo(todo)
      setIsImageDialogOpen(true)
    }
  }

  const handleClose = async () => {
    try {
      await getCurrentWindow().close()
    } catch (error) {
      console.error('Failed to close window:', error)
    }
  }

  // 切换窗口固定状态
  const togglePin = async () => {
    try {
      console.log('🔥 开始切换固定状态, 当前状态:', isPinned)
      const currentWindow = getCurrentWindow()
      console.log('🔥 获取到窗口对象:', currentWindow)

      const newPinnedState = !isPinned
      console.log('🔥 将要设置的状态:', newPinnedState)

      if (newPinnedState) {
        // 固定窗口：始终置底，禁用拖动，禁用最小化
        console.log('🔥 设置置底...')
        await currentWindow.setAlwaysOnBottom(true)
        console.log('🔥 设置不可缩放...')
        await currentWindow.setResizable(false)
        // 隐藏最小化按钮的效果通过移除该按钮实现
        toast.success('窗口已固定')
      } else {
        // 取消固定：取消置底，启用拖动，启用最小化
        console.log('🔥 取消置底...')
        await currentWindow.setAlwaysOnBottom(false)
        console.log('🔥 设置可缩放...')
        await currentWindow.setResizable(true)
        toast.success('窗口已取消固定')
      }

      console.log('🔥 更新状态...')
      setIsPinned(newPinnedState)
      console.log('🔥 固定状态切换完成')
    } catch (error) {
      console.error('🔥 Failed to toggle pin - 详细错误:', error)
      console.error('🔥 错误类型:', typeof error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : 'No stack'
      console.error('🔥 错误消息:', errorMessage)
      console.error('🔥 错误堆栈:', errorStack)
      toast.error(`切换固定状态失败: ${errorMessage}`)
    }
  }

  return (
    <div className="h-screen w-screen bg-card flex overflow-hidden rounded-xl">
      {/* Main Window */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-xl">
        {/* Window Controls */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0 rounded-t-xl bg-card"
          {...(!isPinned && { 'data-tauri-drag-region': true })}
        >
          <div className="flex items-center gap-2">
            <button
              className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
              onClick={handleClose}
              aria-label="Close"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addTodo}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleOpenSettings}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isPinned ? 'text-primary bg-primary/10' : ''}`}
              onClick={togglePin}
              title={isPinned ? '取消固定窗口' : '固定窗口'}
            >
              <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar}>
            {sidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Todo List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 group ${todo.hasImage ? 'cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2 py-1' : ''}`}
                onClick={() => handleTodoClick(todo)}
              >
                <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="h-5 w-5" />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? "line-through text-muted-foreground" :
                    todo.aiFailed ? "text-muted-foreground italic" : "text-card-foreground"
                  }`}
                >
                  {todo.text || (todo.aiFailed ? '(AI处理失败,点击查看图像)' : '')}
                </span>
                {todo.hasImage && (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                {todo.aiFailed && (
                  <div title="AI处理失败">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Add New Todo Input */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
              <div className="flex-1">
                <Input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onPaste={handlePaste}
                  placeholder={t.addTodo}
                  className="border-0 bg-transparent px-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50"
                  disabled={isProcessingImage}
                />
                {isProcessingImage && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {imageProcessingProgress}
                  </div>
                )}
              </div>
            </div>
          </div>

          {todos.length === 0 && !newTodoText && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">{t.emptyState}</div>
          )}
        </div>
      </div>

      {sidebarVisible && (
        <div className="w-12 bg-card border-l border-border/50 flex flex-col items-center py-4 gap-3 animate-in slide-in-from-right duration-200">
          {!isPinned && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleOpenSettings}
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={deleteCompleted}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Settings Popup */}
      <SettingsPopup
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Image View Dialog */}
      <ImageViewDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        todo={selectedImageTodo}
        locale={locale}
      />
    </div>
  )
}

