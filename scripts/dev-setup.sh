#!/bin/bash

# Development setup script

set -e

echo "🔧 Setting up development environment..."

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# ML service setup
echo "🐍 Setting up ML service..."
cd ml-service
python -m venv venv
source venv/bin/activate || . venv/Scripts/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..

# Create required directories
echo "📁 Creating required directories..."
mkdir -p backend/logs backend/archives
mkdir -p ml-service/models

echo "✅ Development environment ready!"
echo ""
echo "To start development:"
echo "  Backend: cd backend && npm run dev"
echo "  ML Service: cd ml-service && source venv/bin/activate && python src/app.py"
