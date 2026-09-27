#!/bin/bash

# ============================================
# 🚀 RUGSOL.XYZ - SMART AUTO-COMPLETE SCRIPT
# ============================================
# Проверяет что уже сделано и доделывает остальное
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════╗"
echo "║  RUGSOL.XYZ - SMART DEPLOYMENT SCRIPT    ║"
echo "║  Checking status and completing setup... ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}\n"

# ============================================
# HELPER FUNCTIONS
# ============================================

check_installed() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
    fi
}

# ============================================
# CHECK CURRENT STATUS
# ============================================

echo -e "${BLUE}[STEP 1] Checking current installation status...${NC}\n"

NODE_OK=1
PM2_OK=1
NGINX_OK=1
CERTBOT_OK=1
GIT_OK=1
PROJECT_OK=1
ENV_OK=1
BUILD_OK=1
PM2_RUNNING=1
NGINX_CONFIG_OK=1
SSL_OK=1

# Check Node.js
if check_installed node; then
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    NODE_OK=0
else
    echo -e "${YELLOW}⚠ Node.js: Not installed${NC}"
fi

# Check PM2
if check_installed pm2; then
    echo -e "${GREEN}✓ PM2: $(pm2 --version)${NC}"
    PM2_OK=0
    if pm2 list 2>/dev/null | grep -q "rugsol-web.*online"; then
        echo -e "${GREEN}  └─ rugsol-web is running${NC}"
        PM2_RUNNING=0
    else
        echo -e "${YELLOW}  └─ rugsol-web not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PM2: Not installed${NC}"
fi

# Check Nginx
if check_installed nginx; then
    echo -e "${GREEN}✓ Nginx: installed${NC}"
    NGINX_OK=0
    if systemctl is-active nginx &>/dev/null; then
        echo -e "${GREEN}  └─ Running${NC}"
    else
        echo -e "${YELLOW}  └─ Not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Nginx: Not installed${NC}"
fi

# Check Certbot
if check_installed certbot; then
    echo -e "${GREEN}✓ Certbot: installed${NC}"
    CERTBOT_OK=0
else
    echo -e "${YELLOW}⚠ Certbot: Not installed${NC}"
fi

# Check Git
if check_installed git; then
    echo -e "${GREEN}✓ Git: installed${NC}"
    GIT_OK=0
else
    echo -e "${YELLOW}⚠ Git: Not installed${NC}"
fi

# Check Project
if [ -d "/root/apps/rugsol" ]; then
    echo -e "${GREEN}✓ Project: /root/apps/rugsol${NC}"
    PROJECT_OK=0

    if [ -f "/root/apps/rugsol/.env.local" ]; then
        echo -e "${GREEN}  ├─ .env.local exists${NC}"
        ENV_OK=0
    else
        echo -e "${YELLOW}  ├─ .env.local missing${NC}"
    fi

    if [ -d "/root/apps/rugsol/.next" ]; then
        echo -e "${GREEN}  ├─ Build exists${NC}"
        BUILD_OK=0
    else
        echo -e "${YELLOW}  ├─ Not built${NC}"
    fi

    if [ -d "/root/apps/rugsol/node_modules" ]; then
        echo -e "${GREEN}  └─ Dependencies installed${NC}"
    else
        echo -e "${YELLOW}  └─ Dependencies missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Project: Not cloned${NC}"
fi

# Check Nginx config
if [ -f "/etc/nginx/sites-available/rugsol.xyz" ]; then
    echo -e "${GREEN}✓ Nginx config: exists${NC}"
    NGINX_CONFIG_OK=0
    if [ -L "/etc/nginx/sites-enabled/rugsol.xyz" ]; then
        echo -e "${GREEN}  └─ Enabled${NC}"
    else
        echo -e "${YELLOW}  └─ Not enabled${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Nginx config: missing${NC}"
fi

# Check SSL
if [ -d "/etc/letsencrypt/live/rugsol.xyz" ]; then
    echo -e "${GREEN}✓ SSL: installed${NC}"
    SSL_OK=0
else
    echo -e "${YELLOW}⚠ SSL: not installed${NC}"
fi

echo ""

# ============================================
# INSTALL MISSING COMPONENTS
# ============================================

echo -e "${BLUE}[STEP 2] Installing missing components...${NC}\n"

# Update system if needed
if [ $NODE_OK -ne 0 ] || [ $NGINX_OK -ne 0 ]; then
    echo "Updating system packages..."
    apt update -y
    echo -e "${GREEN}✓ System updated${NC}\n"
fi

# Install Node.js
if [ $NODE_OK -ne 0 ]; then
    echo "Installing Node.js 22.x..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}\n"
fi

# Install PM2
if [ $PM2_OK -ne 0 ]; then
    echo "Installing PM2..."
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}\n"
fi

# Install Nginx
if [ $NGINX_OK -ne 0 ]; then
    echo "Installing Nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx installed${NC}\n"
fi

# Install Certbot
if [ $CERTBOT_OK -ne 0 ]; then
    echo "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot installed${NC}\n"
fi

# Install Git
if [ $GIT_OK -ne 0 ]; then
    echo "Installing Git..."
    apt install -y git
    echo -e "${GREEN}✓ Git installed${NC}\n"
fi

# ============================================
# SETUP PROJECT
# ============================================

echo -e "${BLUE}[STEP 3] Setting up project...${NC}\n"

