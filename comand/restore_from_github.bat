@echo off
chcp 65001 >nul
echo 🚀 Starting MongoDB restore from GitHub...

REM Pull latest backup from GitHub
echo 📥 Pulling latest backup from GitHub...
git pull origin

if errorlevel 1 (
    echo ❌ Git pull failed!
    echo 💡 Make sure you have:
    echo    - Cloned the repository
    echo    - Correct remote origin
    echo    - Internet connection
    pause
    exit /b 1
)

REM Check if backup file exists
set "backup_dir=mongodb_backup"
if not exist "%backup_dir%\checkafe_backup.gz" (
    echo ❌ Backup file not found!
    echo 💡 Expected: %backup_dir%\checkafe_backup.gz
    echo 💡 Make sure the backup was pushed correctly
    pause
    exit /b 1
)

REM Start MongoDB container
echo 📦 Starting MongoDB container...
docker-compose up -d mongodb

REM Wait for MongoDB to be ready
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 15 >nul

:check_mongodb
docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" >nul 2>&1
if errorlevel 1 (
    echo ⏳ MongoDB is not ready yet, waiting 5 more seconds...
    timeout /t 5 >nul
    goto check_mongodb
)

echo ✅ MongoDB is ready!

REM Restore database
echo 📥 Restoring database from backup...
docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --archive --gzip --drop < %backup_dir%/checkafe_backup.gz

if errorlevel 1 (
    echo ❌ Database restore failed!
    pause
    exit /b 1
)

echo ✅ Database restore completed successfully!

REM Show backup info
if exist "%backup_dir%\backup_info.md" (
    echo 📋 Backup Information:
    type "%backup_dir%\backup_info.md"
)

REM Start all services
echo 🚀 Starting all services...
docker-compose up -d

echo 🌟 All services are now running!
echo 📊 Admin Panel: http://localhost:3002
echo 🔧 Backend API: http://localhost:3000
echo 💾 Database restored from GitHub backup

pause