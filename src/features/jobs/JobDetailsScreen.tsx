import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/Button'
import { StatusTag } from '@/components/StatusTag'
import { formatCreatedAt } from '@/domain/createdAt'
import { jobsForClient, jobsForPro } from '@/domain/jobs'
import type { DummyTodo, Job, Session } from '@/domain/types'
import { useAppStore } from '@/store/appStore'
import { theme } from '@/theme/tokens'
import { useRemoteTodos } from '@/features/jobs/useRemoteTodos'

export function JobDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id
  const session = useAppStore((state) => state.session)
  const jobs = useAppStore((state) => state.jobs)
  const deleteJob = useAppStore((state) => state.deleteJob)
  const claimJob = useAppStore((state) => state.claimJob)
  const completeJob = useAppStore((state) => state.completeJob)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const todosQuery = useRemoteTodos(session?.role === 'pro')
  const job = visibleJob(jobs, todosQuery.data ?? [], session, jobId)

  function onClaim() {
    if (!job) {
      return
    }
    const todo = todosQuery.data?.find((item) => `remote_${item.id}` === job.id) ?? null
    claimJob(job.id, todo)
  }

  function onComplete() {
    if (!job) {
      return
    }
    completeJob(job.id)
  }

  function onDelete() {
    if (!job) {
      return
    }
    const result = deleteJob(job.id)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.replace('/jobs')
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.body}>This job is no longer available.</Text>
      </SafeAreaView>
    )
  }

  const assignee = job.claimedBy === null ? 'Pro: Unassigned' : `Pro: ${job.claimedBy}`

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={theme.color.primary} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          {job.title}
        </Text>
        {job.description ? <Text style={styles.body}>{job.description}</Text> : null}
        <StatusTag status={job.status} />
        <Text style={styles.body}>{assignee}</Text>
        <Text style={styles.caption}>Posted</Text>
        <Text style={styles.body}>{formatCreatedAt(job.createdAt)}</Text>
      </View>
      <View style={styles.actions}>
        {session?.role === 'pro' ? (
          <>
            <Button label="Claim" onPress={onClaim} disabled={job.status !== 'open'} />
            <Button
              label="Mark as completed"
              onPress={onComplete}
              disabled={job.status !== 'claimed' || job.claimedBy !== session.username}
            />
          </>
        ) : (
          <Button label="Delete" variant="destructive" onPress={onDelete} />
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

function visibleJob(
  jobs: Job[],
  todos: DummyTodo[],
  session: Session | null,
  jobId: string | undefined,
): Job | undefined {
  if (!session || !jobId) {
    return undefined
  }
  if (session.role === 'client') {
    return jobsForClient(jobs, session.username).find((item) => item.id === jobId)
  }

  const listed = jobsForPro(jobs, todos, session.username).find((item) => item.id === jobId)
  if (listed) {
    return listed
  }

  return jobs.find((item) => item.id === jobId && item.claimedBy === session.username && item.status === 'completed')
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
    justifyContent: 'space-between',
  },
  content: {
    gap: theme.space.md,
  },
  back: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  body: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  caption: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  actions: {
    gap: theme.space.sm,
  },
  error: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
