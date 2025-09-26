import type { TodoId } from "@/types";

export const createTodoId = (): TodoId => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `todo-${Math.random().toString(36).slice(2, 10)}`;

  return id as TodoId;
};
