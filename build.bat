@echo off
setlocal enabledelayedexpansion

REM Set JAVA_HOME to Eclipse Adoptium JDK
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"

REM Verify Java is available
echo JAVA_HOME is set to: %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version

REM Navigate to android directory
cd /d "c:\Users\Administrator\Telegram-Drive-Mobile\mobile-app\android"

REM Build Release APK
call gradlew.bat assembleRelease --no-daemon

echo.
echo Build complete! APK should be at:
echo c:\Users\Administrator\Telegram-Drive-Mobile\mobile-app\android\app\build\outputs\apk\release\
