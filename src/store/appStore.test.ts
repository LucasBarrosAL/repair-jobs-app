import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Job } from '@/domain/types'
import { initialAppState, persistKey, useAppStore } from '@/store/appStore'

const accounts = {
  sam: { username: 'sam', role: 'client' as const },
}

const session = { username: 'sam', role: 'client' as const }

const jobs: Job[] = [
  {
    id: 'local_1',
    title: 'Fix the sink',
    description: '',
    status: 'open',
    createdBy: 'sam',
    claimedBy: null,
    createdAt: '2026-10-07T18:00:00.000Z',
  },
]

beforeEach(async () => {
  await AsyncStorage.clear()
  await useAppStore.setState(initialAppState)
})

it('starts with an empty session, accounts, and jobs', () => {
  const state = useAppStore.getState()
  expect(state.session).toBeNull()
  expect(state.accounts).toEqual({})
  expect(state.jobs).toEqual([])
})

it('brings session, accounts, and jobs back after rehydration', async () => {
  await useAppStore.setState({ accounts, session, jobs })

  const stored = await AsyncStorage.getItem(persistKey)
  if (stored === null) {
    throw new Error('Expected the store to persist session, accounts, and jobs')
  }

  await useAppStore.setState(initialAppState)
  expect(useAppStore.getState().session).toBeNull()

  await AsyncStorage.setItem(persistKey, stored)
  await useAppStore.persist.rehydrate()

  expect(useAppStore.getState().accounts).toEqual(accounts)
  expect(useAppStore.getState().session).toEqual(session)
  expect(useAppStore.getState().jobs).toEqual(jobs)
})
