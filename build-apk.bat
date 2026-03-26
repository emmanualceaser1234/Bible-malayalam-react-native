@echo off
echo Building APK for BibleApp...

REM Check if Android SDK is available
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME environment variable is not set
    echo Please install Android Studio and set ANDROID_HOME
    pause
    exit /b 1
)

REM Check if Java is available
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install JDK 17 and set JAVA_HOME
    pause
    exit /b 1
)

echo Prerequisites check passed...

REM Navigate to android directory
cd android

echo Building release APK...
call gradlew assembleRelease

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build successful!
echo APK location: android\app\build\outputs\apk\release\app-release.apk

REM Copy APK to root directory for easy access
copy app\build\outputs\apk\release\app-release.apk ..\BibleApp-release.apk

echo APK copied to: BibleApp-release.apk
pause 