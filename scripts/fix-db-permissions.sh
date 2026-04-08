#!/bin/bash

# =============================================================================
# Database Permissions Fix Script
# =============================================================================
# This script fixes PostgreSQL permissions for Prisma migrations
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "=========================================="
echo "Database Permissions Fix"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_error ".env file not found in backend directory"
    exit 1
fi

# Extract database connection details from DATABASE_URL
DATABASE_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in .env file"
    exit 1
fi

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    print_error "Could not parse DATABASE_URL"
    echo "DATABASE_URL format should be: postgresql://user:password@host:port/database"
    exit 1
fi

print_info "Database: $DB_NAME"
print_info "User: $DB_USER"
echo ""

print_info "Fixing database permissions..."
echo ""

# Run SQL commands to fix permissions
sudo -u postgres psql -d "$DB_NAME" <<EOF
-- Grant all privileges on schema public
GRANT ALL ON SCHEMA public TO $DB_USER;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;

-- Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Grant CREATE permission on schema public (PostgreSQL 15+)
GRANT CREATE ON SCHEMA public TO $DB_USER;

-- Make user the owner of the database (optional but recommended)
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

if [ $? -eq 0 ]; then
    print_status "Database permissions fixed successfully!"
    echo ""
    print_info "You can now run migrations:"
    echo "  cd backend && npm run prisma:migrate:deploy"
else
    print_error "Failed to fix database permissions"
    echo ""
    print_info "You may need to run these commands manually:"
    echo "  sudo -u postgres psql -d $DB_NAME"
    echo "  GRANT ALL ON SCHEMA public TO $DB_USER;"
    echo "  ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
    exit 1
fi
