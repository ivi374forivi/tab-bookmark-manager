#!/bin/bash

# Setup script for Tab & Bookmark Manager

set -e

echo "🚀 Setting up Tab & Bookmark Manager..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create environment files
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env"
fi

if [ ! -f ml-service/.env ]; then
  cp ml-service/.env.example ml-service/.env
  echo "✅ Created ml-service/.env"
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
cd infrastructure/docker
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Services:"
echo "   - Backend API: http://localhost:3000"
echo "   - ML Service: http://localhost:5000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "🔖 To load the browser extension:"
echo "   1. Open Chrome/Edge and go to chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the 'extension' directory"
echo ""
echo "📚 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
