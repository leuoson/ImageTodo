import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./Button.module.css";

const classes = {
  button: styles["button"],
  primary: styles["primary"],
  secondary: styles["secondary"],
  danger: styles["danger"],
  small: styles["small"],
  large: styles["large"],
  fullWidth: styles["fullWidth"],
  iconOnly: styles["iconOnly"],
};

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly icon?: ReactNode;
  readonly iconPosition?: "leading" | "trailing";
}

export const Button = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  icon,
  iconPosition = "leading",
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) => {
  const classNames = [
    classes.button,
    classes[variant],
    size !== "medium" ? classes[size] : "",
    fullWidth ? classes.fullWidth : "",
    icon && !children ? classes.iconOnly : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classNames} {...rest}>
      {icon && iconPosition === "leading" ? icon : null}
      {children}
      {icon && iconPosition === "trailing" ? icon : null}
    </button>
  );
};

export default Button;
