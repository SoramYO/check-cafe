#!/bin/bash

# Fix file permissions and commit to GitHub
echo "🔧 Fixing file permissions..."

# Navigate to project directory
cd /root/checkafe

# Fix permissions for all shell scripts
chmod +x comand/*.sh

# Add files with executable permissions to git
echo "📝 Adding files to git..."
git add comand/*.sh

# Commit changes
echo "💾 Committing changes..."
git commit -m "fix: set executable permissions for shell scripts"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Permissions fixed and committed successfully!" 