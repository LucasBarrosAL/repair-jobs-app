import { createLocalId } from '@/domain/ids'
import { materializeRemoteJob } from '@/domain/jobs'

it('prefixes local and remote ids differently', () => {
  const localId = createLocalId()
  const remoteId = materializeRemoteJob({
    id: 7,
    todo: 'Paint door',
    completed: false,
    userId: 26,
  }).id

  expect(localId).toMatch(/^local_\d+$/)
  expect(remoteId.startsWith('remote_')).toBe(true)
  expect(localId).not.toBe(remoteId)
})
