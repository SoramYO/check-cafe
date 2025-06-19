@echo off
chcp 65001 >nul
echo 🚀 Starting MongoDB backup and restore process...

REM Start MongoDB container if not running
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

echo ✅ Local MongoDB is ready!

REM Create backup directory with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%_%dt:~8,6%"
set "backup_dir=backup_checkafe_%timestamp%"

echo 📤 Creating backup from MongoDB Atlas...
echo 🔗 Source: mongodb+srv://adminCheckafe:adminCheckafe@cluster0.jhoxh6t.mongodb.net/checkafe
echo 📁 Backup directory: %backup_dir%

REM Backup from MongoDB Atlas
mongodump --uri="mongodb+srv://adminCheckafe:adminCheckafe@cluster0.jhoxh6t.mongodb.net/checkafe" --out=%backup_dir%

if errorlevel 1 (
    echo ❌ Backup from MongoDB Atlas failed!
    echo 💡 Make sure mongodump is installed and accessible in PATH
    echo 💡 Check your internet connection and Atlas credentials
    pause
    exit /b 1
)

echo ✅ Backup from MongoDB Atlas completed!

REM Copy backup to container
echo 📥 Copying backup files to container...
docker cp %backup_dir%/checkafe checkafe-mongodb:/backup_data

REM Restore to local MongoDB
echo 📥 Restoring to local MongoDB...
echo 🔗 Target: mongodb://admin:adminPassword123@mongodb:27017/checkafe?authSource=admin

docker-compose exec mongodb mongorestore --drop --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" /backup_data

if errorlevel 1 (
    echo ❌ Database restore to local MongoDB failed!
    pause
    exit /b 1
)

echo ✅ Database restore to local MongoDB completed successfully!

REM Clean up backup files
echo 🧹 Cleaning up temporary files...
docker-compose exec mongodb rm -rf /backup_data
if exist "%backup_dir%" rmdir /s /q "%backup_dir%"

echo 🎉 Backup and restore process completed successfully!
echo 📊 Data has been synced from MongoDB Atlas to local MongoDB

REM Start all other services
echo 🚀 Starting all services...
docker-compose up -d

echo 🌟 All services are now running!
echo 📊 Admin Panel: http://localhost:3002
echo 🔧 Backend API: http://localhost:3000
echo 💾 Local MongoDB: mongodb://admin:adminPassword123@localhost:27017/checkafe

pause