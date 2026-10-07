import { currentPathname } from '@/features/shell/currentPathname'

const originalLocation = globalThis.location

afterEach(() => {
  if (originalLocation) {
    globalThis.location = originalLocation
  } else {
    delete (globalThis as { location?: Location }).location
  }
})

function setLocation(pathname: string) {
  ;(globalThis as { location?: { pathname: string } }).location = { pathname }
}

it('keeps the router path when the address bar matches', () => {
  setLocation('/jobs')
  expect(currentPathname('/jobs')).toBe('/jobs')
})

it('uses a deeper address-bar path that the router dropped', () => {
  setLocation('/jobs/create')
  expect(currentPathname('/jobs')).toBe('/jobs/create')
})

it('keeps the router path when the address bar is outside the app', () => {
  setLocation('/about')
  expect(currentPathname('/jobs/create')).toBe('/jobs/create')
})

it('keeps the router path when the address bar is shallower', () => {
  setLocation('/')
  expect(currentPathname('/jobs/create')).toBe('/jobs/create')
})
