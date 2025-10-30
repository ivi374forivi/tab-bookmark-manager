#!/bin/bash

# Database migration script

set -e

echo "🗄️ Running database migrations..."

# Set database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-tab_bookmark_manager}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

export PGPASSWORD=$DB_PASSWORD

echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."

# Enable pgvector extension
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "✅ Database migrations complete!"
