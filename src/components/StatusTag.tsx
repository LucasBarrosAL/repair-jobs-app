import { StyleSheet, Text, View } from 'react-native'
import type { JobStatus } from '@/domain/types'
import { theme } from '@/theme/tokens'

type StatusTagProps = {
  status: JobStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return (
    <View style={[styles.tag, styles[status]]}>
      <Text style={[styles.label, textStyles[status]]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xs,
  },
  label: {
    fontSize: theme.font.tag.fontSize,
    lineHeight: theme.font.tag.lineHeight,
  },
  open: {
    backgroundColor: theme.color.statusOpenFill,
  },
  claimed: {
    backgroundColor: theme.color.statusClaimedFill,
  },
  completed: {
    backgroundColor: theme.color.statusCompletedFill,
  },
})

const textStyles = StyleSheet.create({
  open: {
    color: theme.color.statusOpenText,
  },
  claimed: {
    color: theme.color.statusClaimedText,
  },
  completed: {
    color: theme.color.statusCompletedText,
  },
})
