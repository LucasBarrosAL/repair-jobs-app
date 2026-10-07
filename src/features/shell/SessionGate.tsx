import { Redirect, usePathname } from 'expo-router'
import type { ReactNode } from 'react'
import { LoadingPlaceholder } from '@/components/LoadingPlaceholder'
import { useAppStore } from '@/store/appStore'
import { useHasHydrated } from '@/store/useHasHydrated'

type SessionGateProps = {
  children: ReactNode
}

export function SessionGate({ children }: SessionGateProps) {
  const hydrated = useHasHydrated()
  const session = useAppStore((state) => state.session)
  const pathname = usePathname()

  if (!hydrated) {
    return <LoadingPlaceholder />
  }

  const onJobs = pathname === '/jobs' || pathname.startsWith('/jobs/')

  return (
    <>
      {session && pathname === '/' ? <Redirect href="/jobs" /> : null}
      {!session && onJobs ? <Redirect href="/" /> : null}
      {children}
    </>
  )
}
