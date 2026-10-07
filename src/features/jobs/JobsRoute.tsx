import { useAppStore } from '@/store/appStore'
import { ClientJobsScreen } from '@/features/jobs/ClientJobsScreen'
import { ProJobsScreen } from '@/features/jobs/ProJobsScreen'

export function JobsRoute() {
  const role = useAppStore((state) => state.session?.role)

  if (role === 'pro') {
    return <ProJobsScreen />
  }

  if (role === 'client') {
    return <ClientJobsScreen />
  }

  return null
}
