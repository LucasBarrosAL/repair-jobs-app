# Repair Jobs

Clients post repair jobs on this phone. Pros claim open jobs and mark them finished. Accounts and jobs stay on the device. Pros also see a read-only list of extra jobs from DummyJSON.

## Run

```sh
npm install
npx expo start
```

Open the project in Expo Go.

1. Sign in as a Client, create a job, and open it.
2. Delete an unclaimed job to return to the list. Delete a claimed or finished job to see why it stays.
3. Log out, sign in as a Pro, and claim an open job. Mark it completed. It leaves the Pro list and stays stored.
4. Log out, sign in as the Client, and open that finished job. Delete explains that it was claimed.

DummyJSON has to be reachable for the extra Pro jobs. If that request fails, the local jobs still show, with a button to try again.

## Libraries

- Expo Router keeps each screen a file and presents Create as a modal.
- Zustand stores the session, accounts, and jobs. AsyncStorage keeps that store across restarts. Screens do not talk to AsyncStorage themselves.
- TanStack Query loads the DummyJSON todos into a memory-only cache. Claiming a todo copies it into the Zustand store, and that copy is the saved job.
- Ionicons supplies the create button.

## Assumptions

- One device. There is no account server and no sync.
- DummyJSON is read-only. The app never posts a job back to it.
- A remote todo's title is the todo text. The other fields are stable mock values from the todo id, so a restart shows the same job.
- Finished jobs stay stored. This app has no History screen.

## With more time

Page the Pro's remote jobs with FlashList, and add an EAS preview build for Android and iOS. Those steps are optional and are not part of this build.

Product rules are in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).
