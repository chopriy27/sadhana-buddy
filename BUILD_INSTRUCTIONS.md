# Sadhana Buddy - Build & Deployment Guide

## Prerequisites

### For Both Platforms
- Node.js 18+ installed
- Backend deployed to Railway (see below)

### For iOS
- macOS with Xcode 15+
- Apple Developer Account ($99/year)
- iOS device or simulator

### For Android
- Android Studio
- Google Play Developer Account ($25 one-time)
- Android device or emulator

---

## Step 1: Deploy Backend to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard:
   ```
   GOOGLE_APPLICATION_CREDENTIALS_JSON = <paste your Firebase service account JSON>
   NODE_ENV = production
   ```
4. Deploy and note your Railway URL (e.g., `https://sadhana-buddy-production.up.railway.app`)

5. Update the production URL in your app:
   - Edit `client/src/lib/config.ts`
   - Change `PRODUCTION_API_URL` to your Railway URL

---

## Step 2: Enable Apple Sign-In (Required for iOS)

### In Apple Developer Portal:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Certificates, Identifiers & Profiles → Identifiers
3. Select your App ID (`com.sadhanabuddy.app`)
4. Enable "Sign in with Apple" capability
5. Configure as needed

### In Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable Apple
3. Add your Services ID and configure OAuth

### In Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select the App target → Signing & Capabilities
3. Click "+ Capability" → Add "Sign in with Apple"

---

## Step 3: Build the App

### Build Web Assets First
```bash
npm run build
```

### Sync to Native Projects
```bash
npx cap sync
```

---

## Step 4: Build for iOS

### Open in Xcode
```bash
npx cap open ios
```

### In Xcode:
1. Select your Team in Signing & Capabilities
2. Update Bundle Identifier if needed
3. Set version number (1.0.0)
4. Product → Archive
5. Distribute App → App Store Connect

### App Store Connect:
1. Create new app at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Fill in metadata:
   - App name: Sadhana Buddy
   - Subtitle: Your Spiritual Practice Companion
   - Category: Lifestyle (or Health & Fitness)
   - Privacy Policy URL: https://your-railway-url.app/privacy-policy.html
3. Upload screenshots (required sizes):
   - iPhone 6.7" (1290 x 2796)
   - iPhone 6.5" (1284 x 2778)
   - iPad Pro 12.9" (2048 x 2732)
4. Submit for review

---

## Step 5: Build for Android

### Open in Android Studio
```bash
npx cap open android
```

### Generate Signed APK/AAB:
1. Build → Generate Signed Bundle/APK
2. Create new keystore (save it securely!)
3. Fill in keystore details
4. Build → Release → Android App Bundle (AAB)

### Google Play Console:
1. Create app at [play.google.com/console](https://play.google.com/console)
2. Fill in store listing:
   - App name: Sadhana Buddy
   - Short description: Track your daily spiritual practices
   - Full description: (see below)
   - Category: Lifestyle
   - Privacy Policy URL: https://your-railway-url.app/privacy-policy.html
3. Upload screenshots:
   - Phone: At least 2 screenshots
   - Feature graphic: 1024 x 500
4. Upload AAB file
5. Submit for review

---

## App Store Descriptions

### Short Description (80 chars)
```
Track japa, reading & hearing. Your daily spiritual practice companion.
```

### Full Description
```
Sadhana Buddy is your personal spiritual practice companion, designed to help you maintain and deepen your daily devotional practices.

FEATURES:
• Track daily japa rounds with goal completion
• Log Prabhupada's book reading (pages)
• Record lecture hearing (minutes)
• Beautiful Vaishnava calendar with festivals
• Personal spiritual journal
• Progress tracking with streaks
• Lecture library with audio
• Daily verse inspiration

Perfect for devotees following the path of Krishna consciousness who want to:
• Maintain consistent sadhana practices
• Track spiritual progress over time
• Stay connected to the Vaishnava calendar
• Reflect on their spiritual journey

Start your spiritual journey today with Sadhana Buddy!
```

---

## Troubleshooting

### iOS Build Issues
- Ensure you have the latest Xcode
- Run `pod install` in ios/App directory
- Clean build folder: Product → Clean Build Folder

### Android Build Issues
- Ensure Gradle is up to date
- Sync project with Gradle files
- Clean project: Build → Clean Project

### API Connection Issues
- Verify Railway deployment is working
- Check PRODUCTION_API_URL is correct
- Ensure CORS is configured properly

---

## Version Checklist

Before each release:
- [ ] Update version in package.json
- [ ] Update version in capacitor.config.ts
- [ ] Update iOS version in Xcode
- [ ] Update Android version in build.gradle
- [ ] Test on real devices
- [ ] Test all authentication flows
- [ ] Verify API connections
