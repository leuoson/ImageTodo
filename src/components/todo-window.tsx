import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Grid3x3, Settings, ChevronLeft, Minimize2, Trash2, MoreVertical, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { type Locale, useTranslation } from "@/lib/i18n"
import type { Todo } from "@/lib/types"
import { Store } from "@tauri-apps/plugin-store"

interface TodoWindowProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function TodoWindow({ locale, onLocaleChange }: TodoWindowProps) {
  const t = useTranslation(locale)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [store, setStore] = useState<Store | null>(null)

  // Initialize store and load todos
  useEffect(() => {
    const initStore = async () => {
      try {
        const storeInstance = await Store.load("todos.json")
        setStore(storeInstance)

        // Load existing todos
        const savedTodos = await storeInstance.get<Todo[]>("todos")
        if (savedTodos) {
          setTodos(savedTodos)
        }
      } catch (error) {
        console.error("Failed to initialize store:", error)
      }
    }

    initStore()
  }, [])

  // Save todos whenever they change
  useEffect(() => {
    if (store && todos.length >= 0) {
      store.set("todos", todos).catch((error) => {
        console.error("Failed to save todos:", error)
      })
    }
  }, [todos, store])

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

  return (
    <div className="relative w-full max-w-md">
      {/* Main Window */}
      <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Window Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
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
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Todo List */}
        <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
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

      {/* Sidebar Toolbar */}
      <div className="absolute -right-14 top-0 flex flex-col gap-2 bg-card/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onLocaleChange(locale === "en" ? "zh-CN" : "en")}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Pin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={deleteCompleted}
          disabled={!todos.some((t) => t.completed)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

