import { createJob, deleteJob, jobsForClient } from '@/domain/jobs'
import type { Job } from '@/domain/types'

function job(overrides: Partial<Job> & Pick<Job, 'id'>): Job {
  return {
    title: 'Fix the sink',
    description: '',
    status: 'open',
    createdBy: 'sam',
    claimedBy: null,
    createdAt: '2026-10-07T18:00:00.000Z',
    ...overrides,
  }
}

it('trims the title and description', () => {
  const result = createJob({
    id: 'local_1',
    title: '  Fix the sink  ',
    description: '  Leaks  ',
    createdBy: 'sam',
    createdAt: '2026-10-07T18:00:00.000Z',
  })

  expect(result).toEqual({
    ok: true,
    job: {
      id: 'local_1',
      title: 'Fix the sink',
      description: 'Leaks',
      status: 'open',
      createdBy: 'sam',
      claimedBy: null,
      createdAt: '2026-10-07T18:00:00.000Z',
    },
  })
})

it('allows an empty description', () => {
  const result = createJob({
    id: 'local_1',
    title: 'Fix the sink',
    description: '   ',
    createdBy: 'sam',
    createdAt: '2026-10-07T18:00:00.000Z',
  })

  expect(result.ok).toBe(true)
  if (result.ok) {
    expect(result.job.description).toBe('')
  }
})

it('rejects a blank title', () => {
  const result = createJob({
    id: 'local_1',
    title: '   ',
    description: 'Leaks',
    createdBy: 'sam',
    createdAt: '2026-10-07T18:00:00.000Z',
  })

  expect(result).toEqual({ ok: false, message: 'Enter a title to create this job.' })
  expect(result).not.toHaveProperty('job')
})

it('removes an unclaimed job', () => {
  const target = job({ id: 'local_1' })
  const other = job({ id: 'local_2', title: 'Fix the gate' })
  const jobs = [target, other]

  const result = deleteJob(jobs, 'local_1')

  expect(result).toEqual({ ok: true, jobs: [other] })
})

it('keeps a claimed job stored', () => {
  const claimed = job({ id: 'local_1', status: 'claimed', claimedBy: 'pat' })
  const jobs = [claimed]

  const result = deleteJob(jobs, 'local_1')

  expect(result.jobs).toBe(jobs)
  expect(result).toEqual({
    ok: false,
    jobs,
    message: "This job has been claimed and can't be deleted.",
  })
})

it('keeps a completed job stored', () => {
  const completed = job({ id: 'local_1', status: 'completed', claimedBy: 'pat' })
  const jobs = [completed]

  const result = deleteJob(jobs, 'local_1')

  expect(result.jobs).toBe(jobs)
  expect(result).toEqual({
    ok: false,
    jobs,
    message: "This job has been claimed and can't be deleted.",
  })
})

it('includes a client open job and finished job', () => {
  const jobs = [
    job({ id: 'local_open', status: 'open', createdAt: '2024-01-01T00:00:00.000Z' }),
    job({ id: 'local_done', status: 'completed', claimedBy: 'pat', createdAt: '2024-02-01T00:00:00.000Z' }),
    job({ id: 'local_other', createdBy: 'ada' }),
  ]

  expect(jobsForClient(jobs, 'sam').map((item) => item.id)).toEqual(['local_open', 'local_done'])
})

it('hides another user job from the client list', () => {
  const jobs = [job({ id: 'local_sam' }), job({ id: 'local_ada', createdBy: 'ada', title: 'Paint door' })]

  expect(jobsForClient(jobs, 'sam').map((item) => item.id)).toEqual(['local_sam'])
})

it('lists a client jobs oldest first', () => {
  const jobs = [
    job({ id: 'local_c', createdAt: '2024-03-01T00:00:00.000Z' }),
    job({ id: 'local_b', createdAt: '2024-01-01T00:00:00.000Z' }),
    job({ id: 'local_a', createdAt: '2024-01-01T00:00:00.000Z' }),
  ]

  expect(jobsForClient(jobs, 'sam').map((item) => item.id)).toEqual(['local_a', 'local_b', 'local_c'])
})
