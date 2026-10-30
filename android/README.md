# AKAD Rental Ops Android Application

This is the native Android UI for the owner admin panel. It is a Java and XML Android Studio project with a login screen, dashboard, bookings, manual booking, calendar, catalog, customers, payments, reports, gallery, audit, owners, settings, and content screens.

## Open and run

1. Start Android Studio.
2. Select **Open** and choose this `android` directory.
3. Allow Gradle to synchronize. The project requires JDK 17, Android SDK Platform 34, Android Gradle Plugin 8.2.2, and Gradle 8.2.
4. Run the `app` configuration on an emulator or a physical device.

Sign in with an active owner account from the deployed database. Primary-owner permissions, including Owner Accounts, are determined by the server response.

## Backend connection

The app connects to the production PHP API at `https://akadrentals.uccit3b.com/api/` using HTTPS and `Authorization: Bearer <session_token>`. The URL is stored in `app/build.gradle` as `API_BASE_URL`; change that build setting and rebuild the app when moving to another environment. Do not connect the Android application directly to MySQL.

The app needs an owner account that exists in the deployed database. It no longer accepts the former in-memory demo credentials.

## Visual design

The native interface follows the current web admin presentation: charcoal navigation, warm brown and bronze accents, cream backgrounds, softly rounded panels, and a layered glass-style login screen. This alignment is implemented in Android resources and layouts only; it does not duplicate or replace the PHP business rules, web offline queue, or server synchronization logic.

## Local verification

From this directory, run:

```powershell
.\gradlew.bat :app:assembleDebug
```
