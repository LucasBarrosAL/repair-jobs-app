import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { addTodo, deleteTodo, updateTodo } from '@/api/todos'
import { createLocalId } from '@/domain/ids'
import { claimJob, completeJob, createJob, deleteJob, titleRequiredMessage } from '@/domain/jobs'
import type { DummyTodo, Job, Session } from '@/domain/types'
import { jobsQueryKey, visibleJobs } from '@/features/jobs/getJobs'
import type { JobsQueryData } from '@/features/jobs/getJobs'
import { useAppStore } from '@/store/appStore'

const saveError = "Couldn't save this job."

type MutationResult = { ok: true } | { ok: false; message: string }

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { title: string; description: string }): Promise<MutationResult> => createJobOnServer(queryClient, input),
  })
}

export function useClaimJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { job: Job; todo: DummyTodo | null }): Promise<MutationResult> => claimJobOnServer(queryClient, input),
  })
}

export function useCompleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (job: Job): Promise<MutationResult> => completeJobOnServer(queryClient, job),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (job: Job): Promise<MutationResult> => deleteJobOnServer(queryClient, job),
  })
}

async function createJobOnServer(
  queryClient: QueryClient,
  input: { title: string; description: string },
): Promise<MutationResult> {
  const session = useAppStore.getState().session
  if (!session) {
    return { ok: false, message: saveError }
  }
  if (input.title.trim().length < 1) {
    return { ok: false, message: titleRequiredMessage }
  }

  try {
    const remote = await addTodo(input.title.trim(), false)
    const result = createJob({
      id: createLocalId(),
      title: remote.todo,
      description: input.description,
      createdBy: session.username,
      createdAt: new Date().toISOString(),
    })
    if (!result.ok) {
      return result
    }
    commitJobs(queryClient, session, [...useAppStore.getState().jobs, result.job])
    return { ok: true }
  } catch {
    return { ok: false, message: saveError }
  }
}

async function claimJobOnServer(
  queryClient: QueryClient,
  input: { job: Job; todo: DummyTodo | null },
): Promise<MutationResult> {
  const session = useAppStore.getState().session
  if (!session) {
    return { ok: false, message: saveError }
  }

  try {
    await sendJobUpdate(input.job, false)
  } catch {
    return { ok: false, message: saveError }
  }

  commitJobs(queryClient, session, claimJob(useAppStore.getState().jobs, input.job.id, session.username, input.todo))
  return { ok: true }
}

async function completeJobOnServer(queryClient: QueryClient, job: Job): Promise<MutationResult> {
  const session = useAppStore.getState().session
  if (!session) {
    return { ok: false, message: saveError }
  }

  try {
    await sendJobUpdate(job, true)
  } catch {
    return { ok: false, message: saveError }
  }

  commitJobs(queryClient, session, completeJob(useAppStore.getState().jobs, job.id, session.username))
  return { ok: true }
}

async function deleteJobOnServer(queryClient: QueryClient, job: Job): Promise<MutationResult> {
  const session = useAppStore.getState().session
  if (!session) {
    return { ok: false, message: saveError }
  }

  const result = deleteJob(useAppStore.getState().jobs, job.id)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  try {
    await sendJobDelete(job)
  } catch {
    return { ok: false, message: saveError }
  }

  commitJobs(queryClient, session, result.jobs)
  return { ok: true }
}

async function sendJobUpdate(job: Job, completed: boolean): Promise<void> {
  const remoteId = remoteTodoId(job.id)
  if (remoteId === null) {
    return
  }
  await updateTodo(remoteId, completed)
}

async function sendJobDelete(job: Job): Promise<void> {
  const remoteId = remoteTodoId(job.id)
  if (remoteId === null) {
    return
  }
  await deleteTodo(remoteId)
}

function remoteTodoId(jobId: string): number | null {
  const match = /^remote_(\d+)$/.exec(jobId)
  if (!match?.[1]) {
    return null
  }
  return Number(match[1])
}

function commitJobs(queryClient: QueryClient, session: Session, jobs: Job[]) {
  useAppStore.setState({ jobs })
  const current = queryClient.getQueryData<JobsQueryData>(jobsQueryKey(session))
  queryClient.setQueryData<JobsQueryData>(jobsQueryKey(session), {
    jobs: visibleJobs(session, jobs, current?.todos ?? []),
    todos: current?.todos ?? [],
    loadFailed: current?.loadFailed ?? false,
  })
}
