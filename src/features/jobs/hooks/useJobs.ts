import { useQuery } from '@tanstack/react-query'
import { fetchTodos, todosQueryKey } from '@/api/todos'
import { jobsForClient, jobsForPro } from '@/domain/jobs'
import type { DummyTodo, Job, Session } from '@/domain/types'
import { useAppStore } from '@/store/appStore'

export function useJobs() {
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const isPro = session?.role === 'pro'
  const todosQuery = useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
    enabled: isPro,
  })
  const mergedQuery = useQuery({
    queryKey: ['visible-jobs', session?.role, session?.username, jobs, todosQuery.dataUpdatedAt, todosQuery.status],
    queryFn: () => mergeVisibleJobs(session, jobs, todosQuery.data ?? []),
    initialData: () => mergeVisibleJobs(session, jobs, todosQuery.data ?? []),
    staleTime: Infinity,
  })
  const visible = mergedQuery.data ?? []

  function findJob(jobId: string | undefined): Job | undefined {
    if (!session || !jobId) {
      return undefined
    }
    const listed = visible.find((item) => item.id === jobId)
    if (listed) {
      return listed
    }
    if (session.role !== 'pro') {
      return undefined
    }
    return jobs.find((item) => item.id === jobId && item.claimedBy === session.username && item.status === 'completed')
  }

  function todoFor(jobId: string): DummyTodo | null {
    return todosQuery.data?.find((item) => `remote_${item.id}` === jobId) ?? null
  }

  function refetch() {
    if (isPro) {
      return todosQuery.refetch()
    }
    return mergedQuery.refetch()
  }

  return {
    jobs: visible,
    isLoading: isPro && todosQuery.isLoading,
    isError: isPro && todosQuery.isError,
    isRefetching: isPro ? todosQuery.isRefetching : mergedQuery.isRefetching,
    refetch,
    findJob,
    todoFor,
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
