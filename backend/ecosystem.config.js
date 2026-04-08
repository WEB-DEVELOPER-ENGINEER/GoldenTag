// PM2 Ecosystem Configuration for Digital Profile Hub
// This file defines how PM2 should run the application

module.exports = {
  apps: [
    {
      name: 'profile-hub-api',
      script: './dist/index.js',
      cwd: '/var/www/profile-hub/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      env_file: '.env.production',
      error_file: '/var/www/profile-hub/logs/pm2-error.log',
      out_file: '/var/www/profile-hub/logs/pm2-out.log',
      log_file: '/var/www/profile-hub/logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
