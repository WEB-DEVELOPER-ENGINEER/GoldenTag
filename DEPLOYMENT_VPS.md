# Digital Profile Hub - VPS Deployment Guide

This guide covers deploying the Digital Profile Hub on a VPS that already hosts other applications.

## Configuration Summary

- **Backend Port**: 3003 (avoiding conflicts with rasheqa:3001 and fitness-funnel:3002)
- **HTTP Port**: 9080 (nginx)
- **HTTPS Port**: 9443 (nginx)
- **Deploy Path**: `/var/www/profile-hub`
- **PM2 App Name**: `profile-hub-api`
- **Database**: PostgreSQL (database: `golden_tag`)
- **Process Manager**: PM2
- **Access URL**: `https://91.108.113.135:9443`

## Prerequisites

Your VPS should already have:
- Node.js and npm
- PostgreSQL
- Nginx
- PM2 (for process management)
- OpenSSL (for SSL certificates)

## Step 1: Prepare Local Environment

### 1.1 Configure Production Environment Files

```bash
# Backend configuration
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

Update these critical values in `backend/.env.production`:
```env
DATABASE_URL="postgresql://dbuser:secure-password@localhost:5432/profile_hub?schema=public"
JWT_SECRET="your-secure-jwt-secret-32-chars-minimum"
PORT=3003
CORS_ORIGIN="https://yourdomain.com"
UPLOAD_DIR="/var/www/profile-hub/backend/uploads"
FRONTEND_URL="https://yourdomain.com"
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# Frontend configuration
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

Update `frontend/.env.production`:
```env
VITE_API_URL=https://yourdomain.com
```

### 1.2 Build the Application

```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

This will create:
- `backend/dist/` - Compiled backend code
- `frontend/dist/` - Production frontend build

## Step 2: Prepare VPS Database

SSH into your VPS and create the database:

```bash
ssh root@91.108.113.135

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE profile_hub;
CREATE USER profile_hub_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE profile_hub TO profile_hub_user;
\q
```

## Step 3: Deploy Application

### 3.1 Configure Deployment Script

Edit `scripts/deploy.sh` if needed (defaults should work):
```bash
DEPLOY_USER="root"
DEPLOY_HOST="91.108.113.135"
DEPLOY_PATH="/var/www/profile-hub"
BACKEND_PORT="3003"
```

### 3.2 Run Deployment

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script will:
1. Create directory structure on VPS
2. Deploy backend and frontend files
3. Install dependencies
4. Run database migrations
5. Setup upload directories
6. Start application with PM2

## Step 4: Configure Nginx

### 4.1 Copy Nginx Configuration

```bash
ssh root@91.108.113.135

# Copy nginx config
sudo cp /var/www/profile-hub/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub

# Edit the config to set your domain
sudo nano /etc/nginx/sites-available/digital-profile-hub
```

Replace `yourdomain.com` with your actual domain throughout the file.

### 4.2 Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4.3 Setup SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure HTTPS
```

After SSL is setup, edit the nginx config to uncomment the HTTPS block and enable HTTP to HTTPS redirect.

## Step 5: Verify Deployment

### 5.1 Check PM2 Status

```bash
ssh root@91.108.113.135
pm2 list
```

You should see `profile-hub-api` running on port 3003.

### 5.2 Check Logs

```bash
# View PM2 logs
pm2 logs profile-hub-api

# View last 50 lines
pm2 logs profile-hub-api --lines 50
```

### 5.3 Test API

```bash
# Test health endpoint
curl http://localhost:3003/api/health

# Test from outside (after nginx setup)
curl https://yourdomain.com/api/health
```

### 5.4 Test Frontend

Visit `https://yourdomain.com` in your browser.

## Step 6: Post-Deployment Configuration

### 6.1 Setup PM2 Startup

Ensure PM2 starts on server reboot:

```bash
pm2 startup systemd -u root --hp /root
pm2 save
```

### 6.2 Configure Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Useful Commands

### PM2 Management

