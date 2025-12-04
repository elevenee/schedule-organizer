#!/bin/bash

APP_DIR="/www/wwwroot/my-next-app"
PM2_APP_NAME="next-app"

echo "→ Pulling latest code..."
cd $APP_DIR
git pull origin main

echo "→ Installing dependencies..."
npm ci

echo "→ Building Next.js (standalone)..."
npm run build

echo "→ Restarting PM2 app..."
pm2 restart $PM2_APP_NAME || pm2 start ecosystem.config.js

echo "→ Saving PM2 state..."
pm2 save

echo "✔ Deploy DONE"
