import { useQuery } from '@tanstack/react-query'
import { fetchTodos, todosQueryKey } from '@/api/todos'

export function useRemoteTodos(enabled: boolean) {
  return useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
    enabled,
  })
}
