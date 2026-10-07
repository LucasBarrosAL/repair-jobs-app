import { Image, StyleSheet, Text, View } from 'react-native'
import type { Role } from '@/domain/types'
import { theme } from '@/theme/tokens'

const copy: Record<Role, { heading: string; body: string }> = {
  client: {
    heading: 'No jobs yet',
    body: 'Create a repair job to get started.',
  },
  pro: {
    heading: 'No jobs to pick up',
    body: 'New repair jobs will show up here.',
  },
}

type EmptyJobsProps = {
  role: Role
}

export function EmptyJobs({ role }: EmptyJobsProps) {
  const message = copy[role]

  return (
    <View style={styles.empty}>
      <Image source={require('../../../assets/images/empty-jobs.png')} style={styles.image} accessible={false} />
      <Text accessibilityRole="header" style={styles.heading}>
        {message.heading}
      </Text>
      <Text style={styles.body}>{message.body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: theme.space.sm,
    paddingVertical: theme.space.xl,
  },
  image: {
    width: 160,
    height: 160,
  },
  heading: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
    textAlign: 'center',
  },
  body: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
    textAlign: 'center',
  },
})
