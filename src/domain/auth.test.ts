import { isUsernameValid, login, logout, nextDraftRole, resolveRole } from '@/domain/auth'
import type { AuthState } from '@/domain/auth'
import type { Job } from '@/domain/types'

const empty: AuthState = {
  accounts: {},
  session: null,
  jobs: [],
}

const job: Job = {
  id: 'local_1',
  title: 'Fix the sink',
  description: '',
  status: 'open',
  createdBy: 'sam',
  claimedBy: null,
  createdAt: '2026-10-07T18:00:00.000Z',
}

it('trims before match', () => {
  const state: AuthState = {
    ...empty,
    accounts: { Ada: { username: 'Ada', role: 'client' } },
  }

  const next = login(state, '  Ada  ', 'pro')

  expect(next.session).toEqual({ username: 'Ada', role: 'client' })
  expect(next.accounts).toEqual({ Ada: { username: 'Ada', role: 'client' } })
})

it('rejects an empty username', () => {
  expect(isUsernameValid('')).toBe(false)
  expect(isUsernameValid('   ')).toBe(false)

  const blank = login(empty, '', 'client')
  const spaces = login(empty, '   ', 'pro')

  expect(blank).toBe(empty)
  expect(blank.session).toBeNull()
  expect(spaces).toBe(empty)
  expect(spaces.session).toBeNull()
})

it('defaults a new username to Client', () => {
  const next = login(empty, 'sam', 'client')

  expect(next.accounts.sam).toEqual({ username: 'sam', role: 'client' })
  expect(next.session).toEqual({ username: 'sam', role: 'client' })
})

it('stores the role chosen for a new username', () => {
  const next = login(empty, 'sam', 'pro')

  expect(next.accounts.sam).toEqual({ username: 'sam', role: 'pro' })
  expect(next.session).toEqual({ username: 'sam', role: 'pro' })
})

it('keeps the saved role for an existing username', () => {
  const state: AuthState = {
    ...empty,
    accounts: { sam: { username: 'sam', role: 'pro' } },
  }

  const next = login(state, 'sam', 'client')

  expect(next.session).toEqual({ username: 'sam', role: 'pro' })
  expect(next.accounts.sam).toEqual({ username: 'sam', role: 'pro' })
  expect(resolveRole(state.accounts, 'sam', 'client')).toEqual({ role: 'pro', locked: true })
})

it('treats capitalization as part of the username', () => {
  const ada = login(empty, 'Ada', 'client')
  const next = login(ada, 'ada', 'pro')

  expect(next.accounts.Ada).toEqual({ username: 'Ada', role: 'client' })
  expect(next.accounts.ada).toEqual({ username: 'ada', role: 'pro' })
})

it('clears the session and leaves accounts and jobs in place', () => {
  const state: AuthState = {
    accounts: { sam: { username: 'sam', role: 'client' } },
    session: { username: 'sam', role: 'client' },
    jobs: [job],
  }

  const next = logout(state)

  expect(next.session).toBeNull()
  expect(next.accounts).toEqual(state.accounts)
  expect(next.jobs).toEqual(state.jobs)
})

it('resets the draft to Client when the field leaves a saved username', () => {
  const accounts = { sam: { username: 'sam', role: 'pro' as const } }

  expect(nextDraftRole('sam', 'sammy', accounts, 'pro')).toBe('client')
})

it('keeps the draft when the name never matched a saved account', () => {
  expect(nextDraftRole('sammy', 'sammy2', {}, 'pro')).toBe('pro')
})
