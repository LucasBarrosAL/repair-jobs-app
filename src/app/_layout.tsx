import { focusManager, QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useContext } from 'react'
import { AppState } from 'react-native'
import type { AppStateStatus } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SessionGate } from '@/features/shell/SessionGate'

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    handleFocus(status === 'active')
  })

  return () => {
    subscription.remove()
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function RootLayout() {
  const parentClient = useContext(QueryClientContext)
  const content = (
    <SafeAreaProvider>
      <SessionGate>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionGate>
    </SafeAreaProvider>
  )

  if (parentClient) {
    return content
  }

  return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
}
