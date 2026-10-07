import type { DummyTodo } from "@/domain/types";

const todosUrl = "https://dummyjson.com/todos";
const userId = 1;

export async function fetchTodos(): Promise<DummyTodo[]> {
  const response = await fetch(`${todosUrl}?limit=20`);
  if (!response.ok) {
    throw new Error("Couldn't load available jobs.");
  }

  const body = await response.json();

  return body.todos;
}

export async function addTodo(
  todo: string,
  completed: boolean,
): Promise<DummyTodo> {
  return requestTodo(`${todosUrl}/add`, "POST", { todo, completed, userId });
}

export async function updateTodo(
  id: number,
  completed: boolean,
): Promise<DummyTodo> {
  return requestTodo(`${todosUrl}/${id}`, "PUT", { completed });
}

export async function deleteTodo(id: number): Promise<DummyTodo> {
  return requestTodo(`${todosUrl}/${id}`, "DELETE");
}

async function requestTodo(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<DummyTodo> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error("Couldn't save this job.");
  }

  const payload = await response.json();

  return payload;
}
