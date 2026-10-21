# Android Team Workflow

This workflow lets four developers work on the Android application without changing `main` directly or committing to the same working branch.

## Branch structure

```text
main
└── android/initial-project
    ├── android/frontend
    │   ├── android/frontend-login-dashboard
    │   └── android/frontend-bookings-customers
    └── android/integration
        ├── android/integration-auth
        └── android/integration-bookings
```

`android/initial-project` is the Android coordination branch. Developer pull requests must target their assigned team branch, not `main`.

## Developer assignments

| Developer | Branch | Responsibility | Pull-request target |
| --- | --- | --- | --- |
| Frontend Developer 1 | `android/frontend-login-dashboard` | Shared Android styles, login XML, dashboard XML, and navigation UI | `android/frontend` |
| Frontend Developer 2 | `android/frontend-bookings-customers` | Booking list/details, manual-booking form, and customer XML screens | `android/frontend` |
| Integration Developer 1 | `android/integration-auth` | API configuration, HTTP client, login, session handling, and authentication errors | `android/integration` |
| Integration Developer 2 | `android/integration-bookings` | Booking/customer API calls, Java data models, responses, and API errors | `android/integration` |

The coordinator owns `android/initial-project`, reviews pull requests, resolves cross-team conflicts, runs the combined checks, and opens the final pull request to `main`.

## Step 1 — Coordinator creates the team branches

Run from the repository root:

```powershell
git fetch origin
git switch android/initial-project
git pull --ff-only

git switch -c android/frontend
git push -u origin android/frontend

git switch android/initial-project
git switch -c android/integration
git push -u origin android/integration
```

Create each branch only once. If it already exists locally, use `git switch <branch>` instead of `git switch -c <branch>`.

## Step 2 — Each developer creates a separate feature branch

Frontend Developer 1:

```powershell
git fetch origin
git switch -c android/frontend-login-dashboard origin/android/frontend
git push -u origin android/frontend-login-dashboard
```

Frontend Developer 2:

```powershell
git fetch origin
git switch -c android/frontend-bookings-customers origin/android/frontend
git push -u origin android/frontend-bookings-customers
```

Integration Developer 1:

```powershell
git fetch origin
git switch -c android/integration-auth origin/android/integration
git push -u origin android/integration-auth
```

Integration Developer 2:

```powershell
git fetch origin
git switch -c android/integration-bookings origin/android/integration
git push -u origin android/integration-bookings
```

## Step 3 — Daily developer workflow

1. Pull the assigned feature branch before starting.
2. Work only within the assigned responsibility.
3. Do not commit `local.properties`, build output, credentials, tokens, signing keys, or real customer data.
4. Run the smallest relevant Android checks.
5. Commit with a message describing the completed behavior.
6. Push only the assigned feature branch.
7. Open a pull request into the assigned team branch.

Example:

```powershell
git pull --ff-only
cd android
.\gradlew.bat test
cd ..
git status --short
git add android
git commit -m "Build Android login screen"
git push
```

Review `git status --short` before committing so another developer's files or local configuration are not included.

## Step 4 — Pull-request flow

Use these exact directions:

```text
android/frontend-login-dashboard
        └── android/frontend

android/frontend-bookings-customers
        └── android/frontend

android/integration-auth
        └── android/integration

android/integration-bookings
        └── android/integration
```

The coordinator reviews changed files, test evidence, credentials, and conflicts before merging. Keep the developer's commit authorship visible.

## Step 5 — Keep feature branches current

After the coordinator updates a team branch, its developers update their feature branches:

```powershell
git fetch origin
git merge origin/android/frontend
```

Integration developers replace `android/frontend` with `android/integration`. Resolve conflicts on the feature branch, rerun tests, and push the resolution. Do not force-push over another developer's work.

## Step 6 — Combine the two teams

After both frontend pull requests are approved, merge `android/frontend` into `android/initial-project`. After both integration pull requests are approved, merge `android/integration` into `android/initial-project`.

The coordinator then verifies the combined application:

```powershell
git switch android/initial-project
git pull --ff-only
cd android
.\gradlew.bat test
```

Also run the Android application on an emulator. API-connected work must be tested against an isolated QA database, not the normal development or production database.

## Step 7 — Final merge to main

When the combined Android application is reviewed and tested, open one final pull request:

```text
Base: main
Compare: android/initial-project
```

Merging developer branches into a team branch does not update `main`. Merging the final pull request is the only step in this workflow that adds the Android work to `main`.

## Coordination rules

- Frontend developers agree on shared resource names before creating screens: colors, dimensions, styles, layout IDs, and navigation destinations.
- Integration developers agree on API models, endpoint names, authentication state, error format, and callback/result contracts.
- A frontend screen and its integration logic must agree on view IDs and the Java data passed between them.
- Developers do not commit directly to `android/initial-project` or `main`.
- The coordinator does not rewrite or remove developer authorship.
- A successful local Gradle test is not emulator, physical-device, production, security, or client acceptance.
