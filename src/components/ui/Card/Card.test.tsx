import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "@/components/ui";
import styles from "@/components/ui/Card/Card.module.css";
import { renderWithProviders } from "@/test/helpers/render";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

describe("Card", () => {
  it("renders children and honours padding option", () => {
    renderWithProviders(
      <Card data-testid="card" padding="none">
        <span>Content</span>
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass(classOf("card"));
    expect(card).toHaveClass(classOf("paddingNone"));
  });

  it("renders as the requested element", () => {
    renderWithProviders(
      <Card data-testid="article" as="article">
        <p>Article content</p>
      </Card>,
    );

    const card = screen.getByTestId("article").closest("article");
    expect(card).toBeInTheDocument();
  });
});
