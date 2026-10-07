import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderRouter } from 'expo-router/testing-library'
import type { ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { installDeferredStorageRead } from '@/test/deferStorage'

export type RenderAppOptions = {
  waitForHydration?: boolean
  deferredStorageRead?: Promise<string | null>
}

export async function renderApp(initialUrl = '/', options: RenderAppOptions = {}) {
  const waitForHydration = options.waitForHydration ?? true

  if (options.deferredStorageRead) {
    installDeferredStorageRead(options.deferredStorageRead)
  }

  if (waitForHydration) {
    await useAppStore.persist.rehydrate()
  } else if (options.deferredStorageRead) {
    void useAppStore.persist.rehydrate()
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })

  const rendered = renderRouter('src/app', {
    initialUrl,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return rendered
}
