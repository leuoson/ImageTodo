import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Card.module.css";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

export type CardElement = "section" | "article" | "div";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly as?: CardElement;
  readonly padding?: "default" | "none";
  readonly className?: string;
}

const buildClassName = (
  padding: CardProps["padding"],
  className: CardProps["className"],
) =>
  [classOf("card"), padding === "none" ? classOf("paddingNone") : "", className]
    .filter(Boolean)
    .join(" ");

export const Card = ({
  as = "section",
  padding = "default",
  className = "",
  children,
  ...rest
}: CardProps) => {
  const combined = buildClassName(padding, className);

  if (as === "article") {
    return (
      <article className={combined} {...rest}>
        {children}
      </article>
    );
  }

  if (as === "div") {
    return (
      <div className={combined} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <section className={combined} {...rest}>
      {children}
    </section>
  );
};

export default Card;
