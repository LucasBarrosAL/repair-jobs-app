import { Stack, usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { currentPathname } from '@/features/shell/currentPathname'
import { useAppStore } from '@/store/appStore'

export default function JobsLayout() {
  const role = useAppStore((state) => state.session?.role)
  const pathname = currentPathname(usePathname())
  const router = useRouter()
  const blockCreate = role !== 'client' && (pathname === '/jobs/create' || pathname.startsWith('/jobs/create/'))

  useEffect(() => {
    if (blockCreate) {
      router.replace('/jobs')
    }
  }, [blockCreate, router])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Protected guard={role === 'client'}>
        <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  )
}
