# Quick VPS Setup Guide

## Database Info
- **Database**: `golden_tag`
- **User**: `dbuser`
- **Location**: `/var/www/GoldenTag`

## One-Command Setup

Run this on your VPS:

```bash
cd /var/www/GoldenTag
chmod +x setup-on-vps.sh
./setup-on-vps.sh
```

This script will:
1. Fix database permissions for `dbuser` on `golden_tag`
2. Create `.env.production` files with correct settings
3. Build backend and frontend
4. Run database migrations
5. Generate SSL certificate
6. Configure nginx
7. Start the app with PM2

## After Setup

### 1. Update Database Password

Edit the backend environment file:
```bash
nano /var/www/GoldenTag/backend/.env.production
```

Change this line with your actual password:
```env
DATABASE_URL="postgresql://dbuser:your-actual-password@localhost:5432/golden_tag?schema=public"
```

Then restart:
```bash
pm2 restart profile-hub-api
```

### 2. Access Your App

Open in browser: `https://91.108.113.135:9443`

(Accept the self-signed certificate warning)

## Manual Steps (if script fails)

### Fix Database Permissions
```bash
sudo -u postgres psql -d golden_tag -c "
GRANT ALL ON SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbuser;
GRANT CREATE ON SCHEMA public TO dbuser;
ALTER DATABASE golden_tag OWNER TO dbuser;
"
```

### Create Backend .env.production
```bash
cd /var/www/GoldenTag/backend
nano .env.production
```

Paste this (update password):
```env
DATABASE_URL="postgresql://dbuser:your-password@localhost:5432/golden_tag?schema=public"
JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
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
```

### Create Frontend .env.production
```bash
cd /var/www/GoldenTag/frontend
nano .env.production
```

Paste this:
```env
VITE_API_URL=https://91.108.113.135:9443
```

### Build
```bash
cd /var/www/GoldenTag/backend
npm ci --production=false
npm run build:production

cd /var/www/GoldenTag/frontend
npm ci
npm run build
```

### Run Migrations
```bash
cd /var/www/GoldenTag/backend
npx prisma migrate deploy
```

### Generate SSL Certificate
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/profile-hub.key \
    -out /etc/nginx/ssl/profile-hub.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=91.108.113.135"
sudo chmod 600 /etc/nginx/ssl/profile-hub.key
sudo chmod 644 /etc/nginx/ssl/profile-hub.crt
```

### Configure Nginx
```bash
sudo cp /var/www/GoldenTag/backend/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub
sudo ln -s /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Start with PM2
```bash
cd /var/www/GoldenTag/backend
mkdir -p /var/www/GoldenTag/logs
pm2 start ecosystem.config.js
pm2 save
```

## Useful Commands

```bash
# View logs
pm2 logs profile-hub-api

# Restart app
pm2 restart profile-hub-api

# Check status
pm2 list

# View nginx logs
sudo tail -f /var/log/nginx/profile-hub-error.log

# Test backend directly
curl http://localhost:3003/api/health

# Test through nginx
curl -k https://91.108.113.135:9443/api/health
```

## Troubleshooting

### PM2 won't start
```bash
# Check if dist folder exists
ls -la /var/www/GoldenTag/backend/dist/

# Check logs directory
mkdir -p /var/www/GoldenTag/logs

# Try starting manually
cd /var/www/GoldenTag/backend
node dist/index.js
```

### Database connection error
```bash
# Test database connection
psql -U dbuser -d golden_tag -h localhost

# Check .env.production
cat /var/www/GoldenTag/backend/.env.production | grep DATABASE_URL
```

### Nginx error
```bash
# Check nginx config
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/profile-hub-error.log

# Restart nginx
sudo systemctl restart nginx
```

### Port already in use
```bash
# Check port 9443
sudo lsof -i :9443

# Check port 3003
sudo lsof -i :3003
```

## Port Allocation

- **3001**: Rasheqa backend
- **3002**: Fitness Funnel backend
- **3003**: Profile Hub backend ← This app
- **8080/8443**: Fitness Funnel nginx
- **9080/9443**: Profile Hub nginx ← This app
