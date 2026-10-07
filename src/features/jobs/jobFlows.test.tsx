import AsyncStorage from '@react-native-async-storage/async-storage'
import { screen, userEvent } from '@testing-library/react-native'
import type { Job } from '@/domain/types'
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

beforeEach(async () => {
  await AsyncStorage.clear()
  await useAppStore.setState(initialAppState)
})

async function signIn(role: 'client' | 'pro', jobs: Job[] = []) {
  await useAppStore.setState({
    accounts: { sam: { username: 'sam', role } },
    session: { username: 'sam', role },
    jobs,
  })
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

it('hides the create button for a Pro', async () => {
  await signIn('pro')
  await renderApp('/jobs')

  expect(screen.queryByRole('button', { name: 'Create job' })).not.toBeOnTheScreen()
  expect(screen.getByRole('button', { name: 'Log out' })).toBeOnTheScreen()
})
