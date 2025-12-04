// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'offering',           // Nama aplikasi di PM2
            cwd: './.next/standalone',  // 🎯 Working directory
            script: 'server.js',        // Entry point
            instances: 'max',           // Cluster mode
            exec_mode: 'cluster',       // Mode cluster
            autorestart: true,          // Auto restart jika crash
            watch: false,               // Jangan watch (kecuali development)
            max_memory_restart: '1G',   // Restart jika memory > 1GB
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