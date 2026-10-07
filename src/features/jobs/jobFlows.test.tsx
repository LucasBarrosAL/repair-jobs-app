import AsyncStorage from '@react-native-async-storage/async-storage'
import { screen, userEvent } from '@testing-library/react-native'
import type { DummyTodo, Job } from '@/domain/types'
import { initialAppState, useAppStore } from '@/store/appStore'
import { renderApp } from '@/test/renderApp'

const createdAt = '2026-10-07T18:00:00.000Z'
const createdAtLabel = 'Oct 7, 2026, 6:00 PM'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'local_1',
    title: 'Fix the sink',
    description: 'Leaks at the trap',
    status: 'open',
    createdBy: 'sam',
    claimedBy: null,
    createdAt,
    ...overrides,
  }
}

const originalFetch = globalThis.fetch

beforeEach(async () => {
  await AsyncStorage.clear()
  await useAppStore.setState(initialAppState)
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

async function signIn(role: 'client' | 'pro', jobs: Job[] = [], username = 'sam') {
  await useAppStore.setState({
    accounts: { [username]: { username, role } },
    session: { username, role },
    jobs,
  })
}

function mockTodos(todos: DummyTodo[] = []) {
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({ todos }),
  })) as unknown as typeof globalThis.fetch
}

it('shows a new job after create', async () => {
  await signIn('client')
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(screen.getByRole('button', { name: 'Create job' }))
  await user.type(screen.getByLabelText('Title'), 'Fix the sink')
  await user.press(screen.getByRole('button', { name: 'Create job' }))

  expect(await screen.findByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText('open')).toBeOnTheScreen()
})

it('shows an error when the title is blank', async () => {
  await signIn('client')
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(screen.getByRole('button', { name: 'Create job' }))
  await user.press(screen.getByRole('button', { name: 'Create job' }))

  expect(screen.getByText('Enter a title to create this job.')).toBeOnTheScreen()
  expect(screen.getByRole('header', { name: 'New job' })).toBeOnTheScreen()
})

it('returns to Jobs after deleting an unclaimed job', async () => {
  await signIn('client', [makeJob()])
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(screen.getByRole('button', { name: 'Fix the sink' }))

  expect(screen.getByText('Leaks at the trap')).toBeOnTheScreen()
  expect(screen.getByText('Pro: Unassigned')).toBeOnTheScreen()
  expect(screen.getByText('Posted')).toBeOnTheScreen()
  expect(screen.getByText(createdAtLabel)).toBeOnTheScreen()

  await user.press(screen.getByRole('button', { name: 'Delete' }))

  expect(await screen.findByRole('header', { name: 'Jobs' })).toBeOnTheScreen()
  expect(screen.queryByText('Fix the sink')).not.toBeOnTheScreen()
})

it('keeps a claimed job and shows the delete error', async () => {
  await signIn('client', [makeJob({ status: 'claimed', claimedBy: 'pat' })])
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(screen.getByRole('button', { name: 'Fix the sink' }))
  await user.press(screen.getByRole('button', { name: 'Delete' }))

  expect(screen.getByRole('header', { name: 'Fix the sink' })).toBeOnTheScreen()
  expect(screen.getByText('Pro: pat')).toBeOnTheScreen()
  expect(screen.getByText("This job has been claimed and can't be deleted.")).toBeOnTheScreen()
})

it('keeps a completed job and shows the delete error', async () => {
  await signIn('client', [makeJob({ status: 'completed', claimedBy: 'pat' })])
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(screen.getByRole('button', { name: 'Fix the sink' }))
  await user.press(screen.getByRole('button', { name: 'Delete' }))

  expect(screen.getByRole('header', { name: 'Fix the sink' })).toBeOnTheScreen()
  expect(screen.getByText("This job has been claimed and can't be deleted.")).toBeOnTheScreen()
})

it('shows the title, status, and creation date on a client row', async () => {
  await signIn('client', [makeJob()])
  await renderApp('/jobs')

  expect(screen.getByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText('open')).toBeOnTheScreen()
  expect(screen.getByText(createdAtLabel)).toBeOnTheScreen()
})

it('shows a completed job on the client list', async () => {
  await signIn('client', [makeJob({ status: 'completed', claimedBy: 'pat' })])
  await renderApp('/jobs')

  expect(screen.getByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText('completed')).toBeOnTheScreen()
})

