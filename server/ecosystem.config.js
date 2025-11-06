/**
 * PM2 конфигурация для запуска API сервера
 */

module.exports = {
  apps: [{
    name: 'ab-education-api',
    script: './api.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
