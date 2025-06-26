#!/bin/bash

# Set UTF-8 encoding
export LANG=en_US.UTF-8

echo "🚀 Auto Deploy Script Started at $(date)"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Pull latest code from main branch
echo "📥 Pulling latest code from main branch..."
git fetch origin
git reset --hard origin/main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo "✅ Code updated successfully!"

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down

# Build and start all services
echo "🔨 Building and starting all services..."
docker compose up -d --build

if [ $? -ne 0 ]; then
    echo "❌ Docker compose failed!"
    exit 1
fi

# Wait a moment for services to start
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker compose ps

echo "✅ Auto deploy completed at $(date)"
echo "🌟 All services are now running with latest code!"
echo "📊 Admin Panel: http://localhost:3002"
echo "🔧 Backend API: http://localhost:3000"

# Fix file permissions for shell scripts
echo "🔧 Fixing file permissions..."
chmod +x comand/*.sh

# Restart Docker services
echo "🐳 Restarting Docker services..."
docker compose down
docker compose up -d --build

echo "✅ Deploy completed successfully!" 