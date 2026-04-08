# Profile Hub - Complete Setup Instructions

## Quick Setup Summary

**Access URL**: `https://91.108.113.135:9443`
**Backend**: Port 3003
**Database**: `golden_tag` (existing database)

## Step 1: Fix Database Permissions (On VPS)

```bash
cd /var/www/GoldenTag

# Run the permission fix script
chmod +x scripts/fix-db-permissions.sh
./scripts/fix-db-permissions.sh
```

Or manually:
```bash
# Get your database user from .env
cat backend/.env | grep DATABASE_URL

# Fix permissions (replace 'your_db_user' with actual username)
sudo -u postgres psql -d golden_tag -c "
GRANT ALL ON SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_db_user;
GRANT CREATE ON SCHEMA public TO your_db_user;
ALTER DATABASE golden_tag OWNER TO your_db_user;
"
```

## Step 2: Configure Environment Files (On VPS)

### Backend Configuration

Edit `/var/www/GoldenTag/backend/.env.production`:

```bash
nano /var/www/GoldenTag/backend/.env.production
```

Update these values:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/golden_tag?schema=public"
JWT_SECRET="generate-with-command-below"
PORT=3003
CORS_ORIGIN="https://91.108.113.135:9443"
FRONTEND_URL="https://91.108.113.135:9443"
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

The file is already created at `/var/www/GoldenTag/frontend/.env.production`:
```env
VITE_API_URL=https://91.108.113.135:9443
```

## Step 3: Build the Application (On VPS)

```bash
cd /var/www/GoldenTag

# Build backend
cd backend
npm ci --production=false
npm run build:production

# Build frontend
cd ../frontend
npm ci
npm run build

cd ..
```

## Step 4: Run Database Migrations (On VPS)

```bash
cd /var/www/GoldenTag/backend
npm run prisma:migrate:deploy
```

## Step 5: Setup Upload Directories (On VPS)

```bash
mkdir -p /var/www/profile-hub/backend/uploads/{avatars,backgrounds,pdfs}
mkdir -p /var/www/profile-hub/logs

# If deploying from /var/www/GoldenTag, create symlink or copy
cp -r /var/www/GoldenTag/backend/uploads/* /var/www/profile-hub/backend/uploads/ 2>/dev/null || true
```

## Step 6: Generate SSL Certificate (On VPS)

```bash
cd /var/www/GoldenTag
chmod +x scripts/generate-ssl-cert.sh
./scripts/generate-ssl-cert.sh
```

Or manually:
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/profile-hub.key \
    -out /etc/nginx/ssl/profile-hub.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=91.108.113.135"
sudo chmod 600 /etc/nginx/ssl/profile-hub.key
sudo chmod 644 /etc/nginx/ssl/profile-hub.crt
```

## Step 7: Configure Nginx (On VPS)

```bash
# Copy nginx configuration
sudo cp /var/www/GoldenTag/backend/deployment/nginx.conf /etc/nginx/sites-available/digital-profile-hub

# Create symlink
sudo ln -s /etc/nginx/sites-available/digital-profile-hub /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 8: Start Application with PM2 (On VPS)

```bash
cd /var/www/GoldenTag/backend

# Copy ecosystem file to deployment location
mkdir -p /var/www/profile-hub/backend
cp ecosystem.config.js /var/www/profile-hub/backend/
cp -r dist /var/www/profile-hub/backend/
cp -r node_modules /var/www/profile-hub/backend/
cp -r prisma /var/www/profile-hub/backend/
cp .env.production /var/www/profile-hub/backend/
cp package*.json /var/www/profile-hub/backend/

# Copy frontend
mkdir -p /var/www/profile-hub/frontend
cp -r /var/www/GoldenTag/frontend/dist /var/www/profile-hub/frontend/

# Start with PM2
cd /var/www/profile-hub/backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (if not already done)
pm2 startup systemd -u root --hp /root
```

## Step 9: Verify Deployment

### Check PM2 Status
```bash
pm2 list
pm2 logs profile-hub-api
```

### Check Backend
```bash
curl http://localhost:3003/api/health
```

### Check Nginx
```bash
curl -k https://91.108.113.135:9443/api/health
```

### Access in Browser
Open: `https://91.108.113.135:9443`

(Accept the self-signed certificate warning)

## Port Allocation Summary

- **3001**: Rasheqa backend
- **3002**: Fitness Funnel backend
- **3003**: Profile Hub backend ← This app
- **8080/8443**: Fitness Funnel nginx
- **9080/9443**: Profile Hub nginx ← This app
- **443**: Rasheqa nginx

## Troubleshooting

### App Not Starting
```bash
pm2 logs profile-hub-api --err
pm2 restart profile-hub-api
```

### Database Connection Issues
```bash
# Test database connection
psql -U your_user -d golden_tag -h localhost

# Check environment variables
cat /var/www/profile-hub/backend/.env.production | grep DATABASE_URL
```

### Nginx Issues
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/profile-hub-error.log

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Port Already in Use
```bash
# Check what's using port 9443
sudo lsof -i :9443

# Check what's using port 3003
sudo lsof -i :3003
```

### CORS Issues
Make sure `CORS_ORIGIN` in backend `.env.production` matches the frontend URL:
```env
CORS_ORIGIN="https://91.108.113.135:9443"
```

## Useful Commands

```bash
# View logs
pm2 logs profile-hub-api

# Restart app
pm2 restart profile-hub-api

# Stop app
pm2 stop profile-hub-api

# Check status
pm2 list

# Monitor resources
pm2 monit

# View nginx logs
sudo tail -f /var/log/nginx/profile-hub-access.log
sudo tail -f /var/log/nginx/profile-hub-error.log
```

## Updating the Application

When you make changes:

```bash
# On VPS
cd /var/www/GoldenTag

# Pull latest code (if using git)
git pull

# Rebuild
cd backend && npm run build:production
cd ../frontend && npm run build

# Copy to deployment location
cp -r backend/dist/* /var/www/profile-hub/backend/dist/
cp -r frontend/dist/* /var/www/profile-hub/frontend/dist/

# Run migrations if needed
cd /var/www/profile-hub/backend
npm run prisma:migrate:deploy

# Restart PM2
pm2 restart profile-hub-api
```

## Security Notes

- The SSL certificate is self-signed. Browsers will show a warning.
- For production with a domain, use Let's Encrypt for a proper certificate.
- Make sure to change the JWT_SECRET to a secure random value.
- Keep your database credentials secure.
- Consider setting up a firewall to restrict access to ports 9080/9443.
