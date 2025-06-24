#!/bin/bash

# Set UTF-8 encoding
export LANG=en_US.UTF-8

echo "🚀 Starting MongoDB restore from GitHub..."

# Pull latest backup from GitHub
echo "📥 Pulling latest backup from GitHub..."
git pull origin

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    echo "💡 Make sure you have:"
    echo "   - Cloned the repository"
    echo "   - Correct remote origin"
    echo "   - Internet connection"
    read -p "Press Enter to continue..."
    exit 1
fi

# Check if backup file exists
backup_dir="mongodb_backup"
if [ ! -f "$backup_dir/checkafe_backup.gz" ]; then
    echo "❌ Backup file not found!"
    echo "💡 Expected: $backup_dir/checkafe_backup.gz"
    echo "💡 Make sure the backup was pushed correctly"
    read -p "Press Enter to continue..."
    exit 1
fi

# Start MongoDB container
echo "📦 Starting MongoDB container..."
docker compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 15

# Check MongoDB readiness
check_mongodb() {
    docker compose exec mongodb mongosh --eval "db.runCommand('ping').ok" >/dev/null 2>&1
    return $?
}

while ! check_mongodb; do
    echo "⏳ MongoDB is not ready yet, waiting 5 more seconds..."
    sleep 5
done

echo "✅ MongoDB is ready!"

# Restore database
echo "📥 Restoring database from backup..."
docker compose exec -T mongodb mongorestore --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --archive --gzip --drop < "$backup_dir/checkafe_backup.gz"

if [ $? -ne 0 ]; then
    echo "❌ Database restore failed!"
    read -p "Press Enter to continue..."
    exit 1
fi

echo "✅ Database restore completed successfully!"

# Show backup info
if [ -f "$backup_dir/backup_info.md" ]; then
    echo "📋 Backup Information:"
    cat "$backup_dir/backup_info.md"
fi

# Start all services
echo "🚀 Starting all services..."
docker compose up -d

echo "🌟 All services are now running!"
echo "📊 Admin Panel: http://localhost:3002"
echo "🔧 Backend API: http://localhost:3000"
echo "💾 Database restored from GitHub backup"

read -p "Press Enter to continue..." 