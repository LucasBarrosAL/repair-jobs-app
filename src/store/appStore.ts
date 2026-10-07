import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { login as loginAccount, logout as clearSession } from '@/domain/auth'
import type { Account, Job, Role, Session } from '@/domain/types'

export const persistKey = 'repair-jobs.v1'

export type AppState = {
  accounts: Record<string, Account>
  session: Session | null
  jobs: Job[]
  login: (username: string, draftRole: Role) => void
  logout: () => void
}

export const initialAppState = {
  accounts: {},
  session: null,
  jobs: [],
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,
      login: (username, draftRole) => {
        set((state) => loginAccount(state, username, draftRole))
      },
      logout: () => {
        set((state) => clearSession(state))
      },
    }),
    {
      name: persistKey,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        session: state.session,
        jobs: state.jobs,
      }),
    },
  ),
)
