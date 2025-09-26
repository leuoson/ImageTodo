import { invoke } from "@tauri-apps/api/core";

import type { TodoCollection } from "@/types";

const STORAGE_KEY = "imagetodo.todos" as const;

const isTauri = typeof window !== "undefined" && "__TAURI_IPC__" in window;

const readFromLocal = (): Promise<TodoCollection> => {
  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return Promise.resolve([]);
    }

    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Promise.resolve(parsed as TodoCollection);
    }
  } catch (error) {
    console.warn("Failed to parse local todos", error);
  }

  return Promise.resolve([]);
};

const writeToLocal = (todos: TodoCollection) => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return Promise.resolve();
};

const clearLocal = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  window.localStorage.removeItem(STORAGE_KEY);
  return Promise.resolve();
};

export const todoStorage = {
  async load(): Promise<TodoCollection> {
    if (!isTauri) {
      return readFromLocal();
    }

    try {
      const todos = await invoke<TodoCollection>("load_todos");
      return todos;
    } catch (error) {
      console.error("Failed to load todos from Tauri storage", error);
      return [];
    }
  },

  async save(todos: TodoCollection): Promise<void> {
    if (!isTauri) {
      await writeToLocal(todos);
      return;
    }

    const serialisable = todos.map((todo) => ({ ...todo }));
    await invoke("save_todos", { todos: serialisable });
  },

  async reset(): Promise<void> {
    if (!isTauri) {
      await clearLocal();
      return;
    }

    await invoke("save_todos", { todos: [] });
  },
};

export type TodoStorage = typeof todoStorage;
