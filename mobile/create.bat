@echo off
echo Creating release keystore...

REM Create release keystore
keytool -genkey -v -keystore android/app/release.keystore -alias checkcafe -keyalg RSA -keysize 2048 -validity 10000 -storepass checkcafe123 -keypass checkcafe123 -dname "CN=CheckCafe, OU=Mobile, O=CheckCafe, L=Ho Chi Minh, S=Ho Chi Minh, C=VN"

echo.
echo Keystore created successfully!
echo.
echo Checking keystore fingerprint...
keytool -list -v -keystore android/app/release.keystore -alias checkcafe -storepass checkcafe123

echo.
echo Please copy the SHA1 fingerprint above and update it in Google Play Console
pause