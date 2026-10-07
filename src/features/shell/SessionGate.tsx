import type { ReactNode } from 'react'
import { LoadingPlaceholder } from '@/components/LoadingPlaceholder'
import { useHasHydrated } from '@/store/useHasHydrated'

type SessionGateProps = {
  children: ReactNode
}

export function SessionGate({ children }: SessionGateProps) {
  const hydrated = useHasHydrated()

  if (!hydrated) {
    return <LoadingPlaceholder />
  }

  return children
}
