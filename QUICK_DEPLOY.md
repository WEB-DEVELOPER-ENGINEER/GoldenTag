# Quick Deployment Guide

## First Time Setup

### 1. Configure Environment

```bash
# Backend
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

Update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CORS_ORIGIN` - Your domain (e.g., https://yourdomain.com)
- `FRONTEND_URL` - Your domain

```bash
# Frontend
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

Update:
- `VITE_API_URL` - Your domain (e.g., https://yourdomain.com)

### 2. Create Database on VPS

```bash
ssh root@91.108.113.135
sudo -u postgres psql
```

```sql
CREATE DATABASE profile_hub;
CREATE USER profile_hub_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE profile_hub TO profile_hub_user;
\q
```

### 3. Build and Deploy

```bash
# Build
./scripts/build-production.sh

# Deploy
./scripts/deploy.sh
```

### 4. Configure Nginx

```bash
ssh root@91.108.113.135

# Copy and edit nginx config
sudo cp /var/www/profile-hub/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub
sudo nano /etc/nginx/sites-available/digital-profile-hub
# Replace 'yourdomain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Updating Application

```bash
# Build latest changes
./scripts/build-production.sh

# Deploy
./scripts/deploy.sh
```

## Common Commands

```bash
# View logs
ssh root@91.108.113.135 'pm2 logs profile-hub-api'

# Restart app
ssh root@91.108.113.135 'pm2 restart profile-hub-api'

# Check status
ssh root@91.108.113.135 'pm2 list'

# View nginx logs
ssh root@91.108.113.135 'sudo tail -f /var/log/nginx/profile-hub-error.log'
```

## Configuration Summary

- **Backend Port**: 3003
- **Deploy Path**: /var/www/profile-hub
- **PM2 App**: profile-hub-api
- **Database**: profile_hub
- **Nginx Config**: /etc/nginx/sites-available/digital-profile-hub

## Troubleshooting

### App won't start
```bash
ssh root@91.108.113.135
pm2 logs profile-hub-api --err
```

### Database issues
```bash
# Test connection
psql -U profile_hub_user -d profile_hub -h localhost
```

### Nginx issues
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/profile-hub-error.log
```

For detailed documentation, see `DEPLOYMENT_VPS.md`
