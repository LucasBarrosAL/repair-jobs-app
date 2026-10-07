import { claimJob, completeJob, createJob, deleteJob, jobsForClient, jobsForPro, materializeRemoteJob } from '@/domain/jobs'
import type { DummyTodo, Job } from '@/domain/types'

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
  expect(jobsForPro(jobs, [], 'pat').map((item) => item.id)).toEqual(['local_a', 'local_b', 'local_c'])
})

const paintDoor: DummyTodo = { id: 7, todo: 'Paint door', completed: false, userId: 26 }

it('claims an open local job', () => {
  const open = job({ id: 'local_1' })

  expect(claimJob([open], 'local_1', 'pat', null)).toEqual([
    { ...open, status: 'claimed', claimedBy: 'pat' },
  ])
})

it('rejects a claim on a job that is already claimed', () => {
  const claimed = job({ id: 'local_1', status: 'claimed', claimedBy: 'pat' })
  const jobs = [claimed]

  expect(claimJob(jobs, 'local_1', 'pat', null)).toBe(jobs)
})

it('rejects a claim on a finished job', () => {
  const finished = job({ id: 'local_1', status: 'completed', claimedBy: 'pat' })
  const jobs = [finished]

  expect(claimJob(jobs, 'local_1', 'pat', null)).toBe(jobs)
})

it('finishes a job this Pro claimed', () => {
  const claimed = job({ id: 'local_1', status: 'claimed', claimedBy: 'pat' })

  expect(completeJob([claimed], 'local_1', 'pat')).toEqual([{ ...claimed, status: 'completed' }])
})

it('rejects finishing an open job', () => {
  const open = job({ id: 'local_1' })
  const jobs = [open]

  expect(completeJob(jobs, 'local_1', 'pat')).toBe(jobs)
})

it("rejects finishing someone else's claim", () => {
  const claimed = job({ id: 'local_1', status: 'claimed', claimedBy: 'ada' })
  const jobs = [claimed]

  expect(completeJob(jobs, 'local_1', 'pat')).toBe(jobs)
})

it("includes another user's open job for a Pro", () => {
  const open = job({ id: 'local_1', createdBy: 'ada' })

  expect(jobsForPro([open], [], 'pat')).toEqual([open])
})

it("includes this Pro's unfinished claim", () => {
  const claimed = job({ id: 'local_1', createdBy: 'ada', status: 'claimed', claimedBy: 'pat' })

  expect(jobsForPro([claimed], [], 'pat')).toEqual([claimed])
})

it('hides a job claimed by someone else', () => {
  const claimed = job({ id: 'local_1', createdBy: 'sam', status: 'claimed', claimedBy: 'ada' })
  const jobs = [claimed]

  expect(jobsForPro(jobs, [], 'pat')).toEqual([])
  expect(jobs).toEqual([claimed])
})

it('hides a finished job from the Pro list', () => {
  const finished = job({ id: 'local_1', createdBy: 'ada', status: 'completed', claimedBy: 'pat' })
  const jobs = [finished]

  expect(jobsForPro(jobs, [], 'pat')).toEqual([])
  expect(jobs).toEqual([finished])
})

it('excludes a completed todo', () => {
  const todo: DummyTodo = { id: 6, todo: 'Done already', completed: true, userId: 1 }

  expect(jobsForPro([], [todo], 'pat')).toEqual([])
})

it('shows an incomplete todo once with the mock fields', () => {
  const visible = jobsForPro([], [paintDoor], 'pat')

  expect(visible).toEqual([materializeRemoteJob(paintDoor)])
  expect(visible[0]?.id).toBe('remote_7')
})

it('replaces a todo with the local job when that id is already stored', () => {
  const localOpen = job({
    id: 'local_1',
    createdBy: 'ada',
    createdAt: '2024-01-01T00:00:00.000Z',
  })
  const remote3 = job({
    id: 'remote_3',
    title: 'Paint door',
    description: 'Repair job 3',
    createdBy: 'client-3',
    status: 'claimed',
    claimedBy: 'ben',
    createdAt: '2024-01-04T00:00:00.000Z',
  })
  const remote4 = job({
    id: 'remote_4',
    title: 'Fix gate',
    description: 'Repair job 4',
    createdBy: 'client-4',
    status: 'completed',
    claimedBy: 'ben',
    createdAt: '2024-01-05T00:00:00.000Z',
  })
  const todos: DummyTodo[] = [
    { id: 3, todo: 'Paint door', completed: false, userId: 1 },
    { id: 4, todo: 'Fix gate', completed: false, userId: 1 },
    { id: 5, todo: 'Oil hinge', completed: false, userId: 1 },
    { id: 6, todo: 'Done already', completed: true, userId: 1 },
  ]
  const jobs = [localOpen, remote3, remote4]

  expect(jobsForPro(jobs, todos, 'ben').map((item) => item.id)).toEqual(['local_1', 'remote_3', 'remote_5'])
  expect(jobsForPro(jobs, todos, 'cara').map((item) => item.id)).toEqual(['local_1', 'remote_5'])
  expect(jobsForPro(jobs, todos, 'cara').find((item) => item.id === 'remote_5')?.title).toBe('Oil hinge')
})

it('lists local jobs before DummyJSON jobs', () => {
  const olderLocal = job({
    id: 'local_old',
    createdBy: 'ada',
    createdAt: '2024-06-01T00:00:00.000Z',
  })
  const newerLocal = job({
    id: 'local_new',
    createdBy: 'ada',
    createdAt: '2026-10-07T18:00:00.000Z',
  })
  const claimedRemote = job({
    id: 'remote_3',
    title: 'Paint door',
    description: 'Repair job 3',
    createdBy: 'client-3',
    status: 'claimed',
    claimedBy: 'pat',
    createdAt: '2024-01-04T00:00:00.000Z',
  })
  const todos: DummyTodo[] = [
    { id: 1, todo: 'Do laundry', completed: false, userId: 1 },
    { id: 7, todo: 'Paint door', completed: false, userId: 26 },
  ]

  expect(jobsForPro([newerLocal, claimedRemote, olderLocal], todos, 'pat').map((item) => item.id)).toEqual([
    'local_old',
    'local_new',
    'remote_1',
    'remote_3',
    'remote_7',
  ])
})

it('writes one local job when a todo is claimed', () => {
  const materialized = materializeRemoteJob(paintDoor)
  const jobs = claimJob([], 'remote_7', 'ben', paintDoor)

  expect(jobs).toEqual([{ ...materialized, status: 'claimed', claimedBy: 'ben' }])
  expect(materializeRemoteJob(paintDoor)).toEqual(materialized)
})

it('maps todo 7 onto the worked example', () => {
  expect(materializeRemoteJob(paintDoor)).toEqual({
    id: 'remote_7',
    title: 'Paint door',
    description: 'Repair job 7',
    status: 'open',
    createdBy: 'client-7',
    claimedBy: null,
    createdAt: '2024-01-08T00:00:00.000Z',
  })
})

it('returns the same remote job on every call', () => {
  expect(materializeRemoteJob(paintDoor)).toEqual(materializeRemoteJob(paintDoor))
})

it('maps an incomplete todo to an open unassigned job', () => {
  const jobFromTodo = materializeRemoteJob(paintDoor)

  expect(jobFromTodo.status).toBe('open')
  expect(jobFromTodo.claimedBy).toBeNull()
})
