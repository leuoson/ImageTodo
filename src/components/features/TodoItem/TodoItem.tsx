import { CheckCircle, Circle, CircleHalf, TrashSimple } from "phosphor-react";
import { useCallback } from "react";

import type { TodoId, TodoItem as TodoItemType } from "@/types";

import styles from "./TodoItem.module.css";

const classes = styles as Record<string, string>;
const classOf = (name: string) => classes[name] ?? "";

const STATUS_LABELS: Record<TodoItemType["status"], string> = {
  todo: "未开始",
  doing: "进行中",
  done: "已完成",
};

const STATUS_ICONS: Record<TodoItemType["status"], typeof Circle> = {
  todo: Circle,
  doing: CircleHalf,
  done: CheckCircle,
};

export interface TodoItemProps {
  readonly todo: TodoItemType;
  readonly isLast: boolean;
  readonly onToggle: (id: TodoId) => void;
  readonly onTitleChange: (id: TodoId, title: string) => void;
  readonly onRequestNewRow: () => void;
  readonly onDelete: (id: TodoId) => void;
  readonly registerInput: (element: HTMLInputElement | null) => void;
}

export const TodoItem = ({
  todo,
  isLast,
  onToggle,
  onTitleChange,
  onRequestNewRow,
  onDelete,
  registerInput,
}: TodoItemProps) => {
  const statusLabel = STATUS_LABELS[todo.status];
  const StatusIcon = STATUS_ICONS[todo.status];

  const handleRowClick = useCallback(() => {
    if (isLast) {
      onRequestNewRow();
    }
  }, [isLast, onRequestNewRow]);

  return (
    <div
      className={classOf("row")}
      role="row"
      aria-label={`任务 ${todo.title || "（未命名）"}`}
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (!isLast) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRequestNewRow();
        }
      }}
    >
      <button
        type="button"
        className={[classOf("statusButton"), classOf(`status-${todo.status}`)]
          .filter(Boolean)
          .join(" ")}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(todo.id);
        }}
        aria-label={`切换任务 ${todo.title || "（未命名）"} 状态：当前为${statusLabel}`}
      >
        <StatusIcon size={18} weight="bold" aria-hidden="true" />
        <span className="sr-only">{statusLabel}</span>
      </button>

      <input
        ref={registerInput}
        className={classOf("titleInput")}
        value={todo.title}
        placeholder="输入任务内容"
        onChange={(event) => {
          event.stopPropagation();
          onTitleChange(todo.id, event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && isLast) {
            event.preventDefault();
            event.stopPropagation();
            onRequestNewRow();
          }
        }}
        aria-label={`编辑任务 ${todo.title || "（未命名）"}`}
      />

      <button
        type="button"
        className={classOf("deleteButton")}
        onClick={(event) => {
          event.stopPropagation();
          onDelete(todo.id);
        }}
        aria-label={`删除任务 ${todo.title || "（未命名）"}`}
        title="删除"
      >
        <TrashSimple size={18} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
};

export default TodoItem;
