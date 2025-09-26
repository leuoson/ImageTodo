import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui";
import styles from "@/components/ui/Button/Button.module.css";
import { renderWithProviders } from "@/test/helpers/render";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

describe("Button", () => {
  it("renders with primary variant by default", () => {
    renderWithProviders(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeEnabled();
    expect(button).toHaveClass(classOf("button"));
    expect(button).toHaveClass(classOf("primary"));
  });

  it("supports variant, size, and fullWidth props", () => {
    renderWithProviders(
      <Button variant="danger" size="large" fullWidth>
        Delete
      </Button>,
    );

    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass(classOf("danger"));
    expect(button).toHaveClass(classOf("large"));
    expect(button).toHaveClass(classOf("fullWidth"));
  });

  it("invokes onClick handler when clicked", () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Submit</Button>);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders icon in the requested position", () => {
    const Icon = () => <span data-testid="icon">*</span>;
    renderWithProviders(
      <Button icon={<Icon />} iconPosition="trailing">
        Star
      </Button>,
    );

    const button = screen.getByRole("button", { name: /star/i });
    const icon = screen.getByTestId("icon");
    expect(button.lastElementChild).toBe(icon);
  });

  it("renders icon-only variant when no children are provided", () => {
    const Icon = () => <span data-testid="icon">*</span>;
    renderWithProviders(<Button aria-label="Icon only" icon={<Icon />} />);

    const button = screen.getByRole("button", { name: /icon only/i });
    expect(button).toHaveClass(classOf("iconOnly"));
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
