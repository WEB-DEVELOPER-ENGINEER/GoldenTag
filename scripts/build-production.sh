#!/bin/bash

# Production Build Script for Digital Profile Hub
# This script builds both frontend and backend for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Build Backend
echo "Building Backend..."
echo "-------------------"

cd backend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_info ".env.production not found, using .env.production.example as template"
    if [ -f .env.production.example ]; then
        print_info "Please copy .env.production.example to .env.production and configure it"
    fi
fi

# Install dependencies
print_info "Installing backend dependencies..."
npm ci --production=false

# Generate Prisma client
print_info "Generating Prisma client..."
npm run prisma:generate

# Build TypeScript
print_info "Compiling TypeScript..."
npm run build:production

if [ -d "dist" ]; then
    print_status "Backend build completed successfully"
else
    print_error "Backend build failed - dist directory not found"
    exit 1
fi

cd ..

# Build Frontend
echo ""
echo "Building Frontend..."
echo "-------------------"

cd frontend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_info ".env.production not found, using .env.production.example as template"
    if [ -f .env.production.example ]; then
        print_info "Please copy .env.production.example to .env.production and configure it"
    fi
fi

# Install dependencies
print_info "Installing frontend dependencies..."
npm ci

# Build React app
print_info "Building React application..."
npm run build:production

if [ -d "dist" ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi

cd ..

# Summary

echo "  2. Run database migrations: cd backend && npm run prisma:migrate:deploy"
echo "  3. Deploy the built files to your production server"
echo "  4. Start the backend: cd backend && npm run start:production"
echo "  5. Serve frontend/dist with nginx or your web server"
echo ""
print_status "Production build completed successfully!"
