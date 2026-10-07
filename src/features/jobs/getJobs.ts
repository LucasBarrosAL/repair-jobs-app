import { fetchTodos } from '@/api/todos'
import { jobsForClient, jobsForPro } from '@/domain/jobs'
import type { DummyTodo, Job, Session } from '@/domain/types'

export type JobsQueryData = {
  jobs: Job[]
  todos: DummyTodo[]
  loadFailed: boolean
}

export function jobsQueryKey(session: Session | null) {
  return ['jobs', session?.role ?? null, session?.username ?? null] as const
}

export function visibleJobs(session: Session, jobs: Job[], todos: DummyTodo[]): Job[] {
  if (session.role === 'client') {
    return jobsForClient(jobs, session.username)
  }
  return jobsForPro(jobs, todos, session.username)
}

export async function getJobs(session: Session | null, jobs: Job[]): Promise<JobsQueryData> {
  if (!session) {
    return { jobs: [], todos: [], loadFailed: false }
  }
  if (session.role === 'client') {
    return { jobs: visibleJobs(session, jobs, []), todos: [], loadFailed: false }
  }

  try {
    const todos = await fetchTodos()
    return { jobs: visibleJobs(session, jobs, todos), todos, loadFailed: false }
  } catch {
    return { jobs: visibleJobs(session, jobs, []), todos: [], loadFailed: true }
  }
}
