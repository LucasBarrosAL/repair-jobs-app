export type Role = 'client' | 'pro'

export type Account = {
  username: string
  role: Role
}

export type Session = {
  username: string
  role: Role
}

export type JobStatus = 'open' | 'claimed' | 'completed'

export type Job = {
  id: string
  title: string
  description: string
  status: JobStatus
  createdBy: string
  claimedBy: string | null
  createdAt: string
}

export type DummyTodo = {
  id: number
  todo: string
  completed: boolean
  userId: number
}
