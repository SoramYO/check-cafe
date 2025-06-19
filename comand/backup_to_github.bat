@echo off
chcp 65001 >nul
echo 🚀 Starting MongoDB backup to GitHub...

REM Create backup directory
set "backup_dir=mongodb_backup"
if exist "%backup_dir%" rmdir /s /q "%backup_dir%"
mkdir "%backup_dir%"

REM Check if MongoDB container is running
docker-compose ps mongodb | find "Up" >nul
if errorlevel 1 (
    echo 📦 Starting MongoDB container...
    docker-compose up -d mongodb
    echo ⏳ Waiting for MongoDB to be ready...
    timeout /t 15 >nul
)

echo 📤 Creating backup from MongoDB...
REM Backup MongoDB to archive format (compressed)
docker-compose exec mongodb mongodump --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --archive --gzip > %backup_dir%/checkafe_backup.gz

if errorlevel 1 (
    echo ❌ Backup failed!
    pause
    exit /b 1
)

echo ✅ Backup created successfully!

REM Create restore info file
echo # MongoDB Backup Information > %backup_dir%/backup_info.md
echo - **Backup Date**: %date% %time% >> %backup_dir%/backup_info.md
echo - **Database**: checkafe >> %backup_dir%/backup_info.md
echo - **File**: checkafe_backup.gz >> %backup_dir%/backup_info.md
echo - **Size**: >> %backup_dir%/backup_info.md
dir "%backup_dir%\checkafe_backup.gz" | find "checkafe_backup.gz" >> %backup_dir%/backup_info.md

REM Git operations
echo 📤 Pushing backup to GitHub...
git add %backup_dir%/
git commit -m "MongoDB backup - %date% %time%"
git push origin

if errorlevel 1 (
    echo ❌ Git push failed! Please check your Git configuration.
    echo 💡 Make sure you have:
    echo    - Git repository initialized
    echo    - Remote origin configured
    echo    - Authentication set up (token/SSH)
    pause
    exit /b 1
)

echo ✅ Backup pushed to GitHub successfully!
echo 📋 Backup files:
echo    - %backup_dir%/checkafe_backup.gz
echo    - %backup_dir%/backup_info.md
echo 🌐 Now you can pull and restore on another machine

pause