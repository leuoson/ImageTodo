import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui";
import styles from "@/components/ui/Input/Input.module.css";
import { renderWithProviders } from "@/test/helpers/render";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

describe("Input", () => {
  it("associates label and helper text", () => {
    renderWithProviders(<Input label="Name" helperText="Helper" name="name" />);

    const input = screen.getByLabelText("Name");
    expect(input).toBeInTheDocument();
    const helper = screen.getByText("Helper");
    expect(helper).toHaveAttribute("id", `${input.id}-helper`);
    expect(helper).toHaveClass(classOf("helperText"));
  });

  it("applies error styling and aria attributes", () => {
    renderWithProviders(
      <Input label="Email" validationState="error" helperText="Required" />,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass(classOf("errorState"));
    expect(screen.getByText("Required")).toHaveClass(classOf("errorMessage"));
  });

  it("applies success styling and omits helper block when absent", () => {
    renderWithProviders(<Input label="Project" validationState="success" />);

    const input = screen.getByLabelText("Project");
    expect(input).toHaveClass(classOf("successState"));
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByText(/helper/i)).not.toBeInTheDocument();
  });
});
