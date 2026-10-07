import { useVisibleJobs } from '@/features/jobs/hooks/useVisibleJobs'

const emptyCopy = {
  client: {
    heading: 'No jobs yet',
    body: 'Create a repair job to get started.',
  },
  pro: {
    heading: 'No jobs to pick up',
    body: 'New repair jobs will show up here.',
  },
} as const

const loadErrorMessage = "Couldn't load available jobs."

export function useJobs() {
  const visible = useVisibleJobs()
  const isPro = visible.session?.role === 'pro'

  return {
    jobs: visible.jobs,
    isLoading: visible.isLoading,
    isRefetching: visible.isRefetching,
    refetch: visible.refetch,
    canCreate: visible.session?.role === 'client',
    empty: isPro ? emptyCopy.pro : emptyCopy.client,
    loadError: visible.isError ? loadErrorMessage : null,
  }
}
