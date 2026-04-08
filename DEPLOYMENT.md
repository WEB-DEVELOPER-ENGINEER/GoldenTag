# Digital Profile Hub - Deployment Guide

This guide provides comprehensive instructions for deploying the Digital Profile Hub application to a production environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Building the Application](#building-the-application)
6. [Deployment](#deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or later (or similar Linux distribution)
- **CPU**: 2+ cores recommended
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum, 50GB+ recommended for user uploads
- **Node.js**: v18.x or later
- **PostgreSQL**: v14 or later
- **Nginx**: Latest stable version

### Domain and SSL

- A registered domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

### Access Requirements

- SSH access to the server
- Sudo privileges for system configuration
- Database admin credentials

## Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

### 5. Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace yourdomain.com with your actual domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 6. Create Application User and Directories

```bash
# Create application directory
sudo mkdir -p /var/www/digital-profile-hub
sudo mkdir -p /var/log/digital-profile-hub

# Set ownership (using www-data user)
sudo chown -R www-data:www-data /var/www/digital-profile-hub
sudo chown -R www-data:www-data /var/log/digital-profile-hub

# Create upload directories
sudo mkdir -p /var/www/digital-profile-hub/backend/uploads/{avatars,backgrounds,pdfs}
sudo chown -R www-data:www-data /var/www/digital-profile-hub/backend/uploads
sudo chmod -R 755 /var/www/digital-profile-hub/backend/uploads
```

## Environment Configuration

### 1. Backend Environment Variables

Create `/var/www/digital-profile-hub/backend/.env.production`:

```bash
# Database
DATABASE_URL="postgresql://dbuser:dbpassword@localhost:5432/digital_profile_hub?schema=public&sslmode=require"

# JWT Configuration
JWT_SECRET="your-secure-random-string-at-least-32-characters-long"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="production"

# CORS Configuration
CORS_ORIGIN="https://yourdomain.com"

# Frontend URL
FRONTEND_URL="https://yourdomain.com"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/var/www/digital-profile-hub/backend/uploads"

# Storage Provider
STORAGE_PROVIDER="local"

# Security
FORCE_HTTPS="true"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/digital-profile-hub/app.log"
```

**Important**: Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend Environment Variables

Create `/var/www/digital-profile-hub/frontend/.env.production`:

```bash
# Backend API URL
VITE_API_URL=https://yourdomain.com/api
```

## Database Setup

### 1. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE digital_profile_hub;
CREATE USER dbuser WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE digital_profile_hub TO dbuser;
\q
```

### 2. Configure PostgreSQL for Production

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
# Connection settings
max_connections = 100
shared_buffers = 256MB

# Enable SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## Building the Application

### 1. Clone Repository (on your local machine)

```bash
git clone <your-repository-url>
cd digital-profile-hub
```

### 2. Configure Environment Files

Copy and configure environment files:

```bash
# Backend
cp backend/.env.production.example backend/.env.production
# Edit backend/.env.production with your production values

# Frontend
cp frontend/.env.production.example frontend/.env.production
# Edit frontend/.env.production with your production values
```

### 3. Build the Application

Run the production build script:

```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

This will:
- Install dependencies for both frontend and backend
- Generate Prisma client
- Compile TypeScript for backend
- Build React application for frontend
- Create optimized production bundles

## Deployment

### Method 1: Manual Deployment

#### 1. Transfer Files to Server

```bash
# Transfer backend
rsync -avz --exclude 'node_modules' --exclude '.env' \
  backend/dist/ www-data@yourdomain.com:/var/www/digital-profile-hub/backend/dist/

rsync -avz backend/package*.json backend/prisma/ backend/.env.production \
  www-data@yourdomain.com:/var/www/digital-profile-hub/backend/

# Transfer frontend
rsync -avz frontend/dist/ \
  www-data@yourdomain.com:/var/www/digital-profile-hub/frontend/dist/

# Transfer deployment configs
rsync -avz backend/deployment/ \
  www-data@yourdomain.com:/var/www/digital-profile-hub/deployment/
```

#### 2. Install Dependencies on Server

```bash
ssh www-data@yourdomain.com
cd /var/www/digital-profile-hub/backend
npm ci --production
```

#### 3. Run Database Migrations

```bash
cd /var/www/digital-profile-hub/backend
npm run prisma:migrate:deploy
```

### Method 2: Automated Deployment Script

Configure the deployment script:

```bash
export DEPLOY_USER="www-data"
export DEPLOY_HOST="yourdomain.com"
export DEPLOY_PATH="/var/www/digital-profile-hub"

chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Configure Systemd Service

#### 1. Copy Service File

```bash
sudo cp /var/www/digital-profile-hub/deployment/digital-profile-hub.service \
  /etc/systemd/system/
```

#### 2. Update Service File

Edit `/etc/systemd/system/digital-profile-hub.service` and update paths if needed.

#### 3. Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable digital-profile-hub

# Start the service
sudo systemctl start digital-profile-hub

# Check status
sudo systemctl status digital-profile-hub
```

### Configure Nginx

#### 1. Copy Nginx Configuration

```bash
sudo cp /var/www/digital-profile-hub/deployment/nginx.conf \
  /etc/nginx/sites-available/digital-profile-hub
```

#### 2. Update Configuration

Edit `/etc/nginx/sites-available/digital-profile-hub`:
- Replace `yourdomain.com` with your actual domain
- Update SSL certificate paths if needed
- Adjust rate limiting as needed

#### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/digital-profile-hub \
  /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Post-Deployment

### 1. Verify Application is Running

```bash
# Check backend health
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Create Admin User

Connect to the database and update a user's role:

```bash
sudo -u postgres psql digital_profile_hub

UPDATE "User" SET role = 'admin' WHERE email = 'admin@yourdomain.com';
\q
```

### 3. Test Key Functionality

- Register a new user account
- Upload profile picture
- Create links
- Generate QR code
- Access public profile page

### 4. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Monitoring and Maintenance

### View Application Logs

```bash
# Application logs
sudo tail -f /var/log/digital-profile-hub/app.log

# Error logs
sudo tail -f /var/log/digital-profile-hub/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/digital-profile-hub-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/digital-profile-hub-error.log

# Systemd service logs
sudo journalctl -u digital-profile-hub -f
```

### Service Management

```bash
# Start service
sudo systemctl start digital-profile-hub

# Stop service
sudo systemctl stop digital-profile-hub

# Restart service
sudo systemctl restart digital-profile-hub

# Check status
sudo systemctl status digital-profile-hub

# View recent logs
sudo journalctl -u digital-profile-hub -n 100
```

### Database Backup

Create a backup script `/var/www/digital-profile-hub/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/digital-profile-hub"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U dbuser digital_profile_hub | gzip > \
  $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Schedule with cron:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/digital-profile-hub/scripts/backup-db.sh
```

### Update Application

```bash
# On your local machine, build new version
./scripts/build-production.sh

# Deploy to server
./scripts/deploy.sh

# Or manually:
# 1. Transfer new files
# 2. Run migrations if needed
# 3. Restart service
sudo systemctl restart digital-profile-hub
```

## Troubleshooting

### Application Won't Start

1. Check service status:
   ```bash
   sudo systemctl status digital-profile-hub
   ```

2. Check logs:
   ```bash
   sudo journalctl -u digital-profile-hub -n 50
   ```

3. Verify environment variables:
   ```bash
   cat /var/www/digital-profile-hub/backend/.env.production
   ```

4. Test database connection:
   ```bash
   cd /var/www/digital-profile-hub/backend
   npx prisma db pull
   ```

### 502 Bad Gateway

1. Check if backend is running:
   ```bash
   sudo systemctl status digital-profile-hub
   curl http://localhost:3000/health
   ```

2. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/digital-profile-hub-error.log
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Test connection:
   ```bash
   psql -U dbuser -d digital_profile_hub -h localhost
   ```

3. Check DATABASE_URL in .env.production

### File Upload Issues

1. Check upload directory permissions:
   ```bash
   ls -la /var/www/digital-profile-hub/backend/uploads
   ```

2. Ensure www-data user has write access:
   ```bash
   sudo chown -R www-data:www-data /var/www/digital-profile-hub/backend/uploads
   sudo chmod -R 755 /var/www/digital-profile-hub/backend/uploads
   ```

3. Check Nginx client_max_body_size setting

### High Memory Usage

1. Check Node.js process:
   ```bash
   ps aux | grep node
   ```

2. Restart service:
   ```bash
   sudo systemctl restart digital-profile-hub
   ```

3. Consider increasing server resources or optimizing queries

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Strong JWT secret configured (32+ characters)
- [ ] Database password is strong and secure
- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication enabled
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Rate limiting configured in Nginx
- [ ] CORS properly configured
- [ ] File upload size limits set
- [ ] Logs are being rotated
- [ ] Admin user created with strong password

## Performance Optimization

### Enable Gzip Compression in Nginx

Add to nginx.conf:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### Database Indexing

Ensure proper indexes are created (handled by Prisma migrations).

### CDN Integration (Optional)

Consider using a CDN for static assets and uploaded files for better performance.

## Support

For issues and questions:
- Check application logs
- Review this documentation
- Consult the requirements and design documents in `.kiro/specs/digital-profile-hub/`

---

**Last Updated**: 2024
**Version**: 1.0.0
