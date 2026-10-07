export function currentPathname(routerPathname: string): string {
  const locationPath = (globalThis as { location?: { pathname?: string } }).location?.pathname
  if (!locationPath || locationPath === routerPathname) {
    return routerPathname
  }

  const isAppPath = locationPath === '/' || locationPath === '/jobs' || locationPath.startsWith('/jobs/')
  if (!isAppPath) {
    return routerPathname
  }

  if (locationPath.startsWith(routerPathname) && locationPath.length > routerPathname.length) {
    return locationPath
  }

  return routerPathname
}
