#!/bin/bash

echo "📊 Starting MongoDB collections export..."

# Create export directory with timestamp
EXPORT_DIR="export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

# Check if MongoDB container is running
if ! docker-compose ps mongodb | grep -q "Up"; then
    echo "❌ MongoDB container is not running!"
    echo "🚀 Starting MongoDB container..."
    docker-compose up -d mongodb
    
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
    
    while ! docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok" > /dev/null 2>&1; do
        echo "⏳ MongoDB is not ready yet, waiting 5 more seconds..."
        sleep 5
    done
fi

echo "✅ MongoDB is ready!"

# Define collections to export
COLLECTIONS=(
    "Users"
    "Shops" 
    "Reservations"
    "MenuItemCategories"
    "ShopMenuItems"
    "ShopSeats"
    "ShopTimeSlots"
    "Notifications"
    "Payments"
    "Packages"
    "Discounts"
    "Advertisements"
    "Reviews"
    "UserFavorites"
    "UserPackages"
    "points"
)

echo "📤 Exporting collections to JSON format..."

# Export each collection
for collection in "${COLLECTIONS[@]}"; do
    echo "  📋 Exporting $collection..."
    
    docker-compose exec -T mongodb mongoexport \
        --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" \
        --collection="$collection" \
        --out="/tmp/${collection}.json" \
        --pretty
    
    # Copy exported file from container to host
    docker cp "checkafe-mongodb:/tmp/${collection}.json" "./$EXPORT_DIR/"
    
    # Clean up temporary file in container
    docker-compose exec mongodb rm -f "/tmp/${collection}.json"
    
    if [ -f "./$EXPORT_DIR/${collection}.json" ]; then
        # Count documents in exported file
        DOC_COUNT=$(grep -c '^{' "./$EXPORT_DIR/${collection}.json" 2>/dev/null || echo "0")
        echo "    ✅ $collection exported ($DOC_COUNT documents)"
    else
        echo "    ❌ Failed to export $collection"
    fi
done

# Create summary
echo ""
echo "📊 Export Summary:"
echo "📁 Export directory: ./$EXPORT_DIR"
echo "📄 Files created:"

for file in "./$EXPORT_DIR"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        size=$(du -h "$file" | cut -f1)
        echo "   - $filename ($size)"
    fi
done

echo ""
echo "✅ Collections export completed!"
echo "📝 All collections exported as individual JSON files" 