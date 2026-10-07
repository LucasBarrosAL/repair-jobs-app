You are helping me in a selection process for a role on the Turno team. In this step, produce a development plan for a mobile app and two short engineering guides.

## Deliverables

Create these files:

1. `DEVELOPMENT_PLAN.md` at the project root.
2. `docs/CODE_STYLE.md`
3. `docs/TESTING.md`

`DEVELOPMENT_PLAN.md` must work in two ways at once:

- An AI agent can execute it phase by phase.
- A human can read it and understand the product, the architecture, and the order of work.

Point the plan at the two guides and follow them in every phase.

In this step, deliver the plan and the two guides. Feature implementation starts after I approve the plan.

## Sources of truth

1. Read `CONTEXT.md` at the project root. It contains the full brief for this exercise.
2. Apply the requirements in this prompt, plus any decisions I confirm later in conversation.

Base the plan entirely on those sources. Where something is still missing, or where `CONTEXT.md` and this prompt disagree, do this before treating the point as decided:

- State the gap in plain language.
- Propose one or more concrete options.
- Recommend one option and say why.
- Wait for my decision.

I make the final call on every remaining gap. The decisions already stated in this prompt are final.

## Technical stack

Use this stack:

1. Expo
2. TypeScript
3. Expo Router
4. TanStack Query, Zustand, and AsyncStorage
5. React Native StyleSheet for UI
6. Jest and React Native Testing Library (RNTL)
7. FlashList, only if time allows, to simulate infinite scroll
8. EAS Build for Android and iOS, preview profile, only if time allows

In the plan, pin current stable versions that work together. Split state like this:

- TanStack Query: remote reads from DummyJSON, including cache and loading state
- Zustand: session and job state in memory
- AsyncStorage: persistence across app restarts

Data lives on one device. Store every username on that device. Jobs created by Clients live in the same shared local storage. DummyJSON is the only remote source.

## Engineering guides

Write the two guides in this step. Keep each one short enough to read in a few minutes: plain rules, with a short example only where the rule is easier to show than to describe.

Base them on common practice from widely used community sources:

- Expo docs and the official Expo Router project structure
- TypeScript and typescript-eslint recommended practice
- React Native Testing Library guiding principles
- Official TanStack Query and Zustand guidance on server state versus client state

`docs/CODE_STYLE.md` should cover:

- File and folder naming
- Component and screen structure
- TypeScript usage
- Where state lives (TanStack Query, Zustand, AsyncStorage)
- StyleSheet usage

`docs/TESTING.md` should cover:

- How to structure Jest and RNTL tests
- What to assert in screen flows
- What belongs in unit tests of business rules

## Product

### UI

Propose a simple, lean interface that still looks intentional. Define one color palette for the whole app:

- Strong contrast between text and background
- A clear visual treatment for primary CTAs
- A distinct destructive treatment for Delete
- Comfortable reading size and color for body text

You may propose an icon library that is easy to add to an Expo app, and an image for the empty state. Mark the palette, icons, and empty-state image as proposals until I confirm them.

### Job model

Use the job fields required by `CONTEXT.md`. Also persist `createdAt` on every job so the UI can calculate and display elapsed time.

- When a Client creates a job, set `createdAt` to the creation time. The user does not type this field.
- Status labels: use the labels defined in `CONTEXT.md` when they exist. Otherwise use `open`, `claimed`, and `completed` with the meanings below.
- The default status for a new job is `open`.

Keep completed jobs stored. A future History screen will show them. Do not build History in this plan.

### 1. Authentication / login

1. Provide a text field where the user types a username.
2. Trim the username. Treat it as valid when the trimmed value contains at least one character. Apply no other format rules. Match stored usernames by that exact trimmed string, including capitalization.
3. Save the username locally after the first successful login and keep the account after the app closes. An existing user can log in again later. A username has exactly one role. The same username cannot be stored again with a different role.
4. Provide a role selector with two options: Client and Pro. Client is the default for a new username, and the user may change it before continuing. When the typed username already exists, disable the selector and show the role saved for that username.
5. Persist the active session. On launch, if a session exists, open Jobs directly.
6. Provide logout. Logout clears the session and returns to Login with an empty username field and the role selector reset to Client. Logout keeps saved accounts and jobs.
7. Provide a Continue button. Enable it only when the trimmed username is valid. The role is always set, either by the Client default, by the user’s selection, or by the saved account.

