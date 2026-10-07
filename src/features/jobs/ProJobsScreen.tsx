import { StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/Button'
import { jobsForPro } from '@/domain/jobs'
import { useAppStore } from '@/store/appStore'
import { useHasHydrated } from '@/store/useHasHydrated'
import { theme } from '@/theme/tokens'
import { EmptyJobs } from '@/features/jobs/EmptyJobs'
import { JobList } from '@/features/jobs/JobList'
import { JobListSkeleton } from '@/features/jobs/JobListSkeleton'
import { JobsFrame } from '@/features/jobs/JobsFrame'
import { useRemoteTodos } from '@/features/jobs/useRemoteTodos'

export function ProJobsScreen() {
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const hydrated = useHasHydrated()
  const todosQuery = useRemoteTodos(true)
  const visibleJobs = session ? jobsForPro(jobs, todosQuery.data ?? [], session.username) : []
  const showSkeleton = !hydrated || todosQuery.isLoading

  return (
    <JobsFrame
      banner={
        todosQuery.isError ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{"Couldn't load available jobs."}</Text>
            <Button label="Retry" onPress={() => void todosQuery.refetch()} />
          </View>
        ) : null
      }
    >
      {showSkeleton ? <JobListSkeleton /> : <JobList jobs={visibleJobs} empty={<EmptyJobs role="pro" />} />}
    </JobsFrame>
  )
}

const styles = StyleSheet.create({
  banner: {
    gap: theme.space.sm,
  },
  bannerText: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
