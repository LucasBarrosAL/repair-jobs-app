import { StyleSheet, View } from 'react-native'
import { theme } from '@/theme/tokens'

export function LoadingPlaceholder() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading jobs"
      style={styles.screen}
    />
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
})
