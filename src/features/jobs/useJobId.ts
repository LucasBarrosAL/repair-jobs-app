import { useLocalSearchParams } from 'expo-router'

export function useJobId(): string | undefined {
  const params = useLocalSearchParams<{ id: string }>()
  return Array.isArray(params.id) ? params.id[0] : params.id
}
