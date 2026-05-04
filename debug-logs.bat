@echo off
setlocal
set ADB=C:\Users\Administrator\Telegram-Drive-Mobile\platform-tools-adb\platform-tools\adb.exe

echo ============================================
echo  Telegram Drive - Android Debug Log Watcher
echo ============================================
echo.

:: Check for connected devices
echo [1/3] Checking for connected devices...
%ADB% devices
echo.

:: Wait for device
echo [2/3] Waiting for device (plug in USB if not connected)...
%ADB% wait-for-device
echo Device found!
echo.

:: Clear old logs
echo [3/3] Clearing old logs and starting live log stream...
echo       Filter: com.jhinkz.telegramdrive + React Native errors
echo       Press Ctrl+C to stop.
echo.
%ADB% logcat -c

:: Stream filtered logs - shows app crashes, JS errors, React Native bridge errors
%ADB% logcat ^
  ReactNativeJS:V ^
  ReactNative:V ^
  ExpoModules:V ^
  AndroidRuntime:E ^
  System.err:W ^
  com.jhinkz.telegramdrive:V ^
  expo.modules:V ^
  *:S
