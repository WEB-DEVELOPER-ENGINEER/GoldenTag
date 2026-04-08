#!/bin/bash

# Deployment Script for Digital Profile Hub
# This script deploys the application to a production server

set -e

# Configuration
DEPLOY_USER="${DEPLOY_USER:-www-data}"
DEPLOY_HOST="${DEPLOY_HOST:-your-server.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/digital-profile-hub}"
SERVICE_NAME="digital-profile-hub"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "=========================================="
echo "Digital Profile Hub - Deployment"
echo "=========================================="
echo ""

# Check if build exists
if [ ! -d "backend/dist" ] || [ ! -d "frontend/dist" ]; then
    print_error "Build directories not found. Please run ./scripts/build-production.sh first"
    exit 1
fi

print_info "Deploying to: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
echo ""

# Create deployment directory structure on server
print_info "Creating directory structure on server..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}/{backend,frontend,logs}"

# Deploy backend
print_info "Deploying backend..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '.env.development' \
    --exclude 'uploads' \
    backend/dist/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/dist/

rsync -avz \
    backend/package*.json \
    backend/prisma/ \
    backend/.env.production.example \
    ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/

# Deploy frontend
print_info "Deploying frontend..."
rsync -avz --delete \
    frontend/dist/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend/dist/

# Deploy deployment configs
print_info "Deploying configuration files..."
rsync -avz \
    backend/deployment/ \
    ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/deployment/

# Install production dependencies on server
print_info "Installing production dependencies on server..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npm ci --production"

# Run database migrations
print_info "Running database migrations..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npm run prisma:migrate:deploy"

# Create upload directories
print_info "Setting up upload directories..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}/backend/uploads/{avatars,backgrounds,pdfs}"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}/backend/uploads"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "chmod -R 755 ${DEPLOY_PATH}/backend/uploads"

# Restart service
print_info "Restarting service..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "sudo systemctl restart ${SERVICE_NAME}"

# Check service status
print_info "Checking service status..."
sleep 2
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "sudo systemctl status ${SERVICE_NAME} --no-pager" || true

echo ""
print_status "Deployment completed successfully!"
echo ""
print_info "Post-deployment checklist:"
echo "  1. Verify the application is running: curl https://yourdomain.com/health"
echo "  2. Check logs: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'tail -f ${DEPLOY_PATH}/logs/app.log'"
echo "  3. Monitor service: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'sudo systemctl status ${SERVICE_NAME}'"
