// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'offering',           // Nama aplikasi di PM2
            cwd: '/www/wwwroot/offering', 
            script: "node_modules/next/dist/bin/next",
            args: "start -p 3001",
            instances: '1',           // Cluster mode
            exec_mode: 'fork',       // Mode fork
            autorestart: true,          // Auto restart jika crash
            watch: false,               // Jangan watch (kecuali development)
            max_memory_restart: '512M',   // Restart jika memory > 512MB
            env: {
                NODE_ENV: 'production',
                PORT: 3001,               // Port aplikasi
                HOSTNAME: '0.0.0.0',      // Bind ke semua interface
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            env_staging: {
                NODE_ENV: 'production',
                PORT: 3002,
            },
            // Log configuration
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: '../logs/err.log',    // Relative dari cwd
            out_file: '../logs/out.log',
            merge_logs: true,
            time: true,
        }
    ]
}