// PM2 Ecosystem Configuration — ARTIC Marketplace
// Manages both backend (Node.js/tsx) and frontend (Next.js) processes

module.exports = {
  apps: [
    // ─── Backend API ──────────────────────────────────────────────────────────
    {
      name: 'artic-backend',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      cwd: '/home/ArticGroup/artic-marketplace/backend',

      // Use tsx to run TypeScript directly
      // Alternative: 'npx tsx src/server.ts'
      script: 'node_modules/.bin/tsx',
      args: 'src/server.ts',

      instances: 1,
      exec_mode: 'fork',

      env_production: {
        NODE_ENV: 'production',
        PORT: 5010,
      },

      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      // Logging
      log_file: '/home/ArticGroup/artic-marketplace/logs/backend-combined.log',
      out_file: '/home/ArticGroup/artic-marketplace/logs/backend-out.log',
      error_file: '/home/ArticGroup/artic-marketplace/logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ─── Frontend (Next.js) ───────────────────────────────────────────────────
    {
      name: 'artic-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ArticGroup/artic-marketplace/frontend',

      instances: 1,
      exec_mode: 'fork',

      env_production: {
        NODE_ENV: 'production',
        PORT: 3010,
        HOSTNAME: '0.0.0.0',
      },

      autorestart: true,
      watch: false,
      max_memory_restart: '800M',

      log_file: '/home/ArticGroup/artic-marketplace/logs/frontend-combined.log',
      out_file: '/home/ArticGroup/artic-marketplace/logs/frontend-out.log',
      error_file: '/home/ArticGroup/artic-marketplace/logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      kill_timeout: 5000,
    },
  ],
};
