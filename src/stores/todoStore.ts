import { create } from "zustand";

import { todoStorage } from "@/services/todoStorage";
import type {
  IsoDateString,
  TodoCollection,
  TodoId,
  TodoItem,
  TodoStatus,
} from "@/types";
import { createTodoId } from "@/utils/id";

export interface TodoStoreState {
  readonly todos: TodoCollection;
  readonly error: string | null;
  readonly loading: boolean;
  readonly hydrated: boolean;
}

export interface TodoStoreActions {
  readonly loadTodos: () => Promise<void>;
  readonly addTodo: (title?: string) => TodoItem;
  readonly toggleStatus: (todoId: TodoId) => void;
  readonly updateTitle: (todoId: TodoId, title: string) => void;
  readonly deleteTodo: (todoId: TodoId) => void;
  readonly clearError: () => void;
  readonly reset: () => Promise<void>;
}

export type TodoStore = TodoStoreState & TodoStoreActions;

const now = (): IsoDateString => new Date().toISOString() as IsoDateString;

const cycleStatus = (status: TodoStatus): TodoStatus => {
  switch (status) {
    case "todo":
      return "doing";
    case "doing":
      return "done";
    case "done":
    default:
      return "todo";
  }
};

const createTodo = (title = ""): TodoItem => ({
  id: createTodoId(),
  title,
  status: "todo",
  createdAt: now(),
  updatedAt: now(),
});

const defaultState: TodoStoreState = {
  todos: [createTodo()],
  error: null,
  loading: false,
  hydrated: false,
};

export const useTodoStore = create<TodoStore>()((set, get) => {
  const persistTodos = (todos: TodoCollection) => {
    void todoStorage.save(todos).catch((error) => {
      const message = error instanceof Error ? error.message : "保存任务失败";
      set({ error: message });
    });
  };

  const ensureEditableRow = (todos: TodoCollection): TodoCollection => {
    return todos.length > 0 ? todos : [createTodo()];
  };

  return {
    ...defaultState,
    async loadTodos() {
      if (get().hydrated) {
        return;
      }

      set({ loading: true });
      try {
        const todos = await todoStorage.load();
        const nextTodos = ensureEditableRow(todos);
        set({ todos: nextTodos, loading: false, error: null, hydrated: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "加载任务失败";
        set({ error: message, loading: false, hydrated: true });
      }
    },
    addTodo(rawTitle = "") {
      const title = rawTitle.trim();
      const nextTodo = createTodo(title);

      set((state) => {
        const todos = [...state.todos, nextTodo];
        persistTodos(todos);
        return {
          todos,
          error: null,
        };
      });

      return nextTodo;
    },
    toggleStatus(todoId) {
      set((state) => {
        const todos = state.todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                status: cycleStatus(todo.status),
                updatedAt: now(),
              }
            : todo,
        );
        persistTodos(todos);
        return {
          todos,
          error: null,
        };
      });
    },
    updateTitle(todoId, rawTitle) {
      const title = rawTitle.trimStart();
      set((state) => {
        const todos = state.todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                title,
                updatedAt: now(),
              }
            : todo,
        );
        persistTodos(todos);
        return {
          todos,
          error: null,
        };
      });
    },
    deleteTodo(todoId) {
      set((state) => {
        const remaining = state.todos.filter((todo) => todo.id !== todoId);
        const todos = ensureEditableRow(remaining);
        persistTodos(todos);
        return {
          todos,
          error: null,
        };
      });
    },
    clearError() {
      set({ error: null });
    },
    async reset() {
      set({ ...defaultState });
      await todoStorage.reset();
    },
  };
});

export const getTodoStoreState = () => useTodoStore.getState();

export const resetTodoStoreState = async () => {
  useTodoStore.setState({ ...defaultState });
  await todoStorage.reset();
};
