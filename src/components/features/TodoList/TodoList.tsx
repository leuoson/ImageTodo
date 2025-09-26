import { useEffect, useMemo, useRef, useState } from "react";

import { TodoItem } from "@/components/features";
import { useTodoStore } from "@/stores";
import type { TodoId } from "@/types";

import styles from "./TodoList.module.css";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

type InputRegistry = Record<TodoId, HTMLInputElement | null>;

export const TodoList = () => {
  const { todos, toggleStatus, updateTitle, addTodo, deleteTodo, loadTodos, hydrated } =
    useTodoStore();
  const [pendingFocusId, setPendingFocusId] = useState<TodoId | null>(null);
  const inputRefs = useRef<InputRegistry>({} as InputRegistry);

  useEffect(() => {
    if (!hydrated) {
      void loadTodos();
    }
  }, [hydrated, loadTodos]);

  useEffect(() => {
    if (!pendingFocusId) {
      return;
    }

    const target = inputRefs.current[pendingFocusId];
    if (target) {
      target.focus();
      target.select();
      setPendingFocusId(null);
    }
  }, [pendingFocusId, todos]);

  const handleRegisterInput = (todoId: TodoId) => (element: HTMLInputElement | null) => {
    inputRefs.current[todoId] = element;
  };

  const handleRequestNewRow = () => {
    const next = addTodo();
    setPendingFocusId(next.id);
  };

  const lastTodoId = useMemo(() => todos[todos.length - 1]?.id ?? null, [todos]);

  return (
    <div className={classOf("table")} role="grid" aria-label="Todo 列表">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLast={todo.id === lastTodoId}
          onToggle={toggleStatus}
          onTitleChange={updateTitle}
          onRequestNewRow={handleRequestNewRow}
          onDelete={deleteTodo}
          registerInput={handleRegisterInput(todo.id)}
        />
      ))}
    </div>
  );
};

export default TodoList;
