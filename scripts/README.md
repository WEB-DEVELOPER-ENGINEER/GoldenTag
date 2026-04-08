# Deployment Scripts

This directory contains scripts for building and deploying the Digital Profile Hub application.

## Available Scripts

### build-production.sh

Builds both frontend and backend for production deployment.

**Usage**:
```bash
./scripts/build-production.sh
```

**What it does**:
1. Installs backend dependencies
2. Generates Prisma client
3. Compiles TypeScript backend code
4. Installs frontend dependencies
5. Builds React application with production optimizations
6. Creates optimized bundles in `backend/dist/` and `frontend/dist/`

**Prerequisites**:
- Node.js 18+ installed
- Environment files configured (`.env.production`)
- All dependencies listed in package.json

**Output**:
- `backend/dist/` - Compiled backend JavaScript
- `frontend/dist/` - Optimized frontend static files

### deploy.sh

Deploys the built application to a production server.

**Usage**:
```bash
# Set environment variables
export DEPLOY_USER="www-data"
export DEPLOY_HOST="yourdomain.com"
export DEPLOY_PATH="/var/www/digital-profile-hub"

# Run deployment
./scripts/deploy.sh
```

**What it does**:
1. Verifies build directories exist
2. Creates directory structure on server
3. Transfers backend files via rsync
4. Transfers frontend files via rsync
5. Transfers deployment configuration files
6. Installs production dependencies on server
7. Runs database migrations
8. Sets up upload directories with proper permissions
9. Restarts the application service

**Prerequisites**:
- Application built (run `build-production.sh` first)
- SSH access to production server
- Server configured with required software (Node.js, PostgreSQL, Nginx)
- Systemd service configured
- Environment variables set

**Environment Variables**:
- `DEPLOY_USER` - SSH user for deployment (default: www-data)
- `DEPLOY_HOST` - Production server hostname
- `DEPLOY_PATH` - Application path on server (default: /var/www/digital-profile-hub)

## Deployment Workflow

### First-Time Deployment

1. **Prepare Server**:
   ```bash
   # Follow DEPLOYMENT.md for server setup
   # Install Node.js, PostgreSQL, Nginx
   # Configure SSL certificate
   # Create application directories
   ```

2. **Configure Environment**:
   ```bash
   # Backend
   cp backend/.env.production.example backend/.env.production
   # Edit with production values
   
   # Frontend
   cp frontend/.env.production.example frontend/.env.production
   # Edit with production API URL
   ```

3. **Build Application**:
   ```bash
   ./scripts/build-production.sh
   ```

4. **Deploy to Server**:
   ```bash
   export DEPLOY_USER="www-data"
   export DEPLOY_HOST="yourdomain.com"
   export DEPLOY_PATH="/var/www/digital-profile-hub"
   
   ./scripts/deploy.sh
   ```

5. **Configure Services**:
   ```bash
   # SSH to server
   ssh www-data@yourdomain.com
   
   # Set up systemd service
   sudo cp /var/www/digital-profile-hub/deployment/digital-profile-hub.service \
     /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable digital-profile-hub
   sudo systemctl start digital-profile-hub
   
   # Set up Nginx
   sudo cp /var/www/digital-profile-hub/deployment/nginx.conf \
     /etc/nginx/sites-available/digital-profile-hub
   sudo ln -s /etc/nginx/sites-available/digital-profile-hub \
     /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Subsequent Deployments

For updates after initial deployment:

```bash
# 1. Build new version
./scripts/build-production.sh

# 2. Deploy to server
./scripts/deploy.sh

# The deploy script will automatically:
# - Transfer new files
# - Run migrations
# - Restart the service
```

## Manual Deployment

If you prefer manual deployment or the scripts don't work for your setup:

### 1. Build Locally

```bash
# Backend
cd backend
npm ci --production=false
npm run prisma:generate
npm run build

# Frontend
cd frontend
npm ci
npm run build:production
```

### 2. Transfer Files

```bash
# Backend
scp -r backend/dist/ user@server:/var/www/digital-profile-hub/backend/
scp backend/package*.json user@server:/var/www/digital-profile-hub/backend/
scp -r backend/prisma/ user@server:/var/www/digital-profile-hub/backend/

# Frontend
scp -r frontend/dist/ user@server:/var/www/digital-profile-hub/frontend/
```

### 3. Install and Migrate

```bash
# SSH to server
ssh user@server

# Install dependencies
cd /var/www/digital-profile-hub/backend
npm ci --production

# Run migrations
npm run prisma:migrate:deploy

# Restart service
sudo systemctl restart digital-profile-hub
```

## Troubleshooting

### Build Script Fails

**Issue**: `build-production.sh` exits with error

**Solutions**:
1. Check Node.js version: `node --version` (should be 18+)
2. Verify environment files exist
3. Check for TypeScript errors: `cd backend && npm run build`
4. Check for frontend build errors: `cd frontend && npm run build`

### Deploy Script Fails

**Issue**: `deploy.sh` cannot connect to server

**Solutions**:
1. Verify SSH access: `ssh $DEPLOY_USER@$DEPLOY_HOST`
2. Check environment variables are set
3. Ensure server directories exist
4. Verify rsync is installed: `which rsync`

**Issue**: Permission denied during deployment

**Solutions**:
1. Check SSH user has write access to deployment directory
2. Verify file ownership: `ls -la /var/www/digital-profile-hub`
3. May need to use sudo for certain operations

### Service Won't Start After Deployment

**Issue**: Application doesn't start after deployment

**Solutions**:
1. Check service status: `sudo systemctl status digital-profile-hub`
2. View logs: `sudo journalctl -u digital-profile-hub -n 50`
3. Verify environment file exists: `ls -la /var/www/digital-profile-hub/backend/.env.production`
4. Test database connection
5. Check file permissions

## Best Practices

### Before Deployment

- [ ] Test build locally
- [ ] Run all tests: `cd backend && npm test` and `cd frontend && npm test`
- [ ] Review environment configuration
- [ ] Backup production database
- [ ] Notify users of potential downtime (if applicable)

### During Deployment

- [ ] Monitor deployment script output
- [ ] Watch for errors in rsync transfers
- [ ] Verify migrations complete successfully
- [ ] Check service starts without errors

### After Deployment

- [ ] Verify application is accessible
- [ ] Test key functionality (login, profile creation, file upload)
- [ ] Check logs for errors
- [ ] Monitor performance metrics
- [ ] Verify database migrations applied correctly

## Rollback Procedure

If deployment fails and you need to rollback:

1. **Restore Previous Version**:
   ```bash
   # On server
   cd /var/www/digital-profile-hub/backend
   git checkout <previous-commit>
   npm ci --production
   npm run build
   ```

2. **Rollback Database** (if migrations were applied):
   ```bash
   # Restore from backup
   psql digital_profile_hub < /var/backups/digital-profile-hub/backup_YYYYMMDD.sql
   ```

3. **Restart Service**:
   ```bash
   sudo systemctl restart digital-profile-hub
   ```

## Security Notes

- Never commit `.env` or `.env.production` files
- Use SSH keys for server access, not passwords
- Limit SSH access to specific IPs when possible
- Keep deployment scripts executable only by authorized users
- Regularly rotate JWT secrets and database passwords
- Monitor deployment logs for suspicious activity

## Additional Resources

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) - Environment configuration guide
- [Backend README](../backend/README.md) - Backend-specific documentation
- [Frontend README](../frontend/README.md) - Frontend-specific documentation

---

For issues or questions about deployment, refer to the troubleshooting section in DEPLOYMENT.md or check application logs.
