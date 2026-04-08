#!/bin/bash

# =============================================================================
# Production Startup Script for Digital Profile Hub Backend
# =============================================================================
# Port: 3003 (to avoid conflicts with other apps on the VPS)
# =============================================================================

set -e

echo "Starting Digital Profile Hub Backend in Production Mode..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load environment variables
export NODE_ENV=production
source .env.production

# Ensure PORT is set to 3003
export PORT=${PORT:-3003}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --production
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create upload directories if they don't exist
echo "Setting up upload directories..."
mkdir -p "${UPLOAD_DIR}/avatars"
mkdir -p "${UPLOAD_DIR}/backgrounds"
mkdir -p "${UPLOAD_DIR}/pdfs"

# Set proper permissions
chmod -R 755 "${UPLOAD_DIR}"

# Start the server
echo "Starting server on port ${PORT}..."
node dist/index.js
