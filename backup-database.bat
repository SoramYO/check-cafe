@echo off
chcp 65001 >nul
echo 💾 Starting MongoDB backup process...

REM Create backup directory with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DIR=backup_%datetime:~0,8%_%datetime:~8,6%
mkdir "%BACKUP_DIR%"

REM Check if MongoDB container is running
docker-compose ps mongodb | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB container is not running!
    echo 🚀 Starting MongoDB container...
    docker-compose up -d mongodb
    
    REM Wait for MongoDB to be ready
    echo ⏳ Waiting for MongoDB to be ready...
    timeout /t 10 >nul
    
    :check_mongodb_backup
    docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" >nul 2>&1
    if errorlevel 1 (
        echo ⏳ MongoDB is not ready yet, waiting 5 more seconds...
        timeout /t 5 >nul
        goto check_mongodb_backup
    )
)

echo ✅ MongoDB is ready!

REM Backup the database
echo 📤 Backing up database...
docker-compose exec mongodb mongodump --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --out="/backup_temp"

if errorlevel 1 (
    echo ❌ Database backup failed during mongodump!
    rmdir "%BACKUP_DIR%" >nul 2>&1
    pause
    exit /b 1
)

REM Copy backup from container to host
echo 📋 Copying backup files from container...
docker cp checkafe-mongodb:/backup_temp/checkafe "%BACKUP_DIR%\"

if errorlevel 1 (
    echo ❌ Failed to copy backup files from container!
    rmdir "%BACKUP_DIR%" >nul 2>&1
    pause
    exit /b 1
)

REM Clean up temporary backup in container
docker-compose exec mongodb rm -rf /backup_temp

REM Check if backup was successful
if exist "%BACKUP_DIR%\checkafe" (
    echo ✅ Database backup completed successfully!
    echo 📁 Backup saved to: %BACKUP_DIR%\checkafe
    
    REM Count files in backup
    for /f %%i in ('dir "%BACKUP_DIR%\checkafe" /b ^| find /c /v ""') do set FILE_COUNT=%%i
    echo 📊 Backup contains %FILE_COUNT% files
    
    echo.
    echo 🔄 To restore this backup later, use:
    echo    restore-database.bat %BACKUP_DIR%
    echo.
    echo 📝 Backup directory: %BACKUP_DIR%
) else (
    echo ❌ Database backup failed!
    rmdir "%BACKUP_DIR%" >nul 2>&1
    pause
    exit /b 1
)

pause 