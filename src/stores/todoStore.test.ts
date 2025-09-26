import { beforeEach, describe, expect, it } from "vitest";

import { todoStorage } from "@/services/todoStorage";
import { getTodoStoreState, resetTodoStoreState, useTodoStore } from "@/stores/todoStore";
import type { IsoDateString } from "@/types";
import { createTodoId } from "@/utils/id";

beforeEach(async () => {
  await resetTodoStoreState();
  localStorage.clear();
});

describe("todoStore", () => {
  it("starts with a single empty row", () => {
    const { todos } = getTodoStoreState();
    expect(todos).toHaveLength(1);
    expect(todos[0]?.title).toBe("");
  });

  it("adds todos and returns the created item", () => {
    const todo = useTodoStore.getState().addTodo("计划 A");

    const state = getTodoStoreState();
    expect(state.todos).toHaveLength(2);
    expect(state.todos[1]).toEqual(todo);
  });

  it("cycles status for a todo", () => {
    const state = useTodoStore.getState();
    const todo = state.todos[0]!;
    state.toggleStatus(todo.id);

    expect(getTodoStoreState().todos[0]?.status).toBe("doing");
  });

  it("updates title without trimming whitespace from the middle", () => {
    const state = useTodoStore.getState();
    const todo = state.todos[0]!;

    state.updateTitle(todo.id, "  新  标题  ");

    expect(getTodoStoreState().todos[0]?.title).toBe("新  标题  ");
  });

  it("removes todos", () => {
    const created = useTodoStore.getState().addTodo("删除我");

    useTodoStore.getState().deleteTodo(created.id);

    const state = getTodoStoreState();
    expect(state.todos.find((todo) => todo.id === created.id)).toBeUndefined();
    expect(state.todos).toHaveLength(1);
  });

  it("loads todos from storage and marks hydration", async () => {
    const now = new Date().toISOString() as IsoDateString;
    await todoStorage.save([
      {
        id: createTodoId(),
        title: "已保存",
        status: "doing",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await useTodoStore.getState().loadTodos();

    const state = getTodoStoreState();
    expect(state.hydrated).toBe(true);
    expect(state.todos[0]?.title).toBe("已保存");
  });
});
