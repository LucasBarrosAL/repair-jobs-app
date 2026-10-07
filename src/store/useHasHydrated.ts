import { useSyncExternalStore } from 'react'
import { useAppStore } from '@/store/appStore'

function subscribe(onStoreChange: () => void): () => void {
  return useAppStore.persist.onFinishHydration(onStoreChange)
}

function getHydrated(): boolean {
  return useAppStore.persist.hasHydrated()
}

export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribe, getHydrated, () => false)
}
