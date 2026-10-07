import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusTag } from '@/components/StatusTag'
import { formatCreatedAt } from '@/domain/createdAt'
import type { Job } from '@/domain/types'
import { theme } from '@/theme/tokens'

type JobRowProps = {
  job: Job
  onPress: () => void
}

export function JobRow({ job, onPress }: JobRowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={job.title} onPress={onPress} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.date}>{formatCreatedAt(job.createdAt)}</Text>
      </View>
      <StatusTag status={job.status} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: theme.controlHeight,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space.lg,
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  copy: {
    gap: theme.space.xs,
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  date: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
