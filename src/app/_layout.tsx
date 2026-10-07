import { focusManager, QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query'
import { Stack, usePathname, useRouter } from 'expo-router'
import { useContext, useEffect } from 'react'
import { AppState } from 'react-native'
import type { AppStateStatus } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SessionGate } from '@/features/shell/SessionGate'
import { useAppStore } from '@/store/appStore'

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
        <RootNavigator />
      </SessionGate>
    </SafeAreaProvider>
  )

  if (parentClient) {
    return content
  }

  return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
}

function RootNavigator() {
  const session = useAppStore((state) => state.session)
  const pathname = usePathname()
  const router = useRouter()
  const onJobs = pathname === '/jobs' || pathname.startsWith('/jobs/')

  useEffect(() => {
    if (session && pathname === '/') {
      router.replace('/jobs')
      return
    }
    if (!session && onJobs) {
      router.replace('/')
    }
  }, [onJobs, pathname, router, session])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={session === null}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="jobs" />
      </Stack.Protected>
    </Stack>
  )
}
