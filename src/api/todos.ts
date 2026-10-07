import type { DummyTodo } from '@/domain/types'

export const todosQueryKey = ['dummyjson', 'todos', { limit: 20 }] as const

export async function fetchTodos(): Promise<DummyTodo[]> {
  const response = await fetch('https://dummyjson.com/todos?limit=20')
  if (!response.ok) {
    throw new Error("Couldn't load available jobs.")
  }

  const body: unknown = await response.json()
  if (!hasTodos(body)) {
    throw new Error("Couldn't load available jobs.")
  }

  return body.todos
}

function hasTodos(body: unknown): body is { todos: DummyTodo[] } {
  return typeof body === 'object' && body !== null && 'todos' in body && Array.isArray(body.todos)
}
