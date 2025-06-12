@echo off
chcp 65001 >nul
echo 🚀 Starting MongoDB restore process...

REM Check if dump directory exists
if not exist "dump_checkafe" (
    echo ❌ Error: dump_checkafe directory not found!
    pause
    exit /b 1
)

REM Start MongoDB container if not running
echo 📦 Starting MongoDB container...
docker-compose up -d mongodb

REM Wait for MongoDB to be ready
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 10 >nul

:check_mongodb
docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" >nul 2>&1
if errorlevel 1 (
    echo ⏳ MongoDB is not ready yet, waiting 5 more seconds...
    timeout /t 5 >nul
    goto check_mongodb
)

echo ✅ MongoDB is ready!

REM Copy dump to container and restore
echo 📥 Copying dump files to container...
docker cp dump_checkafe checkafe-mongodb:/

echo 📥 Restoring database from dump...
docker-compose exec mongodb mongorestore --drop --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" /dump_checkafe/checkafe

if errorlevel 1 (
    echo ❌ Database restore failed!
    pause
    exit /b 1
)

echo ✅ Database restore completed successfully!
echo 🎉 Your CheckCafe database is ready to use!

REM Start all other services
echo 🚀 Starting all services...
docker-compose up -d

echo 🌟 All services are now running!
echo 📊 Admin Panel: http://localhost:3002
echo 🔧 Backend API: http://localhost:3000

pause 