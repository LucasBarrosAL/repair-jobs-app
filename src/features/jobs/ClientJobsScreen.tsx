import { useRouter } from 'expo-router'
import { jobsForClient } from '@/domain/jobs'
import { useAppStore } from '@/store/appStore'
import { useHasHydrated } from '@/store/useHasHydrated'
import { EmptyJobs } from '@/features/jobs/EmptyJobs'
import { JobList } from '@/features/jobs/JobList'
import { JobListSkeleton } from '@/features/jobs/JobListSkeleton'
import { JobsFrame } from '@/features/jobs/JobsFrame'

export function ClientJobsScreen() {
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const hydrated = useHasHydrated()
  const router = useRouter()
  const visibleJobs = session ? jobsForClient(jobs, session.username) : []

  return (
    <JobsFrame onCreate={() => router.push('/jobs/create')}>
      {hydrated ? <JobList jobs={visibleJobs} empty={<EmptyJobs role="client" />} /> : <JobListSkeleton />}
    </JobsFrame>
  )
}
