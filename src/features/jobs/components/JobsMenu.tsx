import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '@/theme/tokens'

type JobsMenuProps = {
  open: boolean
  onToggle: () => void
  onLogout: () => void
}

export function JobsMenu({ open, onToggle, onLogout }: JobsMenuProps) {
  return (
    <View style={styles.anchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={styles.iconButton}
      >
        <Ionicons name="settings-outline" size={24} color={theme.color.primary} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={onLogout}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.label}>Log out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
  },
  iconButton: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: theme.space.xs,
    minWidth: 160,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingVertical: theme.space.xs,
    shadowColor: theme.color.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    minHeight: theme.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  itemPressed: {
    backgroundColor: theme.color.border,
  },
  label: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
})
