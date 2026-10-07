import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistKey } from '@/store/appStore'

export type DeferredStorageRead = {
  read: Promise<string | null>
  resolve: (value: string | null) => void
}

export function createDeferredStorageRead(): DeferredStorageRead {
  let resolve: (value: string | null) => void = () => undefined
  const read = new Promise<string | null>((settle) => {
    resolve = settle
  })
  return { read, resolve }
}

export function installDeferredStorageRead(read: Promise<string | null>): void {
  const getItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
  getItem.mockImplementation((key: string) => {
    if (key === persistKey) {
      return read
    }
    return Promise.resolve(null)
  })
}
