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


**Important**: Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```


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