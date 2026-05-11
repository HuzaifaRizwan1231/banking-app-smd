# 🚀 Development & Reloading Guide

This guide explains how to see your changes in the app and clarifies when you need to run a new EAS build.

## 1. How to Reload Your App
You **DO NOT** need to make a new EAS build for most changes. 

### Fast Refresh (Automatic)
When you save a file in VS Code (like changing text, colors, or logic in a `.tsx` file), the app will **automatically refresh** on your phone or emulator within a second.

### Manual Reload
If the app gets stuck or you want to do a clean reload:
*   **In the Terminal**: Press `r` in the window where `npx expo start` is running.
*   **On your Phone**: 
    *   **iOS**: Shake your phone and tap "Reload".
    *   **Android**: Press `Ctrl + M` (emulator) or shake your phone and tap "Reload".

---

## 2. When do I need a new EAS Build?
You only need to run `eas build --profile development` in **three specific cases**:

1.  **Installing New Native Modules**: If you run `npx expo install` for a package that contains native code (like when we added `expo-firebase-recaptcha` or `react-native-fbsdk-next`).
2.  **Modifying `app.json`**: If you change your **Package Name**, **Bundle ID**, **Icons**, **Splash Screen**, or **Native Plugins**.
3.  **Updating Config Files**: If you replace `google-services.json` or `GoogleService-Info.plist`.

**Rule of Thumb:** If you are just editing files inside the `app/`, `components/`, or `constants/` folders, you **NEVER** need a new EAS build.

---

## 3. Development Workflow
To work on your app effectively:

1.  **Keep the Server Running**: Always have a terminal open running `npx expo start`.
2.  **Use the Dev Client**: Open the app you installed via the EAS build (it will have the name of your project, not "Expo Go").
3.  **Connect**: Ensure your phone and computer are on the same Wi-Fi. Scan the QR code or select your device in the terminal.

---

## 4. Troubleshooting
*   **Changes not showing?** Check if there is a red error screen in your app. Fix the error and save again.
*   **App crashing on startup?** This usually means a native module is missing. This is when you should run `eas build` again.
*   **Network Error?** Make sure your phone can "see" your computer's IP address.
