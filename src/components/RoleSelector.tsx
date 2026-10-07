import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Role } from '@/domain/types'
import { theme } from '@/theme/tokens'

const roles: { value: Role; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'pro', label: 'Pro' },
]

type RoleSelectorProps = {
  value: Role
  locked: boolean
  onChange: (role: Role) => void
}

export function RoleSelector({ value, locked, onChange }: RoleSelectorProps) {
  return (
    <View style={styles.roles}>
      {roles.map((role) => {
        const selected = value === role.value
        return (
          <Pressable
            key={role.value}
            accessibilityRole="radio"
            accessibilityLabel={role.label}
            accessibilityState={{ selected, disabled: locked }}
            disabled={locked}
            onPress={() => onChange(role.value)}
            style={styles.role}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.roleLabel, locked && styles.roleLabelLocked]}>{role.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  roles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xl,
  },
  role: {
    minHeight: theme.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
  },
  radioSelected: {
    borderColor: theme.color.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.color.primary,
  },
  roleLabel: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  roleLabelLocked: {
    color: theme.color.disabledText,
  },
})
