#!/bin/bash

echo "💾 Starting MongoDB backup process..."

# Create backup directory with timestamp
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Check if MongoDB container is running
if ! docker-compose ps mongodb | grep -q "Up"; then
    echo "❌ MongoDB container is not running!"
    echo "🚀 Starting MongoDB container..."
    docker-compose up -d mongodb
    
    # Wait for MongoDB to be ready
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
    
    while ! docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" > /dev/null 2>&1; do
        echo "⏳ MongoDB is not ready yet, waiting 5 more seconds..."
        sleep 5
    done
fi

echo "✅ MongoDB is ready!"

# Backup the database
echo "📤 Backing up database..."
docker-compose exec mongodb mongodump --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --out="/backup_temp"

# Copy backup from container to host
echo "📋 Copying backup files from container..."
docker cp checkafe-mongodb:/backup_temp/checkafe "./$BACKUP_DIR/"

# Clean up temporary backup in container
docker-compose exec mongodb rm -rf /backup_temp

if [ -d "./$BACKUP_DIR/checkafe" ]; then
    echo "✅ Database backup completed successfully!"
    echo "📁 Backup saved to: ./$BACKUP_DIR/checkafe"
    echo "📊 Backup contains $(ls -1 ./$BACKUP_DIR/checkafe | wc -l) collections"
    
    # Show backup size
    BACKUP_SIZE=$(du -sh "./$BACKUP_DIR" | cut -f1)
    echo "💽 Backup size: $BACKUP_SIZE"
    
    echo ""
    echo "🔄 To restore this backup later, use:"
    echo "   ./restore-database.sh $BACKUP_DIR"
else
    echo "❌ Database backup failed!"
    rmdir "$BACKUP_DIR" 2>/dev/null
    exit 1
fi 