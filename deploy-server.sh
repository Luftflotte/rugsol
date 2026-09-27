#!/bin/bash

# 🚀 Automated deployment script for rugsol.xyz
# Ubuntu 24.04 + Next.js 16 + PM2 + Nginx + SSL

set -e  # Exit on any error

echo "🚀 Starting rugsol.xyz deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="rugsol.xyz"
APP_NAME="rugsol"
APP_DIR="/root/apps/$APP_NAME"
GITHUB_REPO="https://github.com/YOUR_USERNAME/$APP_NAME.git"  # REPLACE THIS!

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App directory: $APP_DIR"
echo ""

# ============================================
# Step 1: System Update
# ============================================
echo -e "${GREEN}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# ============================================
# Step 2: Install Node.js 22.x
# ============================================
echo -e "${GREEN}[2/10] Installing Node.js 22.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
echo "  Node version: $(node --version)"
echo "  NPM version: $(npm --version)"

# ============================================
# Step 3: Install PM2
# ============================================
echo -e "${GREEN}[3/10] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "  PM2 version: $(pm2 --version)"

# ============================================
# Step 4: Install Nginx
# ============================================
echo -e "${GREEN}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi
systemctl enable nginx
systemctl start nginx
echo "  Nginx installed and running"

# ============================================
# Step 5: Install Certbot
# ============================================
echo -e "${GREEN}[5/10] Installing Certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi
echo "  Certbot installed"

# ============================================
# Step 6: Clone repository
# ============================================
echo -e "${GREEN}[6/10] Cloning repository...${NC}"
mkdir -p /root/apps
cd /root/apps

if [ -d "$APP_DIR" ]; then
    echo "  Directory exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main || git pull origin master
else
    echo "  Cloning from GitHub..."
    git clone $GITHUB_REPO $APP_NAME
    cd $APP_DIR
fi

# ============================================
# Step 7: Setup environment variables
# ============================================
echo -e "${GREEN}[7/10] Setting up environment variables...${NC}"

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Creating .env.local - YOU NEED TO EDIT THIS FILE!${NC}"
    cat > .env.local << 'EOF'
# Helius API (обязательно - получи на https://helius.dev)
HELIUS_API_KEY=your_helius_api_key_here

# Birdeye API (обязательно - получи на https://birdeye.so)
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_SECRET=

# Production
NODE_ENV=production
EOF
    echo ""
    echo -e "${RED}❗ ВАЖНО: Отредактируй файл $APP_DIR/.env.local${NC}"
    echo -e "${RED}   Добавь свои API ключи перед продолжением!${NC}"
    echo ""
    echo "Нажми Enter когда отредактируешь .env.local..."
    read
else
    echo "  .env.local already exists"
fi

# ============================================
# Step 8: Install dependencies and build
# ============================================
echo -e "${GREEN}[8/10] Installing dependencies and building...${NC}"
npm install
npm run build

# ============================================
# Step 9: Setup PM2
# ============================================
echo -e "${GREEN}[9/10] Setting up PM2...${NC}"

# Create logs directory
mkdir -p logs

# Create PM2 ecosystem config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: '${APP_NAME}-web',
      script: 'npm',
      args: 'start',
      cwd: '${APP_DIR}',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '${APP_DIR}/logs/err.log',
      out_file: '${APP_DIR}/logs/out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Stop existing PM2 process if running
pm2 delete ${APP_NAME}-web 2>/dev/null || true

# Start PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "  PM2 started successfully"

# ============================================
# Step 10: Setup Nginx
# ============================================
echo -e "${GREEN}[10/10] Setting up Nginx...${NC}"

# Create Nginx config
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=scan_limit:10m rate=2r/s;

upstream nextjs_upstream {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name rugsol.xyz www.rugsol.xyz;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # API routes with rate limiting
    location /api/scan {
        limit_req zone=scan_limit burst=5 nodelay;
        limit_req_status 429;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

echo "  Nginx configured and restarted"

# ============================================
# Setup Firewall
# ============================================
echo -e "${GREEN}Setting up firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable || true

# ============================================
# SSL Certificate
# ============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Base deployment complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1. Check if site works: http://$DOMAIN"
echo ""
echo "2. Install SSL certificate:"
echo "   ${BLUE}certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo "3. Check PM2 status:"
echo "   ${BLUE}pm2 status${NC}"
echo "   ${BLUE}pm2 logs ${APP_NAME}-web${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment ready!${NC}"
echo ""
