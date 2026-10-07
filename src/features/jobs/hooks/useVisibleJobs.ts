import { useQuery } from '@tanstack/react-query'
import { fetchTodos, todosQueryKey } from '@/api/todos'
import { jobsForClient, jobsForPro } from '@/domain/jobs'
import type { DummyTodo, Job, Session } from '@/domain/types'
import { useAppStore } from '@/store/appStore'

export function useVisibleJobs() {
  const session = useAppStore((state) => state.session)
  const storedJobs = useAppStore((state) => state.jobs)
  const isPro = session?.role === 'pro'
  const todosQuery = useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
    enabled: isPro,
  })
  const todos = todosQuery.data ?? []
  const mergedQuery = useQuery({
    queryKey: ['visible-jobs', session?.role, session?.username, storedJobs, todosQuery.dataUpdatedAt, todosQuery.status],
    queryFn: () => mergeVisibleJobs(session, storedJobs, todos),
    initialData: () => mergeVisibleJobs(session, storedJobs, todos),
    staleTime: Infinity,
  })

  function refetch() {
    if (isPro) {
      return todosQuery.refetch()
    }
    return mergedQuery.refetch()
  }

  return {
    session,
    storedJobs,
    jobs: mergedQuery.data ?? [],
    todos,
    isLoading: isPro && todosQuery.isLoading,
    isError: isPro && todosQuery.isError,
    isRefetching: isPro ? todosQuery.isRefetching : mergedQuery.isRefetching,
    refetch,
  }
}

function mergeVisibleJobs(session: Session | null, jobs: Job[], todos: DummyTodo[]): Job[] {
  if (!session) {
    return []
  }
  if (session.role === 'client') {
    return jobsForClient(jobs, session.username)
  }
  return jobsForPro(jobs, todos, session.username)
}
