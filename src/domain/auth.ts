import type { Account, Job, Role, Session } from '@/domain/types'

export type AuthState = {
  accounts: Record<string, Account>
  session: Session | null
  jobs: Job[]
}

export type RoleResolution = {
  role: Role
  locked: boolean
}

export function normalizeUsername(input: string): string {
  return input.trim()
}

export function isUsernameValid(input: string): boolean {
  return normalizeUsername(input).length >= 1
}

export function resolveRole(
  accounts: Record<string, Account>,
  username: string,
  draftRole: Role,
): RoleResolution {
  const saved = accounts[normalizeUsername(username)]
  if (saved) {
    return { role: saved.role, locked: true }
  }
  return { role: draftRole, locked: false }
}

export function nextDraftRole(
  previousUsername: string,
  nextUsername: string,
  accounts: Record<string, Account>,
  draftRole: Role,
): Role {
  const wasLocked = Boolean(accounts[normalizeUsername(previousUsername)])
  const isLocked = Boolean(accounts[normalizeUsername(nextUsername)])
  if (wasLocked && !isLocked) {
    return 'client'
  }
  return draftRole
}

export function login(state: AuthState, username: string, draftRole: Role): AuthState {
  if (!isUsernameValid(username)) {
    return state
  }

  const normalized = normalizeUsername(username)
  const saved = state.accounts[normalized]
  const role = saved?.role ?? draftRole
  const account: Account = saved ?? { username: normalized, role }

  return {
    ...state,
    accounts: {
      ...state.accounts,
      [normalized]: account,
    },
    session: { username: normalized, role },
  }
}

export function logout(state: AuthState): AuthState {
  return {
    ...state,
    session: null,
  }
}
