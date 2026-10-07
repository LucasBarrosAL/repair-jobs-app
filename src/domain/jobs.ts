import type { Job } from '@/domain/types'

export const titleRequiredMessage = 'Enter a title to create this job.'
export const deleteClaimedMessage = "This job has been claimed and can't be deleted."

export type CreateJobInput = {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: string
}

export type CreateJobResult = { ok: true; job: Job } | { ok: false; message: string }

export type DeleteJobResult =
  | { ok: true; jobs: Job[] }
  | { ok: false; jobs: Job[]; message: string }

export function createJob(input: CreateJobInput): CreateJobResult {
  const title = input.title.trim()
  if (title.length < 1) {
    return { ok: false, message: titleRequiredMessage }
  }

  return {
    ok: true,
    job: {
      id: input.id,
      title,
      description: input.description.trim(),
      status: 'open',
      createdBy: input.createdBy,
      claimedBy: null,
      createdAt: input.createdAt,
    },
  }
}

export function deleteJob(jobs: Job[], id: string): DeleteJobResult {
  const job = jobs.find((item) => item.id === id)
  if (!job) {
    return { ok: false, jobs, message: 'This job is no longer available.' }
  }
  if (job.claimedBy !== null) {
    return { ok: false, jobs, message: deleteClaimedMessage }
  }

  return { ok: true, jobs: jobs.filter((item) => item.id !== id) }
}

export function jobsForClient(jobs: Job[], username: string): Job[] {
  return jobs.filter((job) => job.createdBy === username).sort(compareJobs)
}

function compareJobs(left: Job, right: Job): number {
  if (left.createdAt !== right.createdAt) {
    return left.createdAt < right.createdAt ? -1 : 1
  }
  if (left.id !== right.id) {
    return left.id < right.id ? -1 : 1
  }
  return 0
}
