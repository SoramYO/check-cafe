#!/bin/bash

echo "🚀 Starting MongoDB restore process..."

# Check if dump directory exists
if [ ! -d "./dump_checkafe" ]; then
    echo "❌ Error: dump_checkafe directory not found!"
    exit 1
fi

# Start MongoDB container if not running
echo "📦 Starting MongoDB container..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is ready
while ! docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" > /dev/null 2>&1; do
    echo "⏳ MongoDB is not ready yet, waiting 5 more seconds..."
    sleep 5
done

echo "✅ MongoDB is ready!"

# Restore the database
echo "📥 Restoring database from dump..."
docker-compose exec -T mongodb mongorestore --drop --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" /dump_checkafe/checkafe

if [ $? -eq 0 ]; then
    echo "✅ Database restore completed successfully!"
    echo "🎉 Your CheckCafe database is ready to use!"
else
    echo "❌ Database restore failed!"
    exit 1
fi

# Start all other services
echo "🚀 Starting all services..."
docker-compose up -d

echo "🌟 All services are now running!"
echo "📊 Admin Panel: http://localhost:3002"
echo "🔧 Backend API: http://localhost:3000" 