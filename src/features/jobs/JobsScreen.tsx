import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/Button'
import { jobsForClient, jobsForPro } from '@/domain/jobs'
import { useAppStore } from '@/store/appStore'
import { useHasHydrated } from '@/store/useHasHydrated'
import { theme } from '@/theme/tokens'
import { EmptyJobs } from '@/features/jobs/EmptyJobs'
import { JobListSkeleton } from '@/features/jobs/JobListSkeleton'
import { JobRow } from '@/features/jobs/JobRow'
import { JobsMenu } from '@/features/jobs/JobsMenu'
import { useRemoteTodos } from '@/features/jobs/useRemoteTodos'

export function JobsScreen() {
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const logout = useAppStore((state) => state.logout)
  const hydrated = useHasHydrated()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const isPro = session?.role === 'pro'
  const todosQuery = useRemoteTodos(isPro)
  const visibleJobs = !session
    ? []
    : session.role === 'client'
      ? jobsForClient(jobs, session.username)
      : jobsForPro(jobs, todosQuery.data ?? [], session.username)
  const showSkeleton = !hydrated || (isPro && todosQuery.isLoading)

  function onLogout() {
    logout()
    router.replace('/')
  }

  return (
    <SafeAreaView style={styles.screen}>
      {menuOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}
          style={styles.backdrop}
        />
      ) : null}
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
          <JobsMenu open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onLogout={onLogout} />
        </View>
      </View>
      {isPro && todosQuery.isError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{"Couldn't load available jobs."}</Text>
          <Button label="Retry" onPress={() => void todosQuery.refetch()} />
        </View>
      ) : null}
      {showSkeleton ? (
        <JobListSkeleton />
      ) : (
        <FlatList
          data={visibleJobs}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobRow job={item} onPress={() => router.push(`/jobs/${item.id}`)} />}
          ListEmptyComponent={session ? <EmptyJobs role={session.role} /> : null}
          contentContainerStyle={visibleJobs.length === 0 ? styles.emptyList : styles.list}
        />
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
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  header: {
    zIndex: 2,
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
  list: {
    paddingBottom: theme.space.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  banner: {
    gap: theme.space.sm,
  },
  bannerText: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
