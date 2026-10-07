import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { jobsForClient } from '@/domain/jobs'
import { useAppStore } from '@/store/appStore'
import { useHasHydrated } from '@/store/useHasHydrated'
import { theme } from '@/theme/tokens'
import { EmptyJobs } from '@/features/jobs/EmptyJobs'
import { JobListSkeleton } from '@/features/jobs/JobListSkeleton'
import { JobRow } from '@/features/jobs/JobRow'

export function JobsScreen() {
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const logout = useAppStore((state) => state.logout)
  const hydrated = useHasHydrated()
  const router = useRouter()
  const visibleJobs = session?.role === 'client' ? jobsForClient(jobs, session.username) : []

  function onLogout() {
    logout()
    router.replace('/')
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Jobs
        </Text>
        <View style={styles.actions}>
          {session?.role === 'client' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create job"
              onPress={() => router.push('/jobs/create')}
              style={styles.iconButton}
            >
              <Ionicons name="add" size={28} color={theme.color.primary} />
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={onLogout} style={styles.logout}>
            <Text style={styles.logoutLabel}>Log out</Text>
          </Pressable>
        </View>
      </View>
      {hydrated ? (
        <FlatList
          data={visibleJobs}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobRow job={item} onPress={() => router.push(`/jobs/${item.id}`)} />}
          ListEmptyComponent={session ? <EmptyJobs role={session.role} /> : null}
          contentContainerStyle={visibleJobs.length === 0 ? styles.emptyList : styles.list}
        />
      ) : (
        <JobListSkeleton />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
    gap: theme.space.md,
  },
  header: {
    minHeight: theme.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  iconButton: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: {
    minHeight: theme.controlHeight,
    justifyContent: 'center',
  },
  logoutLabel: {
    color: theme.color.primary,
    fontSize: theme.font.button.fontSize,
    lineHeight: theme.font.button.lineHeight,
  },
  list: {
    paddingBottom: theme.space.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
})
