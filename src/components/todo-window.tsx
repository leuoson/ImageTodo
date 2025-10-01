import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Grid3x3, Settings, ChevronLeft, ChevronRight, Minimize2, Trash2, MoreVertical, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { type Locale, useTranslation } from "@/lib/i18n"
import type { Todo } from "@/lib/types"
import { load } from '@tauri-apps/plugin-store'

interface TodoWindowProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function TodoWindow({ locale, onLocaleChange }: TodoWindowProps) {
  const t = useTranslation(locale)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [sidebarVisible, setSidebarVisible] = useState(false)

  // Load todos from Tauri store on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const store = await load('todos.json', { autoSave: true })
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

  // Save todos to Tauri store whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        const store = await load('todos.json', { autoSave: true })
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

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
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

  return (
    <div className="h-screen w-screen bg-card flex overflow-hidden">
      {/* Main Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Window Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors"
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
              onClick={() => onLocaleChange(locale === "en" ? "zh-CN" : "en")}
            >
              <Settings className="h-4 w-4" />
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
              <div key={todo.id} className="flex items-center gap-3 group">
                <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="h-5 w-5" />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? "line-through text-muted-foreground" : "text-card-foreground"
                  }`}
                >
                  {todo.text}
                </span>
              </div>
            ))}

            {/* Add New Todo Input */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
              <Input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.addTodo}
                className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {todos.length === 0 && !newTodoText && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">{t.emptyState}</div>
          )}
        </div>
      </div>

      {sidebarVisible && (
        <div className="w-12 bg-card border-l border-border/50 flex flex-col items-center py-4 gap-3 animate-in slide-in-from-right duration-200">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onLocaleChange(locale === "en" ? "zh-CN" : "en")}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pin className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={deleteCompleted}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

