import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusTag } from '@/components/StatusTag'
import { formatCreatedAt } from '@/domain/createdAt'
import type { Job } from '@/domain/types'
import { theme } from '@/theme/tokens'

type JobDetailsBodyProps = {
  job: Job
  actions: ReactNode
  error?: string | null
}

export function JobDetailsBody({ job, actions, error }: JobDetailsBodyProps) {
  const router = useRouter()
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
        {actions}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
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
