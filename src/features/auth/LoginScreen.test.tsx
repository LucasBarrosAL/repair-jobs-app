import AsyncStorage from '@react-native-async-storage/async-storage'
import { screen, userEvent } from '@testing-library/react-native'
import { initialAppState, useAppStore } from '@/store/appStore'
import { renderApp } from '@/test/renderApp'

beforeEach(async () => {
  await AsyncStorage.clear()
  await useAppStore.setState(initialAppState)
})

it('disables Continue when the username is blank', async () => {
  await renderApp('/')
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})

it('disables Continue when the username is whitespace', async () => {
  await renderApp('/')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Username'), '   ')
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})

it('enables Continue when the trimmed username has a character', async () => {
  await renderApp('/')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Username'), '  sam')
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
})

it('opens Jobs after Continue', async () => {
  await renderApp('/')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Username'), 'sam')
  await user.press(screen.getByRole('button', { name: 'Continue' }))
  expect(await screen.findByRole('header', { name: 'Jobs' })).toBeOnTheScreen()
})

it('locks the selector to the saved role', async () => {
  await useAppStore.setState({
    accounts: { sam: { username: 'sam', role: 'pro' } },
  })
  await renderApp('/')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Username'), 'sam')

  expect(screen.getByRole('radio', { name: 'Pro' })).toBeSelected()
  expect(screen.getByRole('radio', { name: 'Client' })).toBeDisabled()
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
})

it('returns to an empty Login after logout', async () => {
  await useAppStore.setState({
    accounts: { sam: { username: 'sam', role: 'client' } },
    session: { username: 'sam', role: 'client' },
  })
  await renderApp('/jobs')
  const user = userEvent.setup()
  await user.press(screen.getByRole('button', { name: 'Settings' }))
  await user.press(screen.getByRole('button', { name: 'Log out' }))

  expect(screen.getByLabelText('Username')).toHaveDisplayValue('')
  expect(screen.getByRole('radio', { name: 'Client' })).toBeSelected()
  expect(screen.getByRole('radio', { name: 'Client' })).toBeEnabled()
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeEnabled()
})

it('resets the selector to Client after leaving a saved username', async () => {
  await useAppStore.setState({
    accounts: { sam: { username: 'sam', role: 'pro' } },
  })
  await renderApp('/')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Username'), 'sam')
  await user.type(screen.getByLabelText('Username'), 'my')

  expect(screen.getByRole('radio', { name: 'Client' })).toBeSelected()
  expect(screen.getByRole('radio', { name: 'Client' })).toBeEnabled()
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeEnabled()
})

it('opens Jobs when a session already exists', async () => {
  await useAppStore.setState({
    accounts: { sam: { username: 'sam', role: 'client' } },
    session: { username: 'sam', role: 'client' },
  })
  await renderApp('/')
  expect(await screen.findByRole('header', { name: 'Jobs' })).toBeOnTheScreen()
})
