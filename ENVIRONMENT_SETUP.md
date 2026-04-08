# Environment Setup Guide

This guide helps you configure environment variables for the Digital Profile Hub application.

## Overview

The application requires environment variables for both the backend and frontend. Different configurations are needed for development and production environments.

## Backend Environment Variables

### Development (.env)

Located at: `backend/.env`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/digital_profile_hub?schema=public"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="uploads"

# Storage Provider
STORAGE_PROVIDER="local"
```

### Production (.env.production)

Located at: `backend/.env.production`

```bash
# Database - Use production database with SSL
DATABASE_URL="postgresql://username:password@your-db-host:5432/digital_profile_hub?schema=public&sslmode=require"

# JWT - Generate a secure random string
JWT_SECRET="<GENERATE-SECURE-32+-CHARACTER-STRING>"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# CORS - Your production domain
CORS_ORIGIN="https://yourdomain.com"

# Frontend URL - Your production domain
FRONTEND_URL="https://yourdomain.com"

# File Upload
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

### Backend Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (32+ chars in prod) | `your-secret-key` |
| `JWT_EXPIRES_IN` | No | JWT token expiration time | `7d` (default) |
| `PORT` | No | Server port | `3000` (default) |
| `NODE_ENV` | No | Environment mode | `development` or `production` |
| `CORS_ORIGIN` | Yes | Allowed CORS origin | `http://localhost:5173` |
| `FRONTEND_URL` | Yes | Frontend URL for QR codes | `http://localhost:5173` |
| `MAX_FILE_SIZE` | No | Max upload size in bytes | `10485760` (10MB default) |
| `UPLOAD_DIR` | No | Upload directory path | `uploads` (default) |
| `STORAGE_PROVIDER` | No | Storage type | `local` (default) |
| `FORCE_HTTPS` | No | Force HTTPS redirect | `true` or `false` |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window | `900000` (15 min default) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window | `100` (default) |
| `LOG_LEVEL` | No | Logging level | `info`, `debug`, `error` |
| `LOG_FILE` | No | Log file path | `/var/log/app.log` |

### AWS S3 Configuration (Optional)

If using S3 for file storage, add these variables:

```bash
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="your-bucket-name"
```

## Frontend Environment Variables

### Development (.env)

Located at: `frontend/.env`

```bash
VITE_API_URL=http://localhost:3000/api
```

### Production (.env.production)

Located at: `frontend/.env.production`

```bash
VITE_API_URL=https://yourdomain.com/api
```

### Frontend Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API base URL | `http://localhost:3000/api` |

## Setup Instructions

### For Development

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.example .env
   # Usually no changes needed for local development
   ```

3. **Database Setup**:
   ```bash
   # Create local PostgreSQL database
   createdb digital_profile_hub
   
   # Run migrations
   cd backend
   npm run prisma:migrate
   ```

### For Production

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.production.example .env.production
   # Edit .env.production with production values
   ```

2. **Generate Secure JWT Secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy output to JWT_SECRET in .env.production
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.production.example .env.production
   # Edit .env.production with your production API URL
   ```

4. **Database Setup**:
   ```bash
   # Create production database (on your database server)
   # Then run migrations
   cd backend
   npm run prisma:migrate:deploy
   ```

## Security Best Practices

### JWT Secret

- **Development**: Can use a simple string
- **Production**: MUST be at least 32 characters, randomly generated
- Generate with: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit to version control
- Rotate periodically

### Database Credentials

- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Use different credentials for development and production
- Enable SSL for production database connections
- Restrict database access by IP when possible

### CORS Configuration

- **Development**: `http://localhost:5173` (or your dev port)
- **Production**: Your exact production domain (e.g., `https://yourdomain.com`)
- Never use `*` in production

### File Upload Security

- Keep `MAX_FILE_SIZE` reasonable (10MB default)
- Ensure upload directory has proper permissions (755)
- Validate file types on both client and server
- Scan uploaded files for malware in production

## Environment Variable Validation

The application validates required environment variables on startup. If any required variables are missing, the application will fail to start with an error message indicating which variables are missing.

### Backend Validation

The backend validates:
- `DATABASE_URL` is set
- `JWT_SECRET` is set and at least 32 characters in production
- `CORS_ORIGIN` is set
- `FRONTEND_URL` is set

### Frontend Validation

The frontend validates:
- `VITE_API_URL` is set

## Troubleshooting

### "Missing required environment variables" Error

**Solution**: Check that all required variables are set in your `.env` file.

```bash
# Backend
cd backend
cat .env | grep -E "DATABASE_URL|JWT_SECRET|CORS_ORIGIN|FRONTEND_URL"

# Frontend
cd frontend
cat .env | grep VITE_API_URL
```

### Database Connection Failed

**Solution**: Verify your `DATABASE_URL` is correct:

```bash
# Test connection
psql "postgresql://user:password@localhost:5432/digital_profile_hub"
```

### CORS Errors in Browser

**Solution**: Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly:

```bash
# Backend .env
CORS_ORIGIN="http://localhost:5173"

# Frontend .env
VITE_API_URL=http://localhost:3000/api
```

### File Upload Fails

**Solution**: Check upload directory exists and has proper permissions:

```bash
# Development
mkdir -p backend/uploads/{avatars,backgrounds,pdfs}
chmod -R 755 backend/uploads

# Production
sudo mkdir -p /var/www/digital-profile-hub/backend/uploads/{avatars,backgrounds,pdfs}
sudo chown -R www-data:www-data /var/www/digital-profile-hub/backend/uploads
sudo chmod -R 755 /var/www/digital-profile-hub/backend/uploads
```

## Example Configurations

### Local Development (macOS/Linux)

**backend/.env**:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_profile_hub?schema=public"
JWT_SECRET="dev-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="uploads"
STORAGE_PROVIDER="local"
```

**frontend/.env**:
```bash
VITE_API_URL=http://localhost:3000/api
```

### Production (Ubuntu Server)

**backend/.env.production**:
```bash
DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/digital_profile_hub?schema=public&sslmode=require"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
CORS_ORIGIN="https://myprofilehub.com"
FRONTEND_URL="https://myprofilehub.com"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/var/www/digital-profile-hub/backend/uploads"
STORAGE_PROVIDER="local"
FORCE_HTTPS="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
LOG_LEVEL="info"
LOG_FILE="/var/log/digital-profile-hub/app.log"
```

**frontend/.env.production**:
```bash
VITE_API_URL=https://myprofilehub.com/api
```

## Additional Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

**Note**: Never commit `.env` or `.env.production` files to version control. Only commit `.env.example` and `.env.production.example` files with placeholder values.
