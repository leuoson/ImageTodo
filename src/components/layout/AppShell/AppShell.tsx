import type { ReactNode } from "react";

import styles from "./AppShell.module.css";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

const WINDOW_TITLE_ID = "app-shell-title";

export interface AppShellProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
}

export const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  return (
    <div className={classOf("shell")} role="group" aria-labelledby={WINDOW_TITLE_ID}>
      <header className={classOf("header")}>
        <div className={classOf("titleRow")}>
          <h1 id={WINDOW_TITLE_ID} className={classOf("title")}>
            {title}
          </h1>
          {subtitle ? <p className={classOf("subtitle")}>{subtitle}</p> : null}
        </div>
      </header>

      <main className={classOf("content")} role="main" aria-label={`${title} content`}>
        {children}
      </main>
    </div>
  );
};

export default AppShell;
