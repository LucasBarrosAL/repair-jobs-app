import { StyleSheet, View } from 'react-native'
import { theme } from '@/theme/tokens'

export function JobListSkeleton() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading jobs" style={styles.list}>
      <View style={styles.row} />
      <View style={styles.row} />
      <View style={styles.row} />
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: theme.space.md,
  },
  row: {
    height: 72,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.border,
  },
})
