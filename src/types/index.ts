export type IsoDateString = `${number}-${number}-${number}T${string}`;

export type TodoId = string & { readonly __tag: "TodoId" };

export type TodoStatus = "todo" | "doing" | "done";

export interface TodoItem {
  readonly id: TodoId;
  readonly title: string;
  readonly status: TodoStatus;
  readonly createdAt: IsoDateString;
  readonly updatedAt: IsoDateString;
}

export type TodoCollection = ReadonlyArray<TodoItem>;

export interface BootScreenMessage {
  readonly headline: string;
  readonly description: string;
}

export interface BootContext {
  readonly appName: string;
  readonly version: string;
  readonly bootMessage: BootScreenMessage;
  readonly initialTodos: TodoCollection;
}

export const DEFAULT_BOOT_CONTEXT: BootContext = {
  appName: "ImageTodo",
  version: "0.1.0",
  bootMessage: {
    headline: "ImageTodo",
    description: "简洁的多列任务列表。",
  },
  initialTodos: [],
};
