# AKAD Rental Ops Android Application

This is the native Android UI for the owner admin panel. It is a Java and XML Android Studio project with a login screen, dashboard, bookings, manual booking, calendar, catalog, customers, payments, reports, gallery, audit, owners, settings, and content screens.

## Open and run

1. Start Android Studio.
2. Select **Open** and choose this `android` directory.
3. Allow Gradle to synchronize. The project requires JDK 17, Android SDK Platform 34, Android Gradle Plugin 8.2.2, and Gradle 8.2.
4. Run the `app` configuration on an emulator or a physical device.

The login screen accepts any contact number and password. The number `0918-222-3333` opens the non-primary-owner sample account, which hides Owner Accounts.

## Current integration boundary

The application currently runs with in-memory sample data in `app/src/main/java/com/akad/rentalops/util/MockStore.java`. `Api.java` exposes the intended PHP API-shaped calls but returns that sample data, so the application does not yet make network requests or require the `INTERNET` permission.

To connect it later, replace `Api.run(...)` with authenticated HTTP requests to the PHP API using the Android Emulator address `http://10.0.2.2:8000/api/`. Do not connect the Android application directly to MySQL.

## Local verification

From this directory, run:

```powershell
.\gradlew.bat :app:assembleDebug
```
