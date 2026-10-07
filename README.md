# Repair Jobs

A phone app where a client posts repair jobs and deletes one only when nobody has claimed it.

## Run the client path

```sh
npm install
npx expo start
```

Open the project in Expo Go. Sign in with any username and leave the role on Client. Press Continue, then the add button. A title is required. An empty description is allowed. The new job shows up on Jobs with an `open` tag and the time it was created.

Open a row for the description, the assignee, and the posted time. Delete removes an unclaimed job and returns to the list. If someone has claimed it, the job stays and the screen explains why.

## Libraries

- Expo Router for screens
- Zustand and AsyncStorage for the session, accounts, and jobs on this device
- TanStack Query for remote reads, wired up and used when Pros load jobs
- Ionicons for the create button

Product rules, copy, and the phase order are in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).
