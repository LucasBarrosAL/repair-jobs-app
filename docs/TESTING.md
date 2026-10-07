# Testing

Run tests with Jest through the `jest-expo` preset, and render screens with React Native Testing Library (RNTL). The named cases, their setup, and their assertions are in `DEVELOPMENT_PLAN.md`. This guide is how to write those tests.

RNTL's guiding principle is to exercise the UI the way a person would, and to assert what that person can perceive. TanStack Query's testing guidance is a fresh client per test with retries off. Business rules stay pure, so their tests need no renderer.

## Layout

- Use the `jest-expo` preset and a setup file at `src/test/setup.ts`.
- Put `*.test.ts` and `*.test.tsx` next to the code they cover, outside `src/app`. Expo Router treats files in `src/app` as routes.
- Name the behavior under test: `disables Continue when the username is blank`.
- Cover one behavior per test.
- In `beforeEach`, reset the Zustand store and clear AsyncStorage.
- Create a new `QueryClient` for each test. Set `retry: false` on queries and mutations.
- Mock `@react-native-async-storage/async-storage` with the Jest mock shipped by that package.
- Mock `fetch` in screen tests that read DummyJSON. Domain tests do not call the network.
- Build a new `QueryClient` inside `src/test/renderApp.tsx`, and render flows that change screens with `renderRouter` from `expo-router/testing-library`.

## Screen tests

- Find elements with `getByRole`, then `getByLabelText`, then `getByText`.
- Drive the UI with `userEvent.setup()`, then `press` and `type`.
- Use `findBy*` after a press or a request, when the update is asynchronous.
- Use the matchers that ship with RNTL, including `toBeDisabled` and `toBeOnTheScreen`.
- Leave `@testing-library/jest-native` uninstalled. Leave DOM matchers such as `toBeInTheDocument` unused.
- The row and the details screen show the creation date and time from `createdAt`, in the UTC format from `DEVELOPMENT_PLAN.md`. Assert that exact string.
- Leave snapshot assertions out of these flows.

```tsx
it('disables Continue when the username is blank', async () => {
  await renderApp('/')
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})
```

## What a screen test asserts

Assert what a person can see or operate:

- Visible copy, including the exact delete error string.
- Whether a control is enabled or disabled.
- The screen that follows an action, and the text that is present or gone there.
- The status tag text on a row.
- The loading placeholder while a request is still pending.

Assert store contents in unit tests. A screen test that deletes an unclaimed job asserts that the job title is gone from the Jobs list. The matching unit test asserts that the job array no longer contains that id.

## Unit tests of business rules

- Test the functions in `src/domain`. Those tests import no React renderer, no `fetch`, and no AsyncStorage.
- Pass `now` and the new id in as arguments so the result is fixed.
- Assert the returned value: the next accounts, the next session, the next jobs, or the error message.
- Cover the boundaries named in the plan: blank input, surrounding spaces, a claim owned by someone else, and a completed job.

```ts
it('keeps a claimed job stored', () => {
  const result = deleteJob([claimedJob], claimedJob.id)
  expect(result).toEqual({
    ok: false,
    jobs: [claimedJob],
    message: "This job has been claimed and can't be deleted.",
  })
})
```

## Commands

- `npm test` runs the suite.
- `npm test -- src/domain/jobs.test.ts` runs one file.
