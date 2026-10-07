# Mobile Take-Home — Repair Jobs App

**Role:** Senior React Native Developer

**Expected effort:** about 4 hours

**Required stack:**

Expo (managed workflow) + TypeScript.

Every other choice — navigation, data-fetching, state management, styling, testing — is yours. Thanks for taking the time to do this. We don't expect a finished product in 4 hours — we'd rather see a clean, well-reasoned slice, built the way you'd actually ship something, and hear how you thought about the rest. Read the whole thing before you start.

## The idea

Build a small mobile app where **two kinds of users share the same app** but see and do different things — same app, same login screen, different experience depending on **who you are**. We give you a public API so you can spend your time on the app, not a backend.

## The scenario & the two roles

A small **repair-jobs app**. A "job" is a single repair request. Two roles:

|                      | **Client**                        | **Pro**                               |     |
| -------------------- | --------------------------------- | ------------------------------------- | --- |
| **Who they are**     | Posts repair jobs and tracks them | Picks up jobs and completes them      |     |
| **Home screen**      | A list of **their own** jobs      | A list of **available** jobs to claim |     |
| **Create a job?**    | Yes                               | No                                    |     |
| **Claim a job?**     | No                                | Yes (only open jobs)                  |     |
| **Mark a job done?** | No                                | Yes (only jobs they claimed)          |     |

A job moves through three states: open → _(a Pro claims it)_ → claimed → _(the Pro completes it)_ → done.

## What we'd like you to build

These are the baseline requirements. Treat them as the floor, not the ceiling — we're hiring for senior, so the parts you choose to add or harden beyond this list tell us as much as the list itself.

### Login & role

1. The app opens on a **role-selection / login** screen. Faking the auth is fine — a "Continue as Client" / "Continue as Pro" picker, no real credentials. The chosen role lives in the app state and drives the experience.
2. The selected role **persists across app restarts**.
3. There is a way to **switch roles / log out** from inside the app.

### Client

1. A Client sees a list of **only the jobs they created**.
2. A Client can **create a job** (title + short description). It appears in their list as open.
3. A Client can open a job to see its **details**: current status, and which Pro is assigned once it's claimed.

### Pro

1. A Pro sees a list of **available (**open) jobs**.**
2. A Pro can **claim** an open job — it becomes claimed and assigned to them.
3. A Pro can **mark a claimed job as** done \*\*\*\*— only for jobs they claimed.
4. A Pro can't claim a job that's already claimed or done.

### Everywhere

1. Handle the states a real screen has, not just the happy path.
2. After an action, the UI reflects the new state without a manual restart.

## The API

Use DummyJSON — free, no account, nothing to host. Map the todos resource onto "jobs"; the exact field names don't matter.

- GET https://dummyjson.com/todos — all (?limit=0 for everything), …/todos/{id}, …/todos/user/{userId}
- Example:
  - { "id": 1, "todo": "…", "completed": false, "userId": 26 }
- POST /todos/add, PUT /todos/{id}, DELETE /todos/{id} return a valid-looking response but **don't persist** — a later GET won't show your change. Decide how to keep your app consistent anyway.

DummyJSON has no notion of "the current user" — decide how you represent identity and the claimed/assigned state on top of the basic shape, and be consistent.

## A few notes

- **Scope freely.** If time runs short, build less but build it well, and say what you skipped.
- **Hand it over like you would to a teammate.** We read the repo the way we'd review a real pull request — including its history.
- **Using AI is welcome.** We build with it every day; use it as much as you like. So that we can follow your process, keep the prompts you used while building this in a PROMPTS.md at the repo root, and tidy it into something you'd be comfortable putting your name on before you submit.

## What to send us

- A **public Git repo URL** (GitHub/GitLab) — that's all we need.
- A short **README**: how to run it, the libraries you picked and why, what you'd do with more time, and any assumptions or shortcuts.
- **Optional:** a ≤2-min screen recording.

Have fun with it — we're looking forward to seeing what you build.
