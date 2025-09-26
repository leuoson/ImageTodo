import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/layout";
import { renderWithProviders } from "@/test/helpers/render";

describe("AppShell", () => {
  it("renders title and content", () => {
    renderWithProviders(
      <AppShell title="ImageTodo" subtitle="Subtitle">
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole("group", { name: /ImageTodo/ })).toBeVisible();
    expect(screen.getByText("Subtitle")).toBeVisible();
    expect(screen.getByText("Content")).toBeVisible();
  });

  it("omits subtitle block when not provided", () => {
    renderWithProviders(
      <AppShell title="ImageTodo">
        <span aria-label="shell body">Body</span>
      </AppShell>,
    );

    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.getByLabelText("ImageTodo content")).toBeInTheDocument();
  });
});
