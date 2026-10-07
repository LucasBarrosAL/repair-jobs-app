import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { isUsernameValid, nextDraftRole, resolveRole } from '@/domain/auth'
import type { Role } from '@/domain/types'
import { useAppStore } from '@/store/appStore'
import { theme } from '@/theme/tokens'

const roles: { value: Role; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'pro', label: 'Pro' },
]

export function LoginScreen() {
  const accounts = useAppStore((state) => state.accounts)
  const login = useAppStore((state) => state.login)
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [draftRole, setDraftRole] = useState<Role>('client')
  const resolution = resolveRole(accounts, username, draftRole)
  const canContinue = isUsernameValid(username)

  useFocusEffect(
    useCallback(() => {
      setUsername('')
      setDraftRole('client')
    }, []),
  )

  function onUsernameChange(next: string) {
    setDraftRole((current) => nextDraftRole(username, next, accounts, current))
    setUsername(next)
  }

  function onContinue() {
    login(username, draftRole)
    router.replace('/jobs')
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Repair jobs
      </Text>
      <TextField
        label="Username"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.roles}>
        {roles.map((role) => {
          const selected = resolution.role === role.value
          return (
            <Pressable
              key={role.value}
              accessibilityRole="radio"
              accessibilityLabel={role.label}
              accessibilityState={{ selected, disabled: resolution.locked }}
              disabled={resolution.locked}
              onPress={() => setDraftRole(role.value)}
              style={[styles.role, selected && styles.roleSelected]}
            >
              <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{role.label}</Text>
            </Pressable>
          )
        })}
      </View>
      <Button label="Continue" onPress={onContinue} disabled={!canContinue} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
    gap: theme.space.lg,
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  roles: {
    flexDirection: 'row',
    gap: theme.space.md,
  },
  role: {
    flex: 1,
    minHeight: theme.controlHeight,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSelected: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primary,
  },
  roleLabel: {
    color: theme.color.text,
    fontSize: theme.font.button.fontSize,
    lineHeight: theme.font.button.lineHeight,
  },
  roleLabelSelected: {
    color: theme.color.onPrimary,
  },
})
