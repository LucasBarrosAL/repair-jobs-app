import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/theme/tokens'

export function JobUnavailable() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.body}>This job is no longer available.</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
  },
  body: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
