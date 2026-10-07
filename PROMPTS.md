# Prompts

The plan and the two guides already exist. These are the prompts that built the app. Each one is the request, shortened.

## 1. Execute the development plan

Execute `docs/DEVELOPMENT_PLAN.md` phase by phase. Follow `docs/CODE_STYLE.md` and `docs/TESTING.md`. Stop before Phase 6. Do not commit unless I ask.

## 2. Role selector component

Move the Client and Pro radios out of the login screen into their own component.

## 3. Settings menu

Replace the logout button with a gear icon. Pressing it opens a floating menu with Log out. Tapping outside closes the menu.

## 4. One list, two roles, protected routes

Keep a single `/jobs` URL. Use separate Client and Pro screens, with shared pieces in the jobs feature. Guard login versus jobs, and guard Create so only a Client can open it. Do not use route groups for roles.

## 5. List order and refresh

Show local jobs first, then DummyJSON jobs. Within each group, keep the oldest `createdAt` first, then id. Add pull to refresh.

## 6. One jobs query

Move the merge into `useJobs`. Both screens call it. TanStack Query owns that merge.

## 7. List hook and details hook

Use `useJobs` for the list and `useJobDetails(id)` for details. The hooks return the jobs and whether each action is hidden, enabled, or disabled. The screens do not branch on role. The create button is the exception.

## 8. Writes, then save locally

Create, claim, complete, and delete call DummyJSON through TanStack Query. After the response, save the job on the phone in the same flow. Move the visible-jobs logic into the `getJobs` query.

## 9. Local jobs stay local

If the job exists only on the phone, do not call DummyJSON for claim, complete, or delete. Keep DummyJSON for remote jobs.

## 14. README

Update the README with the decisions that change the finished app, including the limit of 20 DummyJSON todos. Add a section for what I would do with more time, from the development plan.
