# Google Play Store Publishing & Android Mobile Guide

This guide explains how to test your **Hill Climb Rush** game on your Android mobile device and publish it to the Google Play Store as an official Android App Bundle (`.aab`).

---

## 1. Quick Test on Your Android Mobile Device (Instant Play)

You can play and test the game directly on your Android phone right now without installing Android Studio:

1. **Start the local server** on your PC:
   ```bash
   python -m http.server 8000
   ```
2. Find your PC's local IP address (run `ipconfig` in PowerShell, look for IPv4 address, e.g. `192.168.1.15`).
3. Open **Google Chrome** on your Android phone and browse to:
   ```
   http://192.168.1.15:8000
   ```
4. **Install as App**:
   - Tap the 3 dots menu in Chrome (`⋮`).
   - Tap **"Add to Home screen"** or **"Install app"**.
   - The game will install on your Android home screen with the game icon and launch in **Fullscreen Landscape Mode** without browser bars!

---

## 2. Opening in Android Studio & Building the Native APK

The complete Android project is pre-built in the `android/` directory:

```
trial/
├── android/
│   ├── app/
│   │   ├── build.gradle                 (Configured for Target SDK 34)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      (Landscape, Fullscreen, Hardware-accelerated)
│   │       ├── java/com/hillclimb/racing/MainActivity.java
│   │       └── assets/                  (Game HTML/JS/CSS embedded)
│   ├── build.gradle
│   └── settings.gradle
└── sync_assets.py
```

### Steps to Build in Android Studio:
1. Download and open [Android Studio](https://developer.android.com/studio).
2. Click **Open** and select the `android` folder (`G:\DESKTOP\trial\android`).
3. Android Studio will automatically sync Gradle and index the project.
4. Whenever you make changes to the game's HTML/CSS/JS, run:
   ```bash
   python sync_assets.py
   ```
   to update the embedded assets in the Android app.
5. Plug your Android phone into your PC via USB (with **USB Debugging** enabled in Developer Options) and click the green **Run (▶)** button in Android Studio. The game will install and run natively on your phone!

---

## 3. Generating a Signed Android App Bundle (`.aab`) for Google Play Store

Google Play requires all new apps to be submitted in the **Android App Bundle (`.aab`)** format.

### Step 3.1: Generate a Release Keystore
In PowerShell or Android Studio Terminal:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hillclimb-key
```
*(Store this keystore safely; you need it to release future updates to your game).*

### Step 3.2: Build Signed Bundle in Android Studio
1. In Android Studio, go to **Build** > **Generate Signed Bundle / APK...**.
2. Select **Android App Bundle** and click **Next**.
3. Point to your `my-release-key.jks` file, enter your password, and alias (`hillclimb-key`).
4. Select build variant **release**.
5. Click **Finish**.
6. Android Studio will generate your release bundle file at:
   `android/app/release/app-release.aab`.

---

## 4. Publishing to Google Play Console

1. **Sign in to Google Play Console**:
   - Go to [play.google.com/console](https://play.google.com/console).
   - Create or sign in to your Google Play Developer account ($25 one-time fee).

2. **Create New App**:
   - Click **Create app**.
   - App name: `Hill Climb Rush` (or your chosen title).
   - Default language: English (United States).
   - App or game: **Game**.
   - Free or paid: **Free**.

3. **App Dashboard Requirements**:
   - Complete the standard declarations:
     - **Privacy Policy**: Provide a link to your game's privacy policy.
     - **App Access**: All functionality is available without special access.
     - **Ads**: Check "No" (or "Yes" if you later integrate AdMob).
     - **Content Rating**: Complete questionnaire (Violence: None, Category: Racing game -> gets PEGI 3 / Everyone rating).
     - **Target Audience**: 13+ or All ages.
     - **Data Safety**: Declare whether any user data is collected (our game saves data locally on the device).

4. **Store Listing Details**:
   - Short description: `High-octane 2D hill climb racing with physics stunts and garage upgrades!`
   - Full description: Highlight the features (Email & Guest login, Buggy upgrades: Engine, Suspension, Tires, 4WD, Stages: Countryside, Desert, Arctic, Moon).
   - Graphic Assets:
     - App icon: 512x512 PNG (`assets/icon-512.png`).
     - Feature graphic: 1024x500 PNG.
     - Screenshots: Take 2-4 screenshots of the garage and gameplay.

5. **Upload the App Bundle (`.aab`)**:
   - Go to **Release** > **Production** (or **Internal testing** first).
   - Click **Create new release**.
   - Upload `app-release.aab`.
   - Release notes: `Initial release of Hill Climb Rush 2D!`.
   - Click **Review release** and **Start rollout to Production**!

Google Play typically reviews new apps within 1 to 3 days. Once approved, players worldwide can download and enjoy your game!
