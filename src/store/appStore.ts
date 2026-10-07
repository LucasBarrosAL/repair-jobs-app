import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Account, Job, Session } from '@/domain/types'

export const persistKey = 'repair-jobs.v1'

export type AppState = {
  accounts: Record<string, Account>
  session: Session | null
  jobs: Job[]
}

export const initialAppState: AppState = {
  accounts: {},
  session: null,
  jobs: [],
}

export const useAppStore = create<AppState>()(
  persist(() => initialAppState, {
    name: persistKey,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      accounts: state.accounts,
      session: state.session,
      jobs: state.jobs,
    }),
  }),
)
