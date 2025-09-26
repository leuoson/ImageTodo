import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { TodoList } from "@/components/features";
import { getTodoStoreState, resetTodoStoreState } from "@/stores";
import { renderWithProviders } from "@/test/helpers/render";

beforeEach(async () => {
  await resetTodoStoreState();
  localStorage.clear();
});

const renderTodoList = async () => {
  renderWithProviders(<TodoList />);
  await waitFor(() => expect(getTodoStoreState().hydrated).toBe(true));
};

describe("TodoList", () => {
  it("shows a single editable row on load", async () => {
    await renderTodoList();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(1);
    expect(screen.getByPlaceholderText("输入任务内容")).toBeVisible();
  });

  it("creates a new row when the last row is clicked", async () => {
    await renderTodoList();

    fireEvent.click(screen.getByRole("row"));

    expect(getTodoStoreState().todos).toHaveLength(2);
  });

  it("also creates a new row when clicking the last input", async () => {
    await renderTodoList();

    fireEvent.click(screen.getByPlaceholderText("输入任务内容"));

    expect(getTodoStoreState().todos).toHaveLength(2);
  });

  it("toggles status using the circle control", async () => {
    await renderTodoList();

    fireEvent.click(screen.getByRole("button", { name: /切换任务/ }));

    expect(getTodoStoreState().todos[0]?.status).toBe("doing");
  });

  it("updates title as the user types", async () => {
    await renderTodoList();

    const input = screen.getByPlaceholderText("输入任务内容");
    fireEvent.change(input, { target: { value: "新任务" } });

    expect(getTodoStoreState().todos[0]?.title).toBe("新任务");
  });

  it("focuses the newly added row after clicking the last row", async () => {
    await renderTodoList();

    fireEvent.click(screen.getByRole("row"));

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText("输入任务内容");
      expect(inputs[inputs.length - 1]).toHaveFocus();
    });
  });

  it("removes a row when clicking the delete control", async () => {
    await renderTodoList();

    fireEvent.click(screen.getByRole("row"));

    const rows = screen.getByRole("row");
    const firstRow = rows[0] as HTMLElement | undefined;
    expect(firstRow).toBeInTheDocument();
    fireEvent.mouseEnter(firstRow as HTMLElement);
    const deleteButton = within(firstRow as HTMLElement).getByRole("button", {
      name: "删除任务 （未命名）",
    });
    fireEvent.click(deleteButton);

    expect(getTodoStoreState().todos).toHaveLength(1);
  });
});
