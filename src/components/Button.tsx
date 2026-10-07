import { Pressable, StyleSheet, Text } from 'react-native'
import { theme } from '@/theme/tokens'

type ButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'destructive'
}

export function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        disabled ? styles.disabled : variant === 'destructive' ? styles.destructive : styles.primary,
        pressed && !disabled && (variant === 'destructive' ? styles.destructivePressed : styles.pressed),
      ]}
    >
      <Text style={[styles.label, disabled ? styles.disabledLabel : styles.enabledLabel]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.controlHeight,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  primary: {
    backgroundColor: theme.color.primary,
  },
  pressed: {
    backgroundColor: theme.color.primaryPressed,
  },
  destructive: {
    backgroundColor: theme.color.destructive,
  },
  destructivePressed: {
    backgroundColor: theme.color.destructivePressed,
  },
  disabled: {
    backgroundColor: theme.color.disabledFill,
  },
  label: {
    fontSize: theme.font.button.fontSize,
    lineHeight: theme.font.button.lineHeight,
  },
  enabledLabel: {
    color: theme.color.onPrimary,
  },
  disabledLabel: {
    color: theme.color.disabledText,
  },
})
