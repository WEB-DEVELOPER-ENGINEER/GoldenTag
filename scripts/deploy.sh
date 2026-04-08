#!/bin/bash

# =============================================================================
# Deployment Script for Digital Profile Hub
# =============================================================================
# This script deploys the application to a VPS running multiple apps
# 
# CONFIGURATION:
# - Backend Port: 3003 (3001=rasheqa, 3002=fitness-funnel)
# - Deploy Path: /var/www/profile-hub
# - PM2 App Name: profile-hub-api
# =============================================================================

set -e

# Configuration - CUSTOMIZE THESE
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-91.108.113.135}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/profile-hub}"
PM2_APP_NAME="profile-hub-api"
BACKEND_PORT="3003"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=========================================="
    echo -e "$1"
    echo -e "==========================================${NC}"
}

print_header "Digital Profile Hub - Deployment"
echo ""

# Check if build exists
if [ ! -d "backend/dist" ] || [ ! -d "frontend/dist" ]; then
    print_error "Build directories not found. Please run ./scripts/build-production.sh first"
    exit 1
fi

print_info "Deploying to: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
print_info "Backend Port: ${BACKEND_PORT}"
print_info "PM2 App Name: ${PM2_APP_NAME}"
echo ""

# Create deployment directory structure on server
print_info "Creating directory structure on server..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}/{backend,frontend,logs,deployment}"

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
    backend/.env.production.example \
    ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/

# Deploy Prisma files
print_info "Deploying Prisma schema..."
rsync -avz \
    backend/prisma/ \
    ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/prisma/

# Deploy PM2 ecosystem file
print_info "Deploying PM2 ecosystem configuration..."
rsync -avz \
    backend/ecosystem.config.js \
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

# Deploy scripts
print_info "Deploying production start script..."
rsync -avz \
    backend/scripts/start-production.sh \
    ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/scripts/

ssh ${DEPLOY_USER}@${DEPLOY_HOST} "chmod +x ${DEPLOY_PATH}/backend/scripts/start-production.sh"

# Install production dependencies on server
print_info "Installing production dependencies on server..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npm ci --production"

# Generate Prisma Client
print_info "Generating Prisma client..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npx prisma generate"

# Run database migrations
print_info "Running database migrations..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npx prisma migrate deploy"

# Create upload directories
print_info "Setting up upload directories..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}/backend/uploads/{avatars,backgrounds,pdfs}"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "chmod -R 755 ${DEPLOY_PATH}/backend/uploads"

# Check if PM2 is installed
print_info "Checking PM2 installation..."
if ! ssh ${DEPLOY_USER}@${DEPLOY_HOST} "command -v pm2 &> /dev/null"; then
    print_info "PM2 not found. Installing PM2..."
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "npm install -g pm2"
fi

# Stop existing PM2 process if running
print_info "Managing PM2 process..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 stop ${PM2_APP_NAME} || true"
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 delete ${PM2_APP_NAME} || true"

# Start application with PM2 using ecosystem file
print_info "Starting application with PM2..."
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && pm2 start ecosystem.config.js"

# Save PM2 configuration
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 save"

# Setup PM2 startup script (if not already done)
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 startup systemd -u ${DEPLOY_USER} --hp /root || true"

# Check PM2 status
print_info "Checking PM2 status..."
sleep 2
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "pm2 list"

echo ""
print_status "Deployment completed successfully!"
echo ""
print_header "Post-Deployment Information"
echo ""
print_info "Backend running on: http://localhost:${BACKEND_PORT}"
print_info "PM2 App Name: ${PM2_APP_NAME}"
echo ""
print_info "Useful Commands:"
echo "  • View logs: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 logs ${PM2_APP_NAME}'"
echo "  • Check status: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 status'"
echo "  • Restart app: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 restart ${PM2_APP_NAME}'"
echo "  • Stop app: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 stop ${PM2_APP_NAME}'"
echo ""
print_info "Next Steps:"
echo "  1. Configure nginx: sudo cp ${DEPLOY_PATH}/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub"
echo "  2. Enable site: sudo ln -s /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/"
echo "  3. Test nginx: sudo nginx -t"
echo "  4. Reload nginx: sudo systemctl reload nginx"
echo "  5. Setup SSL: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
