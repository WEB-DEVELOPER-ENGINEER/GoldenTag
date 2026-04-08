# Fix Database Permissions

The error "permission denied for schema public" means your database user doesn't have the necessary permissions.

## Solution

Run these commands on your VPS:

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Connect to your database
\c golden_tag

# Grant all privileges on schema public to your user
GRANT ALL ON SCHEMA public TO your_db_user;

# Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;

# Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

# Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbuser;

# If you're using PostgreSQL 15+, you might also need:
GRANT CREATE ON SCHEMA public TO dbuser;

# Exit
\q
```

## Alternative: Make the user the owner of the database

```bash
sudo -u postgres psql

# Make your user the owner of the database
ALTER DATABASE golden_tag OWNER TO your_db_user;

# Exit
\q
```

## After fixing permissions, run migrations again:

```bash
cd /var/www/GoldenTag/backend
npm run prisma:migrate:deploy
```

## Quick Fix Script

You can also run this one-liner:

```bash
sudo -u postgres psql -d golden_tag -c "GRANT ALL ON SCHEMA public TO your_db_user; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_db_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_db_user; GRANT CREATE ON SCHEMA public TO your_db_user;"
```

Replace `your_db_user` with the actual database username from your DATABASE_URL in the .env file.

## Check your DATABASE_URL

Make sure your `.env` file has the correct database user:

```bash
cat backend/.env | grep DATABASE_URL
```

The format should be:
```
DATABASE_URL="postgresql://username:password@localhost:5432/golden_tag?schema=public"
```

Extract the username from this URL and use it in the permission commands above.
