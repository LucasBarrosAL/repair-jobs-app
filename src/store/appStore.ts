import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { login as loginAccount, logout as clearSession } from '@/domain/auth'
import { createLocalId } from '@/domain/ids'
import { createJob as makeJob, deleteJob as removeJob } from '@/domain/jobs'
import type { CreateJobResult } from '@/domain/jobs'
import type { Account, Job, Role, Session } from '@/domain/types'

export const persistKey = 'repair-jobs.v1'

export type AppState = {
  accounts: Record<string, Account>
  session: Session | null
  jobs: Job[]
  login: (username: string, draftRole: Role) => void
  logout: () => void
  createJob: (title: string, description: string) => CreateJobResult
  deleteJob: (id: string) => { ok: true } | { ok: false; message: string }
}

export const initialAppState = {
  accounts: {},
  session: null,
  jobs: [],
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialAppState,
      login: (username, draftRole) => {
        set((state) => loginAccount(state, username, draftRole))
      },
      logout: () => {
        set((state) => clearSession(state))
      },
      createJob: (title, description) => {
        const session = get().session
        if (!session) {
          return { ok: false, message: 'Enter a title to create this job.' }
        }
        const result = makeJob({
          id: createLocalId(),
          title,
          description,
          createdBy: session.username,
          createdAt: new Date().toISOString(),
        })
        if (result.ok) {
          set({ jobs: [...get().jobs, result.job] })
        }
        return result
      },
      deleteJob: (id) => {
        const result = removeJob(get().jobs, id)
        if (!result.ok) {
          return { ok: false, message: result.message }
        }
        set({ jobs: result.jobs })
        return { ok: true }
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
