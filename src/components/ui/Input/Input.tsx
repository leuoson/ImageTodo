import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./Input.module.css";

const classes = {
  wrapper: styles["wrapper"],
  label: styles["label"],
  field: styles["field"],
  helperText: styles["helperText"],
  errorState: styles["errorState"],
  successState: styles["successState"],
  errorMessage: styles["errorMessage"],
  successMessage: styles["successMessage"],
};

export type InputValidationState = "default" | "error" | "success";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: ReactNode;
  readonly helperText?: ReactNode;
  readonly validationState?: InputValidationState;
}

export const Input = ({
  id,
  label,
  helperText,
  validationState = "default",
  className = "",
  ...rest
}: InputProps) => {
  const inputId = id ?? rest.name ?? `input-${Math.random().toString(36).slice(2, 8)}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const messageClass =
    validationState === "error"
      ? classes.errorMessage
      : validationState === "success"
        ? classes.successMessage
        : undefined;

  const fieldClasses = [
    classes.field,
    validationState === "error" ? classes.errorState : "",
    validationState === "success" ? classes.successState : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes.wrapper}>
      {label ? (
        <label className={classes.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={fieldClasses}
        aria-invalid={validationState === "error"}
        aria-describedby={helperId}
        {...rest}
      />

      {helperText ? (
        <p
          id={helperId}
          className={[classes.helperText, messageClass].filter(Boolean).join(" ")}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
