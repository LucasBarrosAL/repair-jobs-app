import { useRouter } from 'expo-router'
import type { ReactElement } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import type { Job } from '@/domain/types'
import { theme } from '@/theme/tokens'
import { JobRow } from '@/features/jobs/JobRow'

type JobListProps = {
  jobs: Job[]
  empty: ReactElement
}

export function JobList({ jobs, empty }: JobListProps) {
  const router = useRouter()

  return (
    <FlatList
      data={jobs}
      keyExtractor={(job) => job.id}
      renderItem={({ item }) => <JobRow job={item} onPress={() => router.push(`/jobs/${item.id}`)} />}
      ListEmptyComponent={empty}
      contentContainerStyle={jobs.length === 0 ? styles.emptyList : styles.list}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: theme.space.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
})