```bash
# View all apps
pm2 list

# View logs
pm2 logs profile-hub-api

# Restart app
pm2 restart profile-hub-api

# Stop app
pm2 stop profile-hub-api

# Start app
pm2 start profile-hub-api

# Delete app from PM2
pm2 delete profile-hub-api

# Monitor resources
pm2 monit
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/profile-hub-error.log

# View access logs
sudo tail -f /var/log/nginx/profile-hub-access.log
```

### Database Management

```bash
# Connect to database
psql -U profile_hub_user -d profile_hub

# Run migrations manually
cd /var/www/profile-hub/backend
npx prisma migrate deploy

# View migration status
npx prisma migrate status
```

### File Permissions

```bash
# Fix upload directory permissions
sudo chown -R www-data:www-data /var/www/profile-hub/backend/uploads
sudo chmod -R 755 /var/www/profile-hub/backend/uploads
```

## Updating the Application

When you need to deploy updates:

```bash
# On your local machine
./scripts/build-production.sh
./scripts/deploy.sh
```

The deploy script will:
1. Deploy new files
2. Install any new dependencies
3. Run new migrations
4. Restart the PM2 process

## Troubleshooting

### App Not Starting

```bash
# Check PM2 logs
pm2 logs profile-hub-api --err

# Check if port 3003 is in use
sudo lsof -i :3003

# Restart app
pm2 restart profile-hub-api
```

### Database Connection Issues

```bash
# Test database connection
psql -U profile_hub_user -d profile_hub -h localhost

# Check DATABASE_URL in .env.production
cat /var/www/profile-hub/backend/.env.production | grep DATABASE_URL
```

### Nginx Issues

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/profile-hub-error.log

# Test nginx config
sudo nginx -t

# Check if nginx is running
sudo systemctl status nginx
```

### Upload Issues

```bash
# Check upload directory exists and has correct permissions
ls -la /var/www/profile-hub/backend/uploads

# Fix permissions
sudo chmod -R 755 /var/www/profile-hub/backend/uploads
```

### Port Conflicts

If port 3003 is already in use:

1. Edit `backend/.env.production` and change PORT
2. Edit `backend/deployment/nginx.conf` and update upstream port
3. Redeploy

## Security Checklist

- [ ] Strong JWT_SECRET configured
- [ ] Database password is secure
- [ ] SSL certificate installed and working
- [ ] CORS_ORIGIN set to your domain only
- [ ] File upload limits configured (10MB default)
- [ ] Rate limiting enabled in nginx
- [ ] PM2 startup script configured
- [ ] Log rotation configured
- [ ] Firewall rules configured (if applicable)
- [ ] Regular backups scheduled

## Backup Strategy

### Database Backup

```bash
# Create backup
pg_dump -U profile_hub_user profile_hub > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U profile_hub_user profile_hub < backup_20240101.sql
```

### File Backup

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/profile-hub/backend/uploads
```

## Monitoring

### Setup Monitoring (Optional)

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit
```

### Health Checks

Add a cron job to check if the app is running:

```bash
crontab -e

# Add this line to check every 5 minutes
*/5 * * * * curl -f http://localhost:3003/api/health || pm2 restart profile-hub-api
```

## Support

For issues specific to this deployment:
1. Check PM2 logs: `pm2 logs profile-hub-api`
2. Check nginx logs: `sudo tail -f /var/log/nginx/profile-hub-error.log`
3. Check database connectivity
4. Verify environment variables are set correctly

## Port Allocation on Your VPS

- Port 3001: Rasheqa (Next.js)
- Port 3002: Fitness Funnel (Next.js)
- Port 3003: Profile Hub (Express.js) ← This app
- Port 443: Nginx HTTPS (Rasheqa)
- Port 8443: Nginx HTTPS (Fitness Funnel)
- Port 80/443: Available for Profile Hub HTTPS

Your Profile Hub can use standard ports 80/443 with a different domain name, or you can configure it on custom ports like 9443 if needed.
