@echo off
echo ========================================
echo   BUILDING AAB WITH NEW VERSION CODE
echo ========================================
echo.
echo Current version: 1.0.3 (versionCode: 3)
echo.

cd android

echo Cleaning previous build...
call gradlew clean

echo.
echo Building new AAB...
call gradlew bundleRelease

echo.
echo Checking build result...
if exist "app\build\outputs\bundle\release\app-release.aab" (
    echo.
    echo BUILD SUCCESSFUL!
    echo File: app\build\outputs\bundle\release\app-release.aab
    dir app\build\outputs\bundle\release\*.aab
) else (
    echo.
    echo BUILD FAILED!
    echo Check the error messages above.
)

echo.
pause 