#!/bin/bash
# Development environment startup script for WSL/Linux

echo "🃏 Starting Poker Range Trainer Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Starting Docker..."
    sudo service docker start
    sleep 2
fi

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Building and starting containers..."
docker compose up --build -d

echo ""
echo "✅ Development environment is starting!"
echo ""
echo "📝 Access your app at: http://localhost:8080"
echo ""
echo "🔍 Useful commands:"
echo "  View logs:        docker compose logs -f"
echo "  Stop containers:  docker compose down"
echo "  Restart:          docker compose restart"
echo ""
echo "🎯 TypeScript files will auto-compile when you save changes!"
echo "   The browser will auto-reload when files change!"
echo ""

