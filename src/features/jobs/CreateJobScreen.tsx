import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useCreateJob } from '@/features/jobs/hooks/useJobMutations'
import { theme } from '@/theme/tokens'

export function CreateJobScreen() {
  const createJob = useCreateJob()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      setTitle('')
      setDescription('')
      setError(null)
    }, []),
  )

  function onTitleChange(next: string) {
    setTitle(next)
    if (next.trim().length >= 1) {
      setError(null)
    }
  }

  async function onCreate() {
    const result = await createJob.mutateAsync({ title, description })
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.replace('/jobs')
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={24} color={theme.color.primary} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          New job
        </Text>
      </View>
      <TextField label="Title" value={title} onChangeText={onTitleChange} error={error} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline />
      <Button label="Create job" onPress={() => void onCreate()} />
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
  header: {
    minHeight: theme.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  close: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
})
