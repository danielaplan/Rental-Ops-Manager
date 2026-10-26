# Android Team Workflow

Four developers work through two shared Android branches. Two developers share the frontend branch, and two developers share the backend branch. Neither team commits directly to `android/initial-project` or `main`.

## Branch structure

```text
main
└── android/initial-project
    ├── android/frontend
    └── android/backend
```

- `android/initial-project` is owned by the coordinator and combines reviewed Android work.
- `android/frontend` contains Android XML layouts, styles, navigation, and screen behavior.
- `android/backend` contains Android-to-PHP networking, authentication, models, repositories, and API error handling.

**Branch base rule:** Both `android/frontend` and `android/backend` must be created directly from the same commit on `android/initial-project`. Neither branch starts from `main`, and neither branch starts from the other team branch.

## Developer assignments

| Developer | Shared branch | Specific responsibility |
| --- | --- | --- |
| Frontend Developer 1 | `android/frontend` | Shared colors, dimensions and styles; login screen; dashboard; primary navigation |
| Frontend Developer 2 | `android/frontend` | Booking list/details; manual-booking form; customer and calendar screens |
| Backend Developer 1 | `android/backend` | API base configuration; HTTP client; login/logout; session-token storage; authentication errors |
| Backend Developer 2 | `android/backend` | Booking, customer and catalog requests; Java API models; response parsing; validation/API errors |

The coordinator reviews both branches, resolves cross-team conflicts, verifies the combined application, and opens the final pull request to `main`.

## File ownership

To reduce conflicts, developers should stay inside their assigned files.

| Area | Owner |
| --- | --- |
| `res/values/colors.xml`, `dimens.xml`, `styles.xml`, themes, login/dashboard layouts and navigation | Frontend Developer 1 |
| Booking, customer and calendar layouts plus their screen classes | Frontend Developer 2 |
| `network/`, API configuration, HTTP client, `session/` and authentication models | Backend Developer 1 |
| Booking/customer/catalog models and repository classes | Backend Developer 2 |

Before editing a shared file such as `AndroidManifest.xml`, `build.gradle`, `strings.xml`, or `MainActivity.java`, the developer must tell the other developer on the same branch. Only one developer edits that shared file at a time.

## Step 1 — Coordinator creates the two branches

Run from the repository root:

```powershell
git fetch origin
git switch android/initial-project
git pull --ff-only

git switch -c android/frontend
git push -u origin android/frontend

git switch android/initial-project
git switch -c android/backend
git push -u origin android/backend

git switch android/initial-project
```

Create each branch only once. If a branch already exists locally, use `git switch <branch>` instead of `git switch -c <branch>`.

After creating both branches, the coordinator verifies that they have the same starting commit:

```powershell
git merge-base origin/android/frontend origin/android/backend
git rev-parse origin/android/initial-project
```

Before team development begins, both commands should print the same commit ID.

## Step 2 — Frontend developers switch to their existing branch

First time on the laptop:

```powershell
git fetch origin
git switch --track origin/android/frontend
```

Later sessions:

```powershell
git switch android/frontend
git pull --ff-only
```

Both frontend developers use `android/frontend`, but they follow the separate responsibilities and file ownership above.

## Step 3 — Backend developers switch to their existing branch

First time on the laptop:

```powershell
git fetch origin
git switch --track origin/android/backend
```

Later sessions:

```powershell
git switch android/backend
git pull --ff-only
```

Both backend developers use `android/backend`, but they follow the separate responsibilities and file ownership above.

## Step 4 — Daily shared-branch workflow

Only one developer on a shared branch should push at a time.

1. Tell the teammate which files you will edit.
2. Run `git status --short`. Do not begin with unknown or unfinished changes.
3. Pull the latest branch before editing.
4. Work only on the assigned responsibility.
5. Run the smallest relevant Android checks.
6. Commit only your files with a clear message.
7. Pull again before pushing. If another developer pushed first, merge their work, resolve conflicts, and rerun the checks.
8. Push the shared branch.

```powershell
git status --short
git pull --ff-only

# Edit only assigned files, then test.
cd android
.\gradlew.bat test
cd ..

git status --short
git add <only-your-files>
git commit -m "Describe the completed Android work"
git pull --no-rebase
git push
```

Never use `git add .` on a shared branch. Never force-push. Do not commit `local.properties`, `.idea/`, build output, credentials, tokens, signing keys, database exports, or real customer data.

## Step 5 — Frontend and backend connection contract

The teams agree on each connection before implementation:

```text
Android XML view ID
→ Java value
→ API request field
→ PHP endpoint and action
→ API response field
→ Android screen result
```

Frontend developers own Android view IDs and visible states. Backend developers own endpoint calls and Java data returned to the screen. The teams must agree on method names and data types before either side depends on them.

Backend work must follow the current PHP API contract. Do not send HTML element IDs such as `mCustName` as JSON field names. Do not connect Android directly to MySQL.

## Step 6 — Team handoff to the coordinator

When a team branch is ready, its developers stop pushing new work and tell the coordinator. The coordinator reviews the branch and opens or reviews these pull requests:

```text
Base: android/initial-project
Compare: android/frontend
```

```text
Base: android/initial-project
Compare: android/backend
```

Frontend should normally be merged first so the combined Android branch contains the final screen IDs and navigation. Backend is then merged and connected to those screens. Any required integration fix is made on the appropriate team branch and reviewed again.

## Step 7 — Combined verification

After both branches are merged, the coordinator runs:

```powershell
git switch android/initial-project
git pull --ff-only
cd android
.\gradlew.bat test
```

The coordinator also runs the app on an emulator and verifies the connected workflows against an isolated QA database. Do not use the normal development or production database for isolated integration testing.

## Step 8 — Final merge to main

When the combined Android application is reviewed and tested, open one final pull request:

```text
Base: main
Compare: android/initial-project
```

Pushing `android/frontend` or `android/backend` does not change `main`. Only the final reviewed pull request adds Android work to `main`.

## Coordinator checklist

- [ ] Both team branches started from the same `android/initial-project` commit.
- [ ] Each developer stayed within the assigned responsibility.
- [ ] Shared-file edits were coordinated before work began.
- [ ] Commit authors identify the developer who performed the work.
- [ ] No local configuration, credentials, or real customer data is committed.
- [ ] Frontend IDs and backend method/data contracts agree.
- [ ] Gradle tests pass after both branches are combined.
- [ ] Login and connected workflows are checked on an emulator.
- [ ] Local/emulator evidence is not described as production, physical-device, security, or client acceptance.
