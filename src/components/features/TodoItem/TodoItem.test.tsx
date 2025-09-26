import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TodoItem } from "@/components/features";
import { renderWithProviders } from "@/test/helpers/render";
import type { IsoDateString, TodoItem as TodoItemType } from "@/types";
import { createTodoId } from "@/utils/id";

const timestamp = new Date().toISOString() as IsoDateString;
const baseTodo: TodoItemType = {
  id: createTodoId(),
  title: "Sample",
  status: "todo",
  createdAt: timestamp,
  updatedAt: timestamp,
};

describe("TodoItem", () => {
  it("invokes callbacks for toggle and title change", () => {
    const onToggle = vi.fn();
    const onTitleChange = vi.fn();
    const onRequestNewRow = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <TodoItem
        todo={baseTodo}
        isLast
        onToggle={onToggle}
        onTitleChange={onTitleChange}
        onRequestNewRow={onRequestNewRow}
        onDelete={onDelete}
        registerInput={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /切换任务 Sample 状态/ }));
    expect(onToggle).toHaveBeenCalledWith(baseTodo.id);

    const input = screen.getByLabelText("编辑任务 Sample");
    fireEvent.change(input, { target: { value: "Updated" } });
    expect(onTitleChange).toHaveBeenCalledWith(baseTodo.id, "Updated");

    fireEvent.mouseEnter(screen.getByRole("row"));
    fireEvent.click(screen.getByRole("button", { name: "删除任务 Sample" }));
    expect(onDelete).toHaveBeenCalledWith(baseTodo.id);
  });

  it("requests a new row when clicking the last row container", () => {
    const onRequestNewRow = vi.fn();

    renderWithProviders(
      <TodoItem
        todo={baseTodo}
        isLast
        onToggle={() => undefined}
        onTitleChange={() => undefined}
        onRequestNewRow={onRequestNewRow}
        onDelete={() => undefined}
        registerInput={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("row"));
    expect(onRequestNewRow).toHaveBeenCalled();
  });
});
