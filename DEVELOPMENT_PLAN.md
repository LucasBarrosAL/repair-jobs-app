# Development plan — Repair Jobs

A small Expo app where Clients post repair jobs and Pros claim and finish them. Everyone shares one phone: accounts and jobs live on the device, and DummyJSON supplies a read-only list of extra jobs for Pros.

This document is the execution plan for that app. `docs/CODE_STYLE.md` and `docs/TESTING.md` are the engineering rules. Every phase follows both guides.

## How to read this plan

A person can read the product, the architecture, and the phase order and understand what will be built.

An implementation agent executes one phase at a time, in order, and finishes that phase's tests before starting the next. Before writing code, the agent reads this file, `docs/CODE_STYLE.md`, and `docs/TESTING.md`.

Phase 1 is already done: the two guides exist. The product choices below are decided. Feature work starts at Phase 2.

`CONTEXT.md` is the hiring brief. The exercise prompt adds the stack, the username login, local sharing, delete, `createdAt`, and the test list. Where the prompt is more specific, this plan follows the prompt. The status word is `completed`. The row and details show the creation date and time from `createdAt`, not a relative age.

## Where the two sources already agree

- The app is Expo managed workflow and TypeScript. The prompt fixes the rest of the stack, listed under [Versions](#versions).
- Two roles share one app. A Client creates jobs and tracks them. A Pro claims open jobs and marks those claims finished.
- The login screen collects a username and a role. Logout ends the session. Signing in with a different username is how someone uses the other role. Each stored username has one role for its lifetime.
- On launch, a saved session opens Jobs. Logout clears that session and keeps accounts and jobs.
- A Client's list is the jobs that username created, including finished ones. A Pro's list is open jobs plus jobs that Pro has claimed and not yet finished.
- Creating a job collects a title and a short description. The app sets the creation time and the default status.
- The app reads DummyJSON and stores jobs on the device. DummyJSON writes are outside this design, because a later GET would drop them.
- Finished jobs stay stored for a later History screen. This plan does not add that screen.
- FlashList infinite scroll and the EAS preview build are optional and sit in the last phase.

## Copy

| Place | Text |
| --- | --- |
| Login title | Repair jobs |
| Username field | Username |
| Continue | Continue |
| Logout | Log out, in the Jobs header |
| Create entry | Ionicons `add`, accessibility label `Create job` |
| Create modal title | New job |
| Create fields | Title, Description |
| Create submit | Create job |
| Title validation error | Enter a title to create this job. |
| Client empty heading | No jobs yet |
| Client empty body | Create a repair job to get started. |
| Pro empty heading | No jobs to pick up |
| Pro empty body | New repair jobs will show up here. |
| Loading label | Loading jobs |
| Assignee when `claimedBy` is null | Pro: Unassigned |
| Assignee when set | Pro: {username} |
| Details date caption | Posted |
| Delete | Delete |
| Delete error | This job has been claimed and can't be deleted. |
| Claim | Claim |
| Complete | Mark as completed |
| Remote error | Couldn't load available jobs. |
| Retry | Retry |
| Missing job | This job is no longer available. |

## Visual system

One warm paper background, near-black text, a navy primary button, and a rose Delete button. Status tags use a pale fill and dark text. Body copy is 16px. Checked contrast is the WCAG ratio for those pairs.

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#F4F1EA` | Screen background |
| `surface` | `#FFFFFF` | Cards, fields, modal |
| `text` | `#1C1917` | Titles. 15.5:1 on `background` |
| `textBody` | `#44403C` | Body. 10.3:1 on `surface` |
| `border` | `#E7E5E4` | Hairlines, skeleton blocks |
| `primary` | `#123A5F` | Primary button fill. White label, 11.7:1 |
| `primaryPressed` | `#0D2C48` | Primary button while pressed |
| `onPrimary` | `#FFFFFF` | Label on primary and destructive buttons |
| `destructive` | `#9F1239` | Delete fill. White label, 8.0:1 |
| `destructivePressed` | `#881337` | Delete while pressed |
| `disabledFill` | `#E7E5E4` | Disabled button fill |
| `disabledText` | `#57534E` | Disabled label. 6.1:1 on `disabledFill` |
| `errorText` | `#9F1239` | Inline errors and the remote-error banner text |
| `statusOpenFill` / `statusOpenText` | `#E0F2FE` / `#0C4A6E` | Open tag, 8.2:1 |
| `statusClaimedFill` / `statusClaimedText` | `#FEF3C7` / `#78350F` | Claimed tag, 8.2:1 |
| `statusCompletedFill` / `statusCompletedText` | `#DCFCE7` / `#14532D` | Completed tag, 8.3:1 |

| Type | Size / line height |
| --- | --- |
| Screen title | 22 / 28 |
| Body | 16 / 24 |
| Button | 16 / 24 |
| Status tag | 14 / 20 |

Spacing scale: 4, 8, 12, 16, 24. Screen padding is 16. Card radius is 12. Button radius is 12. Minimum control height is 48. The system font is the only font.

Primary buttons use `primary` and `onPrimary`. Delete uses `destructive` and `onPrimary`. Disabled controls use `disabledFill` and `disabledText`.

Icons come from `@expo/vector-icons` Ionicons (`^15.0.2`, bundled with SDK 57). The create control uses the `add` glyph and the accessibility label `Create job`. Logout is the text button `Log out`.

The empty state, for both roles, shows `assets/images/empty-jobs.png` above the heading. The file is an original illustration, about 160 by 160, of a simple clipboard on the paper background, drawn in these colors. Phase 4 adds the file.

## Product

### People and data

All data for this exercise lives on one device. Every username used on that device is stored there. Jobs created by Clients live in the same local store. DummyJSON is the only remote source.

A username is the trimmed text from the field. It is valid when that trimmed text has at least one character. There is no other format rule. Matching is the exact trimmed string, so `Ada` and `ada` are different people. The field uses `autoCapitalize="none"` and `autoCorrect={false}` so the platform does not change the case the person typed.

A username has one role, `client` or `pro`, displayed as Client and Pro. The first login saves the role. A later login shows that role and the selector is disabled. The app will not store the same username again with the other role.

The role selector starts on Client. While the trimmed username matches a saved account, the selector shows that account's role and both options are disabled. When the field changes from a saved username to a name that is not saved, the selector enables and resets to Client, including when the person had chosen Pro before the field matched. A new name that never matched a saved account keeps the role they picked. Moving from one saved username to another saved username shows the new account's role and stays disabled.

The session is the username and role of the person currently signed in. It survives a restart. Logout sets the session to empty, returns to Login, and leaves accounts and jobs in place. The login screen then shows an empty username and Client, with the selector enabled. Returning to Login resets the form in a focus effect so the empty state does not depend on the screen unmounting.

Continue is enabled only when the trimmed username is valid. The role is always one of the two values: the Client default, the person's selection for a new name, or the saved role.

### Jobs

A job moves from `open`, to `claimed` by one Pro, to `completed`. The status tag and the stored value use those three words. The finish button says `Mark as completed`. New jobs start at `open`. Completed jobs remain in storage.

| Field | Meaning |
| --- | --- |
| `id` | Stable id. See [Identity](#identity). |
| `title` | The repair title. For a DummyJSON todo, this is the `todo` text. |
| `description` | The short description. |
| `status` | `open`, `claimed`, or `completed`. |
| `createdBy` | Username of the Client who owns the job. |
| `claimedBy` | Username of the Pro who claimed it, or `null` while it is open. |
| `createdAt` | ISO-8601 time. The Client does not type it. |

Client create sets `createdAt` to the time of creation, `createdBy` to the signed-in username, `claimedBy` to `null`, and `status` to `open`. The title and the description are stored trimmed. The title must contain at least one character after trim. The description may be empty. There is no max length. `Create job` stays enabled. Pressing it with an invalid title creates nothing, stays on the modal, and shows `Enter a title to create this job.` under the Title field in `errorText`. The message clears once the trimmed title has at least one character.

Delete has no confirmation step. The Delete button stays enabled on every job a Client can open.

- `claimedBy` is `null`: remove the job, persist the removal, and return to Jobs.
- `claimedBy` is set, including when the job is already finished: keep the job, stay on the details screen, and show `This job has been claimed and can't be deleted.` near the button.

A Pro has two actions at the bottom of details. Each successful action updates the job and persists it.

| Job state for this Pro | Claim | Mark finished |
| --- | --- | --- |
| `open` | Enabled | Disabled |
| Claimed by this username | Disabled | Enabled |
| Finished | Disabled | Disabled, and the job leaves the Pro list |
| Claimed by another username | The job is absent from this Pro's list and details | |

Finishing a job stays on the details screen so both buttons can show their disabled state. The Pro list omits that job as soon as the store updates. The record stays in storage.

Domain rules reject illegal transitions even if a control were pressed: claim applies only to an open job, and finish applies only to a job claimed by the signed-in username.

### Lists

The Jobs header title is `Jobs`, with `accessibilityRole="header"`. Clients also get the create button. Both roles get `Log out` in that header.

Every row is a button, opens Job Details, and shows the title, a status tag, and the creation date and time from `createdAt`. Lists are oldest first. Equal `createdAt` values break ties by `id` ascending.

**Client.** The list is jobs whose `createdBy` is the signed-in username, in every status. An empty list shows the empty state.

**Pro.** The list contains:

- local jobs created by other users that are `open`
- local jobs claimed by this username that are not finished

It omits jobs claimed by another username and omits finished jobs. A Pro username has a single role, so this person has no created jobs. The filter still excludes `createdBy === session.username` so a stray row cannot appear.

The Pro list is built from two sources:

1. The local jobs above.
2. `GET https://dummyjson.com/todos?limit=20`, keeping items whose `completed` is not `true`.

A remote todo is shown once. After a local job exists with that todo's id, the list uses the local record and drops the todo. The remote shape is turned into job fields with [the mock formula](#remote-jobs) both before and after claim, so the screen does not change those fields when the local copy is written.

The Client list does not call DummyJSON.

While the screen is loading, show a skeleton of three rows named `Loading jobs`. For a Pro, that lasts until hydration has finished and the todos request has settled. For a Client, it lasts until hydration has finished. If the Pro request fails, show the local matches, the banner `Couldn't load available jobs.`, and a Retry button that refetches.

### Job details

Show the title, description, status tag, the assignee line, and the creation date and time. The details caption is `Posted`, followed by the formatted date. An empty description renders no body text. Actions sit at the bottom of the screen, above the safe area.

- Client: the public fields, then a full-width Delete button.
- Pro: the public fields, then Claim, then the finish button, stacked full width.

If the id is neither a stored job this person may see nor a remote todo still visible to this Pro, show `This job is no longer available.`

### Create

The create control opens a modal route, `/jobs/create`. The form collects Title and Description. Dismissing the modal writes nothing. A successful create persists the job and returns to Jobs, which shows the new row without a restart.

### Remote jobs

Map a DummyJSON todo onto a job as follows. `n` is the numeric `id`. `userId` is ignored: it is not a username, and the prompt maps the todo text to the title and fills the remaining job fields from the remote id.

| Job field | Value |
| --- | --- |
| `id` | `remote_${n}` |
| `title` | The `todo` string, unchanged |
| `description` | `Repair job ${n}` |
| `status` | `open` until this Pro claims it |
| `createdBy` | `client-${n}` |
| `claimedBy` | `null` until claim, then the signed-in username |
| `createdAt` | `new Date(Date.UTC(2024, 0, 1) + n * 24 * 60 * 60 * 1000).toISOString()` |

Worked example for todo id `7`:

```text
id: remote_7
description: Repair job 7
createdBy: client-7
createdAt: 2024-01-08T00:00:00.000Z
status: open
claimedBy: null
```

Calling this mapping twice on the same todo returns equal field values. Claim writes that same object, then sets `status` to claimed and `claimedBy` to the current username. The title, description, `createdBy`, and `createdAt` stay on the mapped values.

### Identity

| Kind | Id | Example |
| --- | --- | --- |
| Created in the app | `local_` plus a UUID v4 | `local_3b1c...` |
| DummyJSON | `remote_` plus the numeric id | `remote_7` |

`createLocalId()` in `src/domain/ids.ts` uses `globalThis.crypto.randomUUID()` and prefixes `local_`. Tests pass a fixed id into `createJob` and do not need the clock or the UUID. A local id always starts with `local_`. A remote id always starts with `remote_`. Those prefixes cannot produce the same string.

### Creation date

`formatCreatedAt` formats `createdAt` in UTC with `en-US`:

```ts
new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
```

| `createdAt` | Visible text |
| --- | --- |
| `2024-01-08T00:00:00.000Z` | Jan 8, 2024, 12:00 AM |
| `2026-10-07T18:00:00.000Z` | Oct 7, 2026, 6:00 PM |

The row shows that text alone. Details show it after the caption `Posted`.

### Screens

```text
Login
  Repair jobs, Username, Client | Pro, Continue
Jobs
  header: Jobs, Log out, and the add icon for a Client
  skeleton | empty state | rows
Create (modal)
  New job, Title, Description, Create job
Job details
  title, description, status, assignee, Posted date
  Client: Delete
  Pro: Claim, then Mark as completed
```

The Jobs title and the login title use `accessibilityRole="header"`.

## Architecture

```text
src/app                 routes only
src/features/auth       login screen and its screen test
src/features/jobs       list, details, create, row, skeleton, empty state, flow tests
src/components          Button, TextField, StatusTag
src/domain              pure rules and unit tests
src/store               Zustand store
src/api                 DummyJSON query function
src/theme               tokens from the visual system
src/test                Jest setup and renderApp
```

Routes:

| URL | File | Screen |
| --- | --- | --- |
| `/` | `src/app/index.tsx` | Login |
| `/jobs` | `src/app/jobs/index.tsx` | Jobs |
| `/jobs/create` | `src/app/jobs/create.tsx` | Create, presented as a modal |
| `/jobs/[id]` | `src/app/jobs/[id].tsx` | Details |

The root layout holds the QueryClient provider, the hydration gate, and the session redirect. Until the store has rehydrated, the gate renders the loading placeholder and does not mount the signed-in screens. A session on launch redirects to `/jobs`. A missing session on a jobs URL redirects to `/`.

The QueryClient uses `staleTime` of 30 seconds and `retry` of 1. Wire TanStack Query's `focusManager` to React Native `AppState` so a return to the app can refetch. Leave `onlineManager` and NetInfo unused.

The todos query key is `['dummyjson', 'todos', { limit: 20 }]`. The query function checks `response.ok` and that the JSON has a `todos` array, then returns the todos. The Pro list is the only screen that mounts this query.

Zustand `persist` uses AsyncStorage and the key `repair-jobs.v1`. Persist `accounts`, `session`, and `jobs`. Leave functions out of the persisted slice.

```ts
type Role = 'client' | 'pro'

type Account = {
  username: string
  role: Role
}

type Session = {
  username: string
  role: Role
}

type JobStatus = 'open' | 'claimed' | 'completed'

type Job = {
  id: string
  title: string
  description: string
  status: JobStatus
  createdBy: string
  claimedBy: string | null
  createdAt: string
}

type DummyTodo = {
  id: number
  todo: string
  completed: boolean
  userId: number
}
```

Domain functions, all pure:

| Function | Result |
| --- | --- |
| `normalizeUsername(input)` | Trimmed string |
| `isUsernameValid(input)` | Trimmed length is at least 1 |
| `resolveRole(accounts, username, draftRole)` | Saved role and `locked: true`, or the draft and `locked: false` |
| `nextDraftRole(previousUsername, nextUsername, accounts, draftRole)` | `client` when the field leaves a saved username for an unknown one. Otherwise the current draft. |
| `login(state, username, draftRole)` | Next accounts and session. Invalid username returns the same state. A saved account keeps its role. |
| `logout(state)` | Session `null`. Accounts and jobs unchanged. |
| `createJob(input)` | `{ ok: true, job }` with trimmed fields, or `{ ok: false, message }` when the trimmed title is empty. The message is `Enter a title to create this job.` |
| `materializeRemoteJob(todo)` | The stable mock job |
| `claimJob(jobs, id, username, todo)` | Claimed job. Materializes `todo` when the id is not local yet. An illegal claim returns the same array. |
| `completeJob(jobs, id, username)` | Completed job, still in the array. An illegal finish returns the same array. |
| `deleteJob(jobs, id)` | Removal, or the same array plus the exact error message |
| `jobsForClient(jobs, username)` | That client's jobs, oldest `createdAt` first, then `id` ascending |
| `jobsForPro(jobs, todos, username)` | The merged Pro list, same sort |
| `formatCreatedAt(createdAt)` | The UTC date and time from [Creation date](#creation-date) |

The store actions call these functions. `deleteJob` on the store returns `{ ok: true }` or `{ ok: false, message }` so the details screen can show the message in component state.

`userId` is on `DummyTodo` because the API sends it. `materializeRemoteJob` does not read it.

### Merge example

Local jobs:

- `local_1`, created by `ada`, open
- `remote_3`, claimed by `ben`
- `remote_4`, finished by `ben`

Todos in the payload:

- id 3, "Paint door", `completed: false`
- id 4, "Fix gate", `completed: false`
- id 5, "Oil hinge", `completed: false`
- id 6, "Done already", `completed: true`

Pro `ben` sees `local_1`, the local `remote_3`, and a virtual `remote_5`. Pro `cara` sees `local_1` and virtual `remote_5`. Client `ada` sees `local_1` only. Todo 6 is dropped because `completed` is `true`. Todos 3 and 4 are dropped because those ids already exist locally, and the local `remote_4` then fails the Pro filter because it is finished.

## Versions

Use Expo SDK 57, the current stable SDK. SDK 58 is still preview. Node.js 22.13 or newer. npm is the package manager.

Install Expo packages with `npx expo install` so the SDK picks a compatible build. Pin the other packages to the versions below. A few current npm releases are outside this set on purpose.

| Package | Pin | Why this one |
| --- | --- | --- |
| `expo` | `~57.0.27` | Latest stable SDK 57 |
| `react` | `19.2.3` | Required by SDK 57 |
| `react-native` | `0.86.3` | Required by SDK 57 |
| `expo-router` | `~57.0.25` | Bundled with SDK 57 |
| `expo-linking` | `~57.0.12` | Router install set |
| `expo-constants` | `~57.0.21` | Router install set |
| `expo-status-bar` | `~57.0.1` | Router install set |
| `react-native-screens` | `~4.26.0` | Bundled with SDK 57 |
| `react-native-safe-area-context` | `~5.7.0` | Bundled with SDK 57 |
| `typescript` | `~6.0.3` | Version in the SDK 57 TypeScript template. npm also has TypeScript 7.0.2, which that template does not use. |
| `@types/react` | `~19.2.2` | SDK 57 template |
| `@tanstack/react-query` | `5.104.1` | Current 5.x |
| `zustand` | `5.0.15` | Current 5.x |
| `@react-native-async-storage/async-storage` | `2.2.0` | Version bundled with SDK 57. npm latest is 3.1.1. |
| `jest` | `29.7.0` | `jest-expo` 57 is built on Jest 29. Jest 30 is the npm latest and does not match this preset. |
| `jest-expo` | `~57.0.5` | SDK 57 |
| `@testing-library/react-native` | `14.0.1` | Current release. Expo Router's test helpers require 13.2 or newer. |
| `react-test-renderer` | `19.2.3` | Matches React 19.2.3 |
| `@types/jest` | `29.5.14` | Matches Jest 29. The 30.x types match Jest 30. |
| `eslint` | `9.39.5` | Matches `eslint-config-expo` for SDK 57 |
| `eslint-config-expo` | `~57.0.2` | SDK 57 lint config, including `typescript-eslint` recommended |
| `@expo/vector-icons` | `^15.0.2` | Ionicons, bundled with SDK 57. Install with `npx expo install` in Phase 4. |
| `@shopify/flash-list` | `2.0.2` | Optional phase only. Version bundled with SDK 57. npm latest is 2.3.3. |
| `eas-cli` | `24.11.0` | Optional phase only |

## Phase 1 — Guides

**Goal.** Leave a short code-style guide and a short testing guide that later phases follow.

**Scope.** `docs/CODE_STYLE.md` and `docs/TESTING.md`. This planning step writes both. Later phases follow them. If a later phase needs a new rule, update the guide in that phase.

**Acceptance.**

- Both guides exist at those paths.
- Each one can be read in a few minutes and states rules, with a short example only where the rule is clearer in code.
- The plan points at both files.

**Tests.** None. The guides are the output.

**Status.** Done in the planning step.

## Phase 2 — Foundation

**Goal.** A running Expo Router app with the pinned toolchain, providers, an empty store, and a working test runner.

**Scope.** Follow both guides.

- Scaffold from the blank TypeScript template into this repo. Keep `CONTEXT.md`, `PROMPTS.md`, `README.md`, `DEVELOPMENT_PLAN.md`, and `docs/`. If `create-expo-app` refuses a non-empty directory, generate into a temp folder and copy the scaffold in without overwriting those files.

```sh
npx create-expo-app@latest repair-jobs-tmp --template blank-typescript
```

- Set `main` to `expo-router/entry`. Add the router install set with `npx expo install`: `expo-router`, `react-native-safe-area-context`, `react-native-screens`, `expo-linking`, `expo-constants`, `expo-status-bar`, and `@react-native-async-storage/async-storage`.
- Install the pinned TanStack Query, Zustand, Jest, RNTL, `react-test-renderer`, `@types/jest`, ESLint, and `eslint-config-expo` versions from the table.
- Keep the template TypeScript at `~6.0.3`. Leave TypeScript 7 uninstalled.
- `app.json`: name `Repair Jobs`, scheme `repairjobs`, `experiments.typedRoutes` enabled, and Metro as the web bundler.
- `tsconfig` extends `expo/tsconfig.base`, with `strict` and the `@/*` path to `./src/*`.
- ESLint uses the SDK 57 flat config from `eslint-config-expo`. Enable `@typescript-eslint/consistent-type-imports`.
- Jest uses the `jest-expo` preset and `src/test/setup.ts`. The setup mocks AsyncStorage with the package's Jest mock.
- Root layout creates the `QueryClient`, connects `focusManager` to `AppState`, and renders a stack. The index route can be a temporary placeholder until Phase 3.
- Add the Zustand store with `accounts: {}`, `session: null`, `jobs: []`, and `persist` under `repair-jobs.v1`. Actions arrive in the phases that own them.
- Add `src/test/renderApp.tsx`. It creates a fresh `QueryClient` with retries off, wraps `renderRouter`, and by default waits until the store has rehydrated. A caller can pass `waitForHydration: false` and a deferred storage read for the loading test.
- Add the folder skeleton from [Architecture](#architecture). Phase 3 adds `src/theme/tokens.ts`.
- Keep the Expo `.gitignore`.

**Acceptance.**

- `npx expo start` opens the placeholder route.
- `npx expo lint` passes.
- `npm test` passes.
- `npx expo install --check` reports the Expo packages on SDK 57.

**Tests.**

- `src/store/appStore.test.ts`: the initial session is `null`, accounts are empty, and jobs are empty. After a `setState` and a rehydrate from AsyncStorage, those three fields come back.

## Phase 3 — Login and session

**Goal.** A person can sign in with a username and a role, stay signed in across a restart, and log out without losing accounts or jobs.

**Scope.** Follow both guides.

- Implement `normalizeUsername`, `isUsernameValid`, `resolveRole`, `nextDraftRole`, `login`, and `logout` in `src/domain/auth.ts`.
- Store actions call those functions and persist through the middleware already added.
- Add `src/theme/tokens.ts` from the visual system. Add `Button` and `TextField`. A disabled button sets `accessibilityState` so tests can read it.
- Build Login at `/` with the copy in [Copy](#copy). The username field does not auto-capitalize or autocorrect. Continue uses the primary button styles and is disabled while the trimmed username is empty.
- The role control is two radios, Client and Pro. Follow the selector rules in [People and data](#people-and-data).
- On focus, Login resets the draft username to empty and the draft role to Client.
- A successful Continue saves a new account or reuses the saved one, sets the session, and replaces the route with `/jobs`.
- The root layout redirects a hydrated session from `/` to `/jobs`, and redirects a missing session away from `/jobs`.
- Log out lives in the Jobs header. In this phase the Jobs screen can be a header and an empty body. The real list arrives in Phase 4. Logout replaces the route with `/`.

**Acceptance.**

- A blank or whitespace username leaves Continue disabled.
- A new username can choose Pro before continuing, and that role is what gets stored.
- An existing username shows the saved role and both options are disabled. Continuing does not change the stored role.
- `Ada` and `ada` can both exist.
- A restart with a session opens Jobs.
- Logout lands on Login with an empty field and Client selected. The account and any jobs are still stored.
- After a saved username locks the selector, editing the field to a new name enables both options and selects Client.

**Tests.** Unit login cases 1–9. RNTL login cases 1–7.

## Phase 4 — Client jobs

**Goal.** A Client can create a job, see it in a list with a status tag and a creation date, open it, and delete it only when nobody has claimed it.

**Scope.** Follow both guides.

- Implement `createJob`, `deleteJob`, `jobsForClient`, and `formatCreatedAt`.
- Install `@expo/vector-icons` with `npx expo install`. Add the destructive button style, `StatusTag`, and the empty-state illustration.
- Jobs header, skeleton, empty state, and rows. Use a `FlatList`. FlashList waits for Phase 6.
- Create modal at `/jobs/create` with `presentation: 'modal'`.
- Details for a Client, including Delete and the exact error string.
- A successful delete replaces the route with `/jobs`.
- Shared controls: `Button`, `TextField`, `StatusTag`. Delete always uses the destructive styles and stays enabled. Primary actions use the primary styles.
- The empty state shows the illustration plus the Client heading and body from [Copy](#copy).
- Update `README.md` with how to run the Client path, the libraries chosen so far, and a pointer to this plan. Phase 5 completes the README.

**Acceptance.**

- The create button is on the Client header and absent for a Pro header (the Pro header is finished in Phase 5; this phase only adds the Client button).
- A title with an empty description creates a job. A blank title shows `Enter a title to create this job.` and leaves the modal open.
- A valid create shows the new row on Jobs immediately, with status `open` and the formatted creation date.
- The row shows the title, the status tag, and the date. Pressing it opens details.
- Details show the title, description, status, `Pro: Unassigned`, and `Posted` plus the formatted date.
- Delete on an unclaimed job returns to a list that no longer shows it, including after a restart.
- Delete on a claimed job and on a completed job keeps the details screen up, shows the exact error, and leaves the job stored.
- An empty Client list shows the empty state.
- The list shows the skeleton while hydration is unfinished.
- Client rows are oldest first.

**Tests.** Unit create cases 1–3. Unit delete cases 1–3. Unit date cases 1–2. Unit client membership cases 11 and 12. Unit sort case 17. RNTL client cases 1–5. RNTL list cases 1, 2, and 5.

## Phase 5 — Pro jobs and DummyJSON

**Goal.** A Pro sees open local jobs and their own unfinished claims, plus incomplete DummyJSON todos, and can claim and finish them. A claimed todo becomes one stable local job.

**Scope.** Follow both guides.

- Implement `materializeRemoteJob`, `claimJob`, `completeJob`, `jobsForPro`, and `createLocalId`.
- Add `src/api/todos.ts` and `useRemoteTodos` with the pinned URL and query key.
- Pro list merges the two sources. The virtual remote job and the later local copy share the mock formula.
- Pro details implement the button matrix. Finishing stays on the screen, disables both buttons, and drops the job from the Pro list while keeping it stored.
- A Client who later opens that finished job still sees it and still gets the delete error.
- A failed todos request shows local Pro matches, `Couldn't load available jobs.`, and Retry.
- A hanging request shows the skeleton, not a mix of skeleton and rows.
- Update `README.md`: how to run, why these libraries, what Phase 6 would add if it is skipped, and the assumptions in this plan (one device, read-only DummyJSON, mock fields, no History screen).
- When implementation prompts are used, append them to `PROMPTS.md`.

**Acceptance.**

- A Pro sees another user's open job and their own claimed job.
- A Pro does not see a job claimed by someone else, and does not see a finished job.
- An incomplete todo appears once. After claim, the same id is a single local row, the title is the todo text, and the other fields match the formula across a restart.
- A completed todo never appears.
- Claim and finish persist and update the open screen without a restart.
- The button enabled states match the matrix, including both disabled after finish.
- A failed todos request still shows local Pro matches and the retry banner.
- The Client list never requests DummyJSON.

**Tests.** Unit membership cases 1–10 and 13–16. Unit materialize cases 1–4. RNTL pro cases 1–6. RNTL list cases 3 and 4.

**Demo path.** Run this on a simulator or Expo Go after the automated tests pass.

1. Open the app with an empty username and confirm Continue is disabled.
2. Sign in as a new Client, create a job, and see the open row.
3. Open it, delete it, and land on the empty list.
4. Create another job. Log out. Sign in as a new Pro. Claim the job and mark it finished. Confirm it leaves the Pro list.
5. Log out, sign in as the Client, open the finished job, and confirm Delete shows the error.
6. Relaunch the app. The Client session and the job are still there.

## Phase 6 — Optional polish

**Goal.** If time remains, page the Pro's remote jobs through FlashList, and produce an EAS preview build for Android and iOS.

This phase can be dropped. Phases 1 through 5 are the complete exercise. Record a skip in the README under "what I would do with more time."

**Scope.** Follow both guides.

- Replace the list with `@shopify/flash-list` at `2.0.2`, installed with `npx expo install @shopify/flash-list`. Keep `JobRow`.
- Switch the Pro remote source to `useInfiniteQuery`. Page size stays 20. The first page is `GET https://dummyjson.com/todos?limit=20&skip=0`. The next page param is `skip + 20` until `skip + todos.length >= total`.
- Filter `completed !== true` on every page, then drop ids that already exist locally.
- `onEndReached` asks for the next page. A footer shows `Loading jobs` while that page is in flight.
- Local jobs stay in the merged list and are not paged.
- The Client list uses FlashList without paging.
- Add `eas.json` with a `preview` profile, `distribution: internal`, and an Android APK build type. Use bundle id `com.repairjobs.dev` unless a real id is provided.
- Dev dependency `eas-cli@24.11.0`.
- Commands, when an Expo account and the platform credentials are available:

```sh
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

**Acceptance.**

- Scrolling near the end of the Pro list requests the next DummyJSON page and appends unseen incomplete todos.
- A todo that was already claimed locally still appears only as the local job.
- The core tests from Phases 3 through 5 still pass.
- `eas.json` is present. A skipped or blocked build is explained in the README, including a missing Expo login or Apple credentials.

**Tests.**

- Extend the Pro list test: two mocked pages, the second page's incomplete todo appears after the end is reached, and a todo id already stored locally is not repeated.
- Unit: `getNextPageParam` returns `20` when the first page is full, and returns no next page when `total` is reached.

## Tests

Setup shared by the unit tests: call the pure functions with plain objects. Pass ids in. No renderer, no `fetch`, no AsyncStorage.

Setup shared by the screen tests: `renderApp` with a fresh query client, the AsyncStorage mock, and a rehydrated store. Seed the store for cases that start signed in. Mock `fetch` for Pro cases. Use `userEvent`. Follow `docs/TESTING.md`.

Status text is `open`, `claimed`, or `completed`. The finish button name is `Mark as completed`.

### Unit — login

File: `src/domain/auth.test.ts`.

1. **Trims before match.** Accounts contain `Ada` as `client`. Input is `  Ada  `. Assert the session username is `Ada`, the role is `client`, and accounts still have one entry.
2. **Rejects an empty username.** Inputs `` and `   `. Assert `isUsernameValid` is false, and `login` returns the same accounts and a null session.
3. **Defaults a new username to Client.** Username `sam` is unknown. Draft role is `client`. Assert the stored account and the session are `sam` / `client`.
4. **Stores the role chosen for a new username.** Username `sam` is unknown. Draft role is `pro`. Assert the account and the session are `pro`.
5. **A saved username keeps its role.** `sam` is stored as `pro`. Draft role is `client`. Assert the session role is `pro` and the account is still `pro`. `resolveRole` reports `locked: true`.
6. **Capitalization distinguishes people.** Login `Ada` as `client`, then `ada` as `pro`. Assert two accounts, with those roles.
7. **Logout clears the session and leaves the rest.** State has session `sam`, account `sam`, and one job. Assert the session is `null`, the account is still there, and the job is still there.
8. **Leaving a saved username resets the draft to Client.** Accounts contain `sam` as `pro`. Previous username is `sam`, next username is `sammy`, draft is `pro`. Assert `nextDraftRole` returns `client`.
9. **A new name that never matched keeps the draft.** Previous username is `sammy`, next username is `sammy2`, draft is `pro`, and neither name is saved. Assert `nextDraftRole` returns `pro`.

### Unit — status transitions and list membership

File: `src/domain/jobs.test.ts`.

1. **Claim an open local job.** Status becomes `claimed` and `claimedBy` is the Pro username.
2. **Claim rejects a job already claimed.** The array is unchanged, including a claim owned by the same username.
3. **Claim rejects a finished job.** The array is unchanged.
4. **Finish a job this Pro claimed.** Status becomes `completed`. The job remains in the array.
5. **Finish rejects an open job.** The array is unchanged.
6. **Finish rejects someone else's claim.** The array is unchanged.
7. **Pro list includes another user's open job.**
8. **Pro list includes this Pro's unfinished claim.**
9. **Pro list hides a job claimed by someone else.** The job remains in the source array.
10. **Pro list hides a finished job.** The job remains in the source array.
11. **Client list includes that client's open job and finished job.**
12. **Client list hides another user's job.**
13. **A todo with `completed: true` is excluded.**
14. **A todo with `completed: false` is shown once,** with id `remote_${n}` and the mock fields.
15. **A todo whose id is already local is replaced by the local job.** Given the [merge example](#merge-example), Pro `ben` sees three jobs (`local_1`, local `remote_3`, virtual `remote_5`) and Pro `cara` sees two (`local_1`, virtual `remote_5`).
16. **Claiming a todo writes one local job.** The stored title, description, `createdBy`, and `createdAt` equal `materializeRemoteJob`. Status is `claimed` and `claimedBy` is the Pro. A second materialize of the same todo still returns the original mock.
17. **Lists are oldest first.** Three jobs: `local_a` and `local_b` at `2024-01-01T00:00:00.000Z`, and `local_c` at `2024-03-01T00:00:00.000Z`. Assert the order is `local_a`, `local_b`, `local_c`. The same order applies to `jobsForClient` and `jobsForPro`.

Cases 7–16 assert which jobs appear. Case 17 asserts order.

### Unit — remote materialization and ids

File: `src/domain/jobs.test.ts` and `src/domain/ids.test.ts`.

1. **Todo 7 maps to the worked example.** Title equals the todo text. `userId` is `26` and `createdBy` is still `client-7`.
2. **Two calls return equal objects.**
3. **A local id starts with `local_` and a remote id starts with `remote_`.** They are not equal.
4. **`completed: false` maps to status `open` and `claimedBy: null`.**

### Unit — client delete

File: `src/domain/jobs.test.ts`.

1. **An unclaimed job is removed.** `claimedBy` is `null`. Assert `ok: true` and the id is absent. Other jobs remain.
2. **A claimed job stays.** Assert `ok: false`, the same jobs array, and message `This job has been claimed and can't be deleted.`
3. **A completed job stays.** Same assertion as case 2.

`deleteJob` runs only for a job that is already in the array. A details screen for an id the person cannot see renders `This job is no longer available.` and does not offer Delete.

### Unit — create

File: `src/domain/jobs.test.ts`.

1. **Trims both fields.** Title `  Fix the sink  ` and description `  Leaks  ` store `Fix the sink` and `Leaks`, with status `open` and `claimedBy` null.
2. **Allows an empty description.** Title `Fix the sink` and description `   ` store description `''` and `ok: true`.
3. **Rejects a blank title.** Title `   ` returns `ok: false` and message `Enter a title to create this job.` No job is returned.

### Unit — creation date

File: `src/domain/createdAt.test.ts`.

1. **`2024-01-08T00:00:00.000Z`** formats as `Jan 8, 2024, 12:00 AM`.
2. **`2026-10-07T18:00:00.000Z`** formats as `Oct 7, 2026, 6:00 PM`.

### RNTL — login

File: `src/features/auth/LoginScreen.test.tsx`.

1. **Continue stays disabled for an empty username.** Render `/`. Assert the Continue button is disabled.
2. **Continue stays disabled for whitespace.** Type `   `. Assert Continue is disabled.
3. **Continue enables for a trimmed character.** Type `  sam`. Assert Continue is enabled.
4. **Continue opens Jobs.** Type `sam`, press Continue. Assert the heading `Jobs` is on screen.
5. **A saved username locks the role.** Seed account `sam` / `pro`. Type `sam`. Assert the Pro radio is selected, and both Client and Pro radios are disabled. Continue is enabled.
6. **Logout resets Login.** Seed a session, render `/jobs`, press Log out. Assert the username field is empty, Client is selected, and both radios are enabled.
7. **Leaving a saved username resets the selector to Client.** Seed account `sam` / `pro`. Type `sam`, then change the field to `sammy`. Assert Client is selected and both radios are enabled.

### RNTL — client actions

File: `src/features/jobs/jobFlows.test.tsx`.

1. **Create shows the new job.** Sign in as Client `sam`. Open create, enter title `Fix the sink` and leave description empty, then press the modal's `Create job`. Assert the list shows `Fix the sink` and the `open` tag.
2. **A blank title shows an error.** Open create and press `Create job` with an empty title. Assert `Enter a title to create this job.` is on screen and the `New job` heading is still on screen.
3. **Delete an unclaimed job.** Seed one open job, `Fix the sink`, owned by `sam`, with `claimedBy` null. Open it, press Delete. Assert the Jobs heading is shown and `Fix the sink` is gone.
4. **Delete a claimed job.** Seed that job claimed by `pat`. Open it as `sam`, press Delete. Assert the title is still on screen and the text `This job has been claimed and can't be deleted.` is shown.
5. **Delete a completed job.** Same as case 4 with status `completed` and `claimedBy` `pat`. Assert the same message and the title still on screen.

### RNTL — Pro actions

File: `src/features/jobs/jobFlows.test.tsx`.

1. **An open job enables Claim only.** Pro `pat`, one open local job. On details, Claim is enabled and `Mark as completed` is disabled.
2. **Claim updates the open screen.** Press Claim. Assert the tag is `claimed`, the assignee line includes `pat`, Claim is disabled, and `Mark as completed` is enabled.
3. **Finish disables both actions and leaves the Pro list.** Press `Mark as completed`. Assert both buttons are disabled and the tag is `completed`. Go back to Jobs. Assert the title is absent.
4. **A job claimed by someone else is absent.** Seed a job claimed by `ada`. As Pro `pat`, assert that title is absent from Jobs.
5. **A pending todos request shows the skeleton.** Hydration is done. `fetch` never resolves. Assert `Loading jobs` is present and no job title is shown.
6. **A failed todos request keeps local jobs and offers retry.** `fetch` rejects. Seed one open local job from another user. Assert that title is shown, `Couldn't load available jobs.` is shown, and a Retry button is present.

### RNTL — list rendering

File: `src/features/jobs/jobFlows.test.tsx`. The job's `createdAt` is `2026-10-07T18:00:00.000Z`, so the row shows `Oct 7, 2026, 6:00 PM`.

1. **A Client row shows the title, the status tag, and the date.** Status `open`. Assert those three strings.
2. **A Client row shows a completed job.** Assert the title and the `completed` tag.
3. **A Pro row shows an open job's title, tag, and date.**
4. **A Pro row shows this Pro's claimed job,** including the `claimed` tag.
5. **A Client list hides another user's job.** Seed two jobs. Assert the other title is absent.

## Out of scope

- The History screen.
- Editing a job, passwords, and a backend account system.
- POST, PUT, and DELETE to DummyJSON.
- Sync across devices.
- A designed web layout. The Metro web bundler is configured so Expo can run; the UI is for the phone.
- Pull to refresh, beyond the Retry button on a failed Pro request.
- A confirmation dialog before delete or finish.