it('hides a job created by someone else', async () => {
  await signIn('client', [
    makeJob(),
    makeJob({ id: 'local_2', title: 'Paint door', createdBy: 'ada' }),
  ])
  await renderApp('/jobs')

  expect(screen.getByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.queryByText('Paint door')).not.toBeOnTheScreen()
})

it('sends a Pro away from the create screen', async () => {
  mockTodos()
  await signIn('pro')
  await renderApp('/jobs/create')

  expect(await screen.findByRole('header', { name: 'Jobs' })).toBeOnTheScreen()
  expect(screen.queryByRole('header', { name: 'New job' })).not.toBeOnTheScreen()
})

it('hides the create button for a Pro', async () => {
  mockTodos()
  await signIn('pro')
  await renderApp('/jobs')

  const user = userEvent.setup()

  expect(screen.queryByRole('button', { name: 'Create job' })).not.toBeOnTheScreen()
  expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeOnTheScreen()
  await user.press(screen.getByRole('button', { name: 'Settings' }))
  expect(screen.getByRole('button', { name: 'Log out' })).toBeOnTheScreen()
})

it('does not request DummyJSON for a client', async () => {
  const fetchMock = jest.fn()
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
  await signIn('client', [makeJob()])
  await renderApp('/jobs')

  expect(screen.getByText('Fix the sink')).toBeOnTheScreen()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('enables Claim only for an open job', async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(await screen.findByRole('button', { name: 'Fix the sink' }))

  expect(screen.getByRole('button', { name: 'Claim' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Mark as completed' })).toBeDisabled()
})

it('updates the job after Claim', async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(await screen.findByRole('button', { name: 'Fix the sink' }))
  await user.press(screen.getByRole('button', { name: 'Claim' }))

  expect(screen.getByText('claimed')).toBeOnTheScreen()
  expect(screen.getByText('Pro: pat')).toBeOnTheScreen()
  expect(screen.getByRole('button', { name: 'Claim' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Mark as completed' })).toBeEnabled()
})

it('disables both actions after finish and leaves the Pro list', async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')
  const user = userEvent.setup()

  await user.press(await screen.findByRole('button', { name: 'Fix the sink' }))
  await user.press(screen.getByRole('button', { name: 'Claim' }))
  await user.press(screen.getByRole('button', { name: 'Mark as completed' }))

  expect(screen.getByRole('button', { name: 'Claim' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Mark as completed' })).toBeDisabled()
  expect(screen.getByText('completed')).toBeOnTheScreen()

  await user.press(screen.getByRole('button', { name: 'Back' }))

  expect(await screen.findByRole('header', { name: 'Jobs' })).toBeOnTheScreen()
  expect(screen.queryByText('Fix the sink')).not.toBeOnTheScreen()
})

it('hides a job claimed by someone else', async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'sam', status: 'claimed', claimedBy: 'ada' })], 'pat')
  await renderApp('/jobs')

  expect(await screen.findByRole('header', { name: 'No jobs to pick up' })).toBeOnTheScreen()
  expect(screen.queryByText('Fix the sink')).not.toBeOnTheScreen()
})

it('shows the skeleton while todos are still loading', async () => {
  globalThis.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof globalThis.fetch
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')

  expect(screen.getByLabelText('Loading jobs')).toBeOnTheScreen()
  expect(screen.queryByText('Fix the sink')).not.toBeOnTheScreen()
})

it('keeps local jobs and offers retry when todos fail', async () => {
  globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof globalThis.fetch
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')

  expect(await screen.findByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText("Couldn't load available jobs.")).toBeOnTheScreen()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen()
})

it('refetches DummyJSON when the list is pulled', async () => {
  const fetchMock = jest.fn(async () => ({
    ok: true,
    json: async () => ({ todos: [] }),
  }))
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')

  expect(await screen.findByText('Fix the sink')).toBeOnTheScreen()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  screen.getByTestId('job-list').props.refreshControl.props.onRefresh()

  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('shows the title, status, and creation date on a Pro row', async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'ada' })], 'pat')
  await renderApp('/jobs')

  expect(await screen.findByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText('open')).toBeOnTheScreen()
  expect(screen.getByText(createdAtLabel)).toBeOnTheScreen()
})

it("shows this Pro's claimed job", async () => {
  mockTodos()
  await signIn('pro', [makeJob({ createdBy: 'ada', status: 'claimed', claimedBy: 'pat' })], 'pat')
  await renderApp('/jobs')

  expect(await screen.findByText('Fix the sink')).toBeOnTheScreen()
  expect(screen.getByText('claimed')).toBeOnTheScreen()
})
