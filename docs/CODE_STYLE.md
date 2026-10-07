# Code style

These rules apply to every phase in `DEVELOPMENT_PLAN.md`.

They follow the Expo Router file-based layout, `typescript-eslint` recommended practice (through `eslint-config-expo` on SDK 57), and the split TanStack Query and Zustand describe between server state and client state.

## Files and folders

- Route files live in `src/app`. Each file there is a URL. Its default export is the screen.
- Screens, components, hooks, domain rules, the store, the API client, and tests live outside `src/app`.
- Route names stay lowercase and match the URL: `index.tsx`, `_layout.tsx`, `[id].tsx`, `create.tsx`.
- Component files use `PascalCase.tsx`.
- Hooks use a `use` prefix: `useRemoteTodos.ts`.
- Domain modules use `camelCase.ts` inside `src/domain`.
- Tests sit beside the module they cover, named `*.test.ts` or `*.test.tsx`.
- Import project code through the `@/` alias, mapped to `src/*`.

```tsx
import { JobsScreen } from '@/features/jobs/JobsScreen'

export default JobsScreen
```

## Components and screens

- A route file imports a named screen and re-exports it as the default. The screen holds the UI.
- Inside a screen, write hooks, then derived values, then handlers, then the tree. Put `StyleSheet.create` at the bottom of the file.
- One component per file. Export it as a named function. Use `function JobRow(props: JobRowProps)`.
- Name the props type when a component takes more than one prop.
- Screens render state and call store actions. List membership, claim, complete, delete, and login rules live in `src/domain`, which has no React imports.
- Give every pressable control visible text or an `accessibilityLabel`. The loading placeholder uses `accessibilityRole="progressbar"` and `accessibilityLabel="Loading jobs"`.

A delete error, a draft username, and a draft role belong to the screen that shows them. They are not fields on the store.

## TypeScript

- Keep `"strict": true`.
- Lint with `eslint-config-expo`. That config applies `typescript-eslint` recommended.
- Also enable `@typescript-eslint/consistent-type-imports`.
- Leave `any` unused. Widen to `unknown` and narrow it.
- Use `import type` for imports that only provide types.
- Give every exported domain function an explicit return type.
- Model session, accounts, and jobs with the types in `DEVELOPMENT_PLAN.md`. A status is that union, not a free string.
- Leave non-null assertions (`!`) unused.

## State

Each value has one home.

| Data | Home |
| --- | --- |
| DummyJSON todos, the cache, and loading or error for that request | TanStack Query |
| Session, saved accounts, and jobs in memory | Zustand |
| Session, saved accounts, and jobs across restarts | AsyncStorage, written by Zustand's `persist` middleware |

- The todos query function in `src/api/todos.ts` is the only `fetch` in the app.
- Screens read and write AsyncStorage only through the store. A screen file does not import AsyncStorage.
- The query cache is memory only. The app does not persist it.
- Claiming a remote todo writes a new local job into the Zustand store. That write is the saved copy. It is separate from the query cache.
- Store accounts, the session, and the full job list. Derive the visible list with the domain functions while rendering.
- Select the smallest slice a component needs, for example `useAppStore((state) => state.session)`.

```tsx
const session = useAppStore((state) => state.session)

const todos = useQuery({
  queryKey: ['dummyjson', 'todos', { limit: 20 }],
  queryFn: fetchTodos,
})
```

## StyleSheet

- Style components with `StyleSheet.create`.
- Take colors, spacing, type size, and radii from `src/theme/tokens.ts`. A component file does not contain its own hex values.
- Share style objects. Combining them in an array is fine: `[styles.base, disabled && styles.disabled]`.
- Use an inline style only for a value that changes with data.
- Body text uses the theme body size and body color. Primary actions use the primary button styles. Delete uses the destructive button styles.
- Use React Native `StyleSheet` for UI. Leave styled-components and NativeWind unused.
