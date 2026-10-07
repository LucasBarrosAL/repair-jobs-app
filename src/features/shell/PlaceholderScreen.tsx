import { StyleSheet, Text, View } from 'react-native'

export function PlaceholderScreen() {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header">Repair jobs</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