# Clone project if needed
if [ $PROJECT_OK -ne 0 ]; then
    echo "Enter your GitHub repository URL:"
    echo "Example: https://github.com/username/rugsol.git"
    read -p "Repository URL: " GITHUB_REPO

    if [ -z "$GITHUB_REPO" ]; then
        echo -e "${RED}Error: Repository URL required${NC}"
        exit 1
    fi

    mkdir -p /root/apps
    cd /root/apps
    git clone $GITHUB_REPO rugsol
    cd rugsol
    echo -e "${GREEN}✓ Project cloned${NC}\n"
else
    echo -e "${GREEN}✓ Project already exists${NC}"
    cd /root/apps/rugsol
    echo "Pulling latest changes..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Pull skipped"
    echo ""
fi

# Setup .env.local if needed
if [ $ENV_OK -ne 0 ]; then
    echo -e "${YELLOW}Setting up environment variables...${NC}\n"

    echo -e "${CYAN}Enter your HELIUS_API_KEY:${NC}"
    echo "(Get it from: https://helius.dev)"
    read -p "HELIUS_API_KEY: " HELIUS_KEY

    echo ""
    echo -e "${CYAN}Enter your BIRDEYE_API_KEY:${NC}"
    echo "(Get it from: https://birdeye.so)"
    read -p "BIRDEYE_API_KEY: " BIRDEYE_KEY

    echo ""
    echo -e "${CYAN}Telegram Bot (optional - press Enter to skip):${NC}"
    read -p "TELEGRAM_BOT_TOKEN: " TELEGRAM_TOKEN
    read -p "TELEGRAM_BOT_SECRET: " TELEGRAM_SECRET

    cat > .env.local << EOF
HELIUS_API_KEY=$HELIUS_KEY
BIRDEYE_API_KEY=$BIRDEYE_KEY
TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN
TELEGRAM_BOT_SECRET=$TELEGRAM_SECRET
NODE_ENV=production
EOF

    echo -e "${GREEN}✓ .env.local created${NC}\n"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}\n"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}\n"
fi

# Build project
if [ $BUILD_OK -ne 0 ]; then
    echo "Building Next.js application..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build successful${NC}\n"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Already built${NC}\n"
fi

# ============================================
# SETUP PM2
# ============================================

echo -e "${BLUE}[STEP 4] Setting up PM2...${NC}\n"

mkdir -p logs

cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'rugsol-web',
    script: 'npm',
    args: 'start',
    cwd: '/root/apps/rugsol',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/root/apps/rugsol/logs/err.log',
    out_file: '/root/apps/rugsol/logs/out.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOFPM2

pm2 delete rugsol-web 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
STARTUP_CMD=$(pm2 startup systemd -u root --hp /root | grep "sudo")
if [ ! -z "$STARTUP_CMD" ]; then
    eval $STARTUP_CMD
fi

echo -e "${GREEN}✓ PM2 configured and running${NC}\n"

# ============================================
# SETUP NGINX
# ============================================

echo -e "${BLUE}[STEP 5] Setting up Nginx...${NC}\n"

if [ $NGINX_CONFIG_OK -ne 0 ]; then
    cat > /etc/nginx/sites-available/rugsol.xyz << 'EOFNGINX'
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

    location /api/scan {
        limit_req zone=scan_limit burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
EOFNGINX

    ln -sf /etc/nginx/sites-available/rugsol.xyz /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    nginx -t
    systemctl restart nginx

    echo -e "${GREEN}✓ Nginx configured${NC}\n"
else
    echo -e "${GREEN}✓ Nginx already configured${NC}\n"
fi

# ============================================
# SETUP FIREWALL
# ============================================

echo -e "${BLUE}[STEP 6] Setting up firewall...${NC}\n"

ufw allow 22/tcp 2>/dev/null
ufw allow 80/tcp 2>/dev/null
ufw allow 443/tcp 2>/dev/null
echo "y" | ufw enable 2>/dev/null || true

echo -e "${GREEN}✓ Firewall configured${NC}\n"

# ============================================
# COMPLETION
# ============================================

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ DEPLOYMENT COMPLETE! 🎉        ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Current Status:${NC}"
pm2 status
echo ""

echo -e "${YELLOW}🌐 Your site:${NC}"
echo "   http://rugsol.xyz"
echo ""

if [ $SSL_OK -ne 0 ]; then
    echo -e "${YELLOW}🔒 Next: Install SSL certificate${NC}"
    echo ""
    echo "   IMPORTANT:"
    echo "   1. Go to Cloudflare DNS settings"
    echo "   2. Turn OFF Proxy (orange cloud → grey) for:"
    echo "      - @ (rugsol.xyz)"
    echo "      - www (www.rugsol.xyz)"
    echo "   3. Wait 2-3 minutes"
    echo "   4. Run this command:"
    echo ""
    echo -e "      ${BLUE}certbot --nginx -d rugsol.xyz -d www.rugsol.xyz${NC}"
    echo ""
    echo "   5. After SSL is installed, you can turn Proxy back ON"
    echo ""
else
    echo -e "${GREEN}✅ SSL already installed!${NC}"
    echo ""
fi

echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "   pm2 logs rugsol-web     - View logs"
echo "   pm2 restart rugsol-web  - Restart app"
echo "   pm2 status              - Check status"
echo "   nginx -t                - Test Nginx config"
echo ""

echo -e "${GREEN}🎉 All done!${NC}"
