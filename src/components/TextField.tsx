import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { theme } from '@/theme/tokens'

type TextFieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  autoCapitalize?: TextInputProps['autoCapitalize']
  autoCorrect?: boolean
  multiline?: boolean
  error?: string | null
}

export function TextField({
  label,
  value,
  onChangeText,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  error,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: theme.space.sm,
  },
  label: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  input: {
    minHeight: theme.controlHeight,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.surface,
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
    paddingHorizontal: theme.space.md,
  },
  multiline: {
    minHeight: 96,
    paddingVertical: theme.space.md,
    textAlignVertical: 'top',
  },
  error: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
