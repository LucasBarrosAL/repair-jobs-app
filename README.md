# Repair Jobs

Clients post repair jobs on this phone. Pros claim open jobs and mark them finished. Accounts and jobs stay on the device. A Pro also sees the first 20 open todos from DummyJSON.

Create calls DummyJSON, then saves the job on the phone. Claim, complete, and delete call DummyJSON only for a remote job. A job that exists only on the phone is updated there and does not call DummyJSON again. DummyJSON does not keep writes, so the next launch still reads the copy on the device.

## Run

```sh
npm install
npx expo start
```

Open the project in Expo Go. DummyJSON has to be reachable to create a job, to claim, finish, or delete a DummyJSON job, and to load the extra Pro jobs. A job that already exists only on the phone does not call DummyJSON again.

1. Sign in as a Client, create a job, and open it.
2. Delete an unclaimed job to return to the list. Delete a claimed or finished job to see why it stays.
3. Log out from the gear menu, sign in as a Pro, and claim an open job. Mark it completed. It leaves the Pro list and stays stored.
4. Log out, sign in as the Client, and open that finished job. Delete explains that it was claimed.

If the todos request fails, the local Pro jobs still show, with a button to try again.

## Decisions

These choices shape what the app does.

- **Only 20 remote jobs.** The Pro list calls `GET /todos?limit=20`. Later DummyJSON todos are not loaded.
- **The phone is the record.** A successful DummyJSON response is followed by a local save. A failed response saves nothing. The query cache is memory only. Accounts, the session, and jobs persist under `repair-jobs.v1`.
- **A phone-only job stays on the phone.** Claim, complete, and delete of a `local_` job do not call DummyJSON. A `remote_` job is updated with `PUT /todos/:id` and removed with `DELETE /todos/:id`.
- **A Client list never fetches todos.** Only a Pro list loads DummyJSON.
- **Local jobs come first.** Jobs whose ids start with `local_` are listed before DummyJSON jobs. Inside each group, the oldest `createdAt` comes first, then the id. A stored DummyJSON claim stays in the remote group.
- **A new local id is `local_` plus the current time.** Remote ids stay `remote_` plus the todo id.
- **One list and one details screen.** `useJobs` and `useJobDetails` decide the rows, the empty copy, the load error, and whether Delete, Claim, and Mark as completed are hidden, enabled, or disabled. Create is the only list control that depends on the role, and only a Client can open it.
- **Log out lives in the gear menu.** The header shows Settings. Log out is the menu item.
- **Pull to refresh reloads the Pro todos.** A Client refresh rereads the jobs already on the phone.
- **The app is phone only.** There is no web build.
- **A failed todos request keeps the local Pro jobs** and shows "Couldn't load available jobs." with Retry.
- **A blank title does not create a job** and does not call DummyJSON. The message is "Enter a title to create this job." A claimed or finished job cannot be deleted, and that check happens before the request.
- **Dates are UTC.** A row shows a calendar date and time, such as `Oct 7, 2026, 6:00 PM`.
- **One username keeps one role.** Moving from a saved username to a new name turns the role choice back on and resets it to Client.

## Libraries

- Expo Router keeps each screen a file and presents Create as a modal. Protected stacks keep signed-out people on login and keep Create for Clients.
- Zustand stores the session, accounts, and jobs. AsyncStorage keeps that store across restarts. Screens do not talk to AsyncStorage themselves.
- TanStack Query loads the 20 todos and runs create plus the remote claim, complete, and delete calls. After a write succeeds, or when a phone-only job changes, the mutation saves the job in Zustand and updates the jobs query.
- Ionicons supplies Create and the settings gear.

## What I'd do with more time

Phase 6 in the plan is optional and is not in this build.

I would page the Pro's DummyJSON jobs. The list would use FlashList. The remote source would be an infinite query with a page size of 20, starting at `GET /todos?limit=20&skip=0`, and the next page would add 20 to `skip` until the total is reached. Each page would drop completed todos and any id already stored on the phone. Reaching the end of the list would load the next page, with "Loading jobs" in the footer while that page is in flight. Local jobs would stay in the merged list and would not be paged. The Client list would use FlashList too, without paging.

I would also add an EAS preview build for Android and iOS. `eas.json` would have a `preview` profile with internal distribution and an Android APK. The bundle id would be `com.repairjobs.dev` unless a real one is provided. With an Expo account and the platform credentials:

```sh
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

Product rules are in [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md). The decisions above override that plan where they disagree, including read-only DummyJSON and a single oldest-first list.
