import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '@/store/appStore'
import { theme } from '@/theme/tokens'
import { JobsMenu } from '@/features/jobs/JobsMenu'

type JobsFrameProps = {
  children: ReactNode
  onCreate?: () => void
  banner?: ReactNode
}

export function JobsFrame({ children, onCreate, banner }: JobsFrameProps) {
  const logout = useAppStore((state) => state.logout)
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

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
          {onCreate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create job"
              onPress={onCreate}
              style={styles.iconButton}
            >
              <Ionicons name="add" size={28} color={theme.color.primary} />
            </Pressable>
          ) : null}
          <JobsMenu open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onLogout={onLogout} />
        </View>
      </View>
      {banner}
      {children}
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
})
