import type { DummyTodo, Job, Session } from '@/domain/types'
import { useVisibleJobs } from '@/features/jobs/hooks/useVisibleJobs'

export type JobActionState = 'hidden' | 'enabled' | 'disabled'

export type JobDetailsActions = {
  delete: JobActionState
  claim: JobActionState
  complete: JobActionState
}

const hiddenActions: JobDetailsActions = {
  delete: 'hidden',
  claim: 'hidden',
  complete: 'hidden',
}

export function useJobDetails(jobId: string | undefined) {
  const { session, storedJobs, jobs, todos } = useVisibleJobs()
  const job = findJob(session, storedJobs, jobs, jobId)

  return {
    job,
    todo: todoFor(todos, jobId),
    actions: actionsFor(session, job),
  }
}

function findJob(session: Session | null, storedJobs: Job[], jobs: Job[], jobId: string | undefined): Job | undefined {
  if (!session || !jobId) {
    return undefined
  }
  const listed = jobs.find((item) => item.id === jobId)
  if (listed) {
    return listed
  }
  if (session.role !== 'pro') {
    return undefined
  }
  return storedJobs.find((item) => item.id === jobId && item.claimedBy === session.username && item.status === 'completed')
}

function todoFor(todos: DummyTodo[], jobId: string | undefined): DummyTodo | null {
  if (!jobId) {
    return null
  }
  return todos.find((item) => `remote_${item.id}` === jobId) ?? null
}

function actionsFor(session: Session | null, job: Job | undefined): JobDetailsActions {
  if (!session || !job) {
    return hiddenActions
  }
  if (session.role === 'client') {
    return {
      delete: 'enabled',
      claim: 'hidden',
      complete: 'hidden',
    }
  }
  return {
    delete: 'hidden',
    claim: job.status === 'open' ? 'enabled' : 'disabled',
    complete: job.status === 'claimed' && job.claimedBy === session.username ? 'enabled' : 'disabled',
  }
}
