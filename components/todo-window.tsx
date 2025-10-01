"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Grid3x3, Settings, ChevronLeft, ChevronRight, Minimize2, Trash2, MoreVertical, Pin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const storeRef = useRef<Store | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 保存到 Store 的函数
  const saveTodos = useCallback(async (todosToSave: Todo[]) => {
    try {
      if (storeRef.current) {
        await storeRef.current.set("todos", todosToSave)
        await storeRef.current.save()
      }
    } catch (error) {
      console.error("Failed to save todos:", error)
    }
  }, [])

  // 初始化 Store 并加载数据
  useEffect(() => {
    const initStore = async () => {
      try {
        const store = await Store.load("todos.json")
        storeRef.current = store

        // 加载已保存的 todos
        const savedTodos = await store.get<Todo[]>("todos")
        if (savedTodos && Array.isArray(savedTodos)) {
          setTodos(savedTodos)
        }
      } catch (error) {
        console.error("Failed to initialize store:", error)
      }
    }

    initStore()
  }, [])

  // 防抖保存：只在 todos 变化后延迟保存
  useEffect(() => {
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 设置新的定时器
    saveTimeoutRef.current = setTimeout(() => {
      if (todos.length > 0 || storeRef.current) {
        saveTodos(todos)
      }
    }, 500)

    // 清理函数
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [todos, saveTodos])

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

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.createdAt - b.createdAt
    }
    return a.completed ? 1 : -1
  })

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
          <motion.div className="space-y-3" layout>
            <AnimatePresence mode="popLayout">
              {sortedTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="flex items-center gap-3 group"
                >
                  <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="h-5 w-5" />
                  <span
                    className={`flex-1 text-sm transition-all duration-200 ${
                      todo.completed ? "line-through text-muted-foreground" : "text-card-foreground"
                    }`}
                  >
                    {todo.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

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
          </motion.div>

          {todos.length === 0 && !newTodoText && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">{t.emptyState}</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sidebarVisible && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-12 bg-card border-l border-border/50 flex flex-col items-center py-4 gap-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