### 2. Job list

The list depends on the signed-in role.

1. Header with the title "Jobs".
   - Client: include a "+" button that opens a modal to create a new job. Fields come from `CONTEXT.md`. The app sets `createdAt` and the default status `open`.
2. Job list:
   1. Show a skeleton while the screen is loading.
   2. Every row is pressable, navigates to the Job Details screen, and shows a status tag. Where the row shows age, calculate it from `createdAt`.
   3. Client:
      - Show the jobs created by this user, including completed jobs.
      - When the list is empty, show a friendly empty state. You may propose an image.
   4. Pro:
      - Show jobs that are available (`open`), and jobs claimed by this username that are not completed.
      - Omit jobs claimed by another username.
      - Omit completed jobs.
      - Build the list from two sources:
        - Jobs stored locally that were created by other users
        - GET `https://dummyjson.com/todos?limit=20`, keeping items whose `completed` is not `true`
      - Show a remote todo once. After it is saved locally, use the local record.
      - Give local jobs and DummyJSON jobs ids that cannot collide. Document the scheme in the plan.

### 3. Job Details screen

Show the public job data required by `CONTEXT.md`, plus elapsed time from `createdAt`.

1. Client: show the public information. At the bottom of the screen, show a Delete CTA. Keep it tappable for every job this Client can open.
   - When nobody has claimed the job, delete it, persist the removal, and return to the Jobs list.
   - When a Pro has claimed the job, including when the status is already completed, keep the job stored and show a friendly error on the screen, near the button. Use this message: "This job has been claimed and can't be deleted."
2. Pro: place two buttons at the bottom of the screen. Each action updates the job and persists the change.
   - Available (`open`): Claim enabled, Mark as completed disabled.
   - Claimed by the current username: Claim disabled, Mark as completed enabled.
   - Completed: both buttons disabled. Remove the job from the Pro list. Keep it stored for a future History screen.
   - Claimed by another username: these jobs do not appear in this Pro’s list.

When a Pro claims a DummyJSON job:

- Save a full local copy at that moment.
- Map remote fields that have a clear Job equivalent. The todo text maps to the job title field defined in `CONTEXT.md`.
- Fill every remaining Job field, including `createdAt`, with stable mock values derived from the remote id, so the values stay the same across restarts and tests.
- Set the status to claimed and set the claiming username to the current user.
- Use those same mocked values if the UI already showed the remote job before the claim.

## Tests

Cover the main flows with Jest and RNTL, and cover business rules with unit tests.

RNTL:

1. Login validation and button enablement
2. Client actions, including:
   - Delete an unclaimed job, then show the Jobs list without that job
   - Press Delete on a claimed job, keep the job on screen, and show "This job has been claimed and can't be deleted."
3. Pro actions
4. Job list rendering, including the information shown on each row and the status tag

Unit tests:

1. Login validation: trim, empty username, default role Client, existing username locks the saved role, logout clears the session and leaves stored accounts in place
2. Status transitions and list membership: claim, mark as completed, hide jobs claimed by someone else, remove completed jobs from the Pro list, keep them stored
3. Client delete: removal succeeds only when the job has no claiming username; a claimed job and a completed job stay stored

For each area, name the cases, the setup, and the expected assertions in the plan.

## How to structure the plan

Organize `DEVELOPMENT_PLAN.md` in phases. Each phase needs:

- A goal
- Scope
- Acceptance criteria
- The tests that prove the phase is done

Use the guides as the first phase’s output (they are created in this planning step; later phases follow them). Put FlashList infinite scroll and the EAS preview build for Android and iOS in a final optional phase, so they can be dropped if time runs out.

Keep UI proposals labeled as proposals until I accept them. After I confirm any remaining open point, update `DEVELOPMENT_PLAN.md` so it contains only decided behavior and an implementation agent can execute it.
