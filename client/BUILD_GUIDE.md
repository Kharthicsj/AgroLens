# 📱 AgroLens Mobile App - EAS Build Guide

## ✅ Changes Made to Fix Gradle Build Issues

### 1. **Fixed Kotlin Version Compatibility**

-   Set `kotlinVersion` to `1.9.24` in `expo-build-properties`
-   This resolves the "Key 1.7.20 is missing" error

### 2. **Disabled New Architecture**

-   Changed `newArchEnabled` from `true` to `false`
-   New Architecture (Fabric) can cause build issues on EAS

### 3. **Updated Android Build Configuration**

```json
{
	"compileSdkVersion": 35,
	"targetSdkVersion": 35,
	"buildToolsVersion": "35.0.0",
	"minSdkVersion": 24
}
```

### 4. **Fixed Package Name**

-   Changed from `com.kharthic.client` to `com.kharthic.agrolens`
-   Added proper Android permissions

### 5. **Updated EAS Configuration**

-   Removed `appVersionSource: "remote"` (not needed)
-   Added explicit `gradleCommand` for development builds
-   Added environment variables for builds

---

## 🚀 Building Your APK

### Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### Step 1: Configure EAS Project (First Time Only)

```bash
cd client
eas build:configure
```

### Step 2: Build Development APK

```bash
# Build for internal testing (with dev client)
eas build --platform android --profile development

# Or build preview (without dev client)
eas build --platform android --profile preview
```

### Step 3: Build Production APK

```bash
# Production build
eas build --platform android --profile production
```

---

## 📋 Build Profiles Explained

### Development Profile

-   **Purpose**: Internal testing with Expo Dev Client
-   **Includes**: Developer tools, hot reload
-   **Command**: `eas build -p android --profile development`
-   **Output**: Debug APK with dev tools

### Preview Profile

-   **Purpose**: Testing without dev tools
-   **Includes**: Production-like environment
-   **Command**: `eas build -p android --profile preview`
-   **Output**: Release APK for testing

### Production Profile

-   **Purpose**: Play Store release
-   **Includes**: Optimized, minified, signed
-   **Command**: `eas build -p android --profile production`
-   **Output**: Production APK

---

## 🔧 Troubleshooting

### Issue: Gradle Build Fails with Kotlin Error

**Solution**: ✅ Already fixed in `app.json`

-   `kotlinVersion: "1.9.24"` specified in expo-build-properties

### Issue: "newArchEnabled" Causes Build Failure

**Solution**: ✅ Already disabled in `app.json`

-   Set to `false` for stability

### Issue: Build Timeout or Out of Memory

**Solution**:

```bash
# Use --clear-cache flag
eas build --platform android --profile development --clear-cache
```

### Issue: Environment Variables Not Found

**Solution**: Add secrets to EAS

```bash
# Add environment variable
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "http://your-backend-url"
```

---

## 📦 Download and Install APK

### After Build Completes:

1. **Check Build Status**:

    - Go to https://expo.dev/accounts/kharthic/projects/client/builds
    - Or run: `eas build:list`

2. **Download APK**:

    - Click download link from EAS dashboard
    - Or use QR code to download directly on device

3. **Install on Android Device**:
    - Enable "Install from Unknown Sources" in Android settings
    - Open downloaded APK file
    - Click Install

---

## 🎯 Quick Commands Reference

```bash
# Build development APK
eas build -p android --profile development

# Build preview APK
eas build -p android --profile preview

# Build production APK
eas build -p android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel running build
eas build:cancel

# Clear cache and rebuild
eas build -p android --profile development --clear-cache
```

---

## ⚙️ Configuration Files

### app.json

-   ✅ Fixed `kotlinVersion` to 1.9.24
-   ✅ Disabled `newArchEnabled`
-   ✅ Updated Android SDK versions
-   ✅ Fixed package name
-   ✅ Added proper permissions

### eas.json

-   ✅ Removed problematic `appVersionSource`
-   ✅ Added explicit Gradle commands
-   ✅ Added environment variables
-   ✅ Configured all three build profiles

### .easignore

-   ✅ Created to exclude unnecessary files from build

---

## 📱 Testing Your APK

### Development Build

1. Install APK on device
2. Open the app
3. Shake device or press menu button
4. Select "Enter URL manually"
5. Enter your dev server URL (e.g., `exp://192.168.1.41:8081`)

### Preview/Production Build

1. Install APK on device
2. App should work standalone (no dev server needed)
3. Make sure backend URL is correct in `.env`

---

## 🔐 Environment Variables for EAS

If you need to add environment variables to your build:

```bash
# Add secrets (secure)
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-backend.com"

# Or use .env file (less secure, committed to repo)
# Already present in your project: client/.env
```

Your current `.env` file will be included in the build automatically.

---

## ✅ Verification Checklist

Before building:

-   [ ] `app.json` has correct `kotlinVersion: "1.9.24"`
-   [ ] `newArchEnabled: false`
-   [ ] Package name is `com.kharthic.agrolens`
-   [ ] All required permissions listed
-   [ ] `.env` file has correct backend URL
-   [ ] `eas.json` has proper build profiles

After build:

-   [ ] Build completes successfully
-   [ ] APK downloads correctly
-   [ ] App installs on device
-   [ ] App launches without crash
-   [ ] Authentication works
-   [ ] Disease detection works
-   [ ] All features functional

---

## 🎉 Success!

Your APK should now build successfully without Gradle errors!

**Build Time**: ~10-15 minutes for first build, ~5-8 minutes for subsequent builds

**APK Size**: ~50-80 MB (development), ~30-50 MB (production)

---

## 📞 Need Help?

1. Check EAS build logs: `eas build:view [BUILD_ID]`
2. Review Expo documentation: https://docs.expo.dev/build/introduction/
3. Check Gradle error in logs for specific issues

---

**Last Updated**: December 10, 2025
**Expo SDK**: 53.0.20
**Android SDK**: 35
**Kotlin**: 1.9.24
