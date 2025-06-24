#!/bin/bash

# Set UTF-8 encoding
export LANG=en_US.UTF-8

echo "🚀 Starting MongoDB backup to GitHub..."

# Create backup directory if not exists
backup_dir="mongodb_backup"
mkdir -p "$backup_dir"

# Generate timestamp
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_file="checkafe_backup.gz"

echo "📦 Creating database backup..."

# Create backup using mongodump
docker compose exec -T mongodb mongodump --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --archive --gzip > "$backup_dir/$backup_file"

if [ $? -ne 0 ]; then
    echo "❌ Database backup failed!"
    read -p "Press Enter to continue..."
    exit 1
fi

echo "✅ Database backup completed!"

# Create backup info file
cat > "$backup_dir/backup_info.md" << EOF
# Database Backup Information

- **Backup Date:** $(date)
- **Backup File:** $backup_file
- **Database:** checkafe
- **Size:** $(du -h "$backup_dir/$backup_file" | cut -f1)
- **Created by:** restore_from_github.sh

## Backup Details
- Format: MongoDB Archive (gzip)
- Contains: All collections and data
- Authentication: admin/adminPassword123

## Restore Command
\`\`\`bash
docker compose exec -T mongodb mongorestore --uri="mongodb://admin:adminPassword123@localhost:27017/checkafe?authSource=admin" --archive --gzip --drop < $backup_file
\`\`\`
EOF

echo "📋 Backup information saved to $backup_dir/backup_info.md"

# Add files to git
echo "📝 Adding backup files to git..."
git add "$backup_dir/"

# Commit changes
echo "💾 Committing backup to git..."
git commit -m "Database backup - $(date)"

# Push to GitHub
echo "📤 Pushing backup to GitHub..."
git push origin

if [ $? -ne 0 ]; then
    echo "❌ Git push failed!"
    echo "💡 Make sure you have:"
    echo "   - Proper git credentials"
    echo "   - Write access to repository"
    echo "   - Internet connection"
    read -p "Press Enter to continue..."
    exit 1
fi

echo "✅ Backup successfully pushed to GitHub!"
echo "📊 Backup file: $backup_dir/$backup_file"
echo "📋 Info file: $backup_dir/backup_info.md"
echo "🌐 Repository: $(git remote get-url origin)"

read -p "Press Enter to continue..." 