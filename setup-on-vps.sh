#!/bin/bash

# =============================================================================
# Quick Setup Script for VPS
# =============================================================================
# Run this script on your VPS at /var/www/GoldenTag
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo "=========================================="
echo "Profile Hub - VPS Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from /var/www/GoldenTag"
    exit 1
fi

# Step 1: Fix database permissions
print_info "Step 1: Fixing database permissions..."
sudo -u postgres psql -d golden_tag -c "
GRANT ALL ON SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbuser;
GRANT CREATE ON SCHEMA public TO dbuser;
ALTER DATABASE golden_tag OWNER TO dbuser;
" && print_status "Database permissions fixed" || print_error "Failed to fix database permissions"

# Step 2: Create .env.production for backend
print_info "Step 2: Creating backend .env.production..."

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

cat > backend/.env.production << EOF
# Production Environment Configuration
DATABASE_URL="postgresql://dbuser:your-password-here@localhost:5432/golden_tag?schema=public"
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"
PORT=3003
NODE_ENV="production"
CORS_ORIGIN="https://91.108.113.135:9443"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/var/www/GoldenTag/backend/uploads"
FRONTEND_URL="https://91.108.113.135:9443"
STORAGE_PROVIDER="local"
FORCE_HTTPS="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
LOG_LEVEL="info"
LOG_FILE="/var/www/GoldenTag/logs/app.log"
EOF

print_status "Backend .env.production created"
print_info "⚠️  IMPORTANT: Edit backend/.env.production and update the database password!"

# Step 3: Create .env.production for frontend
print_info "Step 3: Creating frontend .env.production..."
cat > frontend/.env.production << EOF
VITE_API_URL=https://91.108.113.135:9443
EOF
print_status "Frontend .env.production created"

# Step 4: Create directories
print_info "Step 4: Creating directories..."
mkdir -p backend/uploads/{avatars,backgrounds,pdfs}
mkdir -p logs
chmod -R 755 backend/uploads
print_status "Directories created"

# Step 5: Build backend
print_info "Step 5: Building backend..."
cd backend
npm ci --production=false
npm run build:production
print_status "Backend built"

# Step 6: Build frontend
print_info "Step 6: Building frontend..."
cd ../frontend
npm ci
npm run build
print_status "Frontend built"
cd ..

# Step 7: Run migrations
print_info "Step 7: Running database migrations..."
cd backend
npx prisma migrate deploy
print_status "Migrations completed"
cd ..

# Step 8: Generate SSL certificate
print_info "Step 8: Generating SSL certificate..."
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/profile-hub.key \
    -out /etc/nginx/ssl/profile-hub.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=91.108.113.135" 2>/dev/null
sudo chmod 600 /etc/nginx/ssl/profile-hub.key
sudo chmod 644 /etc/nginx/ssl/profile-hub.crt
print_status "SSL certificate generated"

# Step 9: Configure nginx
print_info "Step 9: Configuring nginx..."
sudo cp backend/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub
sudo ln -sf /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
print_status "Nginx configured and reloaded"

# Step 10: Start with PM2
print_info "Step 10: Starting application with PM2..."
cd backend
pm2 stop profile-hub-api 2>/dev/null || true
pm2 delete profile-hub-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
print_status "Application started with PM2"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
print_info "Access your application at: https://91.108.113.135:9443"
echo ""
print_info "⚠️  IMPORTANT: Edit backend/.env.production and update the database password!"
echo "   Then restart: pm2 restart profile-hub-api"
echo ""
print_info "Useful commands:"
echo "  • View logs: pm2 logs profile-hub-api"
echo "  • Check status: pm2 list"
echo "  • Restart: pm2 restart profile-hub-api"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/profile-hub-error.log"
echo ""
