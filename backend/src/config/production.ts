import dotenv from 'dotenv';
import path from 'path';

// Load production environment variables
if (process.env.NODE_ENV === 'production') {
  const envPath = path.resolve(process.cwd(), '.env.production');
  dotenv.config({ path: envPath });
}

export const productionConfig = {
  // Database
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'production',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
    credentials: true,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    uploadDir: process.env.UPLOAD_DIR || '/var/www/digital-profile-hub/uploads',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedPdfTypes: ['application/pdf'],
  },

  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.AWS_BUCKET_NAME,
    },
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'https://yourdomain.com',
  },

  // Security
  security: {
    forceHttps: process.env.FORCE_HTTPS === 'true',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || '/var/log/digital-profile-hub/app.log',
  },
};

// Validate required production environment variables
export function validateProductionConfig(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
    'FRONTEND_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.production file.'
    );
  }

  // Validate JWT secret strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production'
      );
    }
  }
}
