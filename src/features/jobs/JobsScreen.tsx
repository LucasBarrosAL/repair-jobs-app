import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '@/store/appStore'
import { theme } from '@/theme/tokens'

export function JobsScreen() {
  const logout = useAppStore((state) => state.logout)
  const router = useRouter()

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
        <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={onLogout} style={styles.logout}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
  },
  header: {
    minHeight: theme.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
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
})
