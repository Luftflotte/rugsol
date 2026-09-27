#!/bin/bash

# ============================================
# 🚀 RUGSOL.XYZ AUTOMATED DEPLOYMENT SCRIPT
# ============================================
# Ubuntu 24.04 + Next.js 16 + PM2 + Nginx + SSL
#
# Usage: bash deploy.sh
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   RUGSOL.XYZ AUTOMATED DEPLOYMENT     ║"
echo "╔════════════════════════════════════════╗"
echo -e "${NC}"
echo ""

# ============================================
# STEP 1: System Update
# ============================================
echo -e "${GREEN}[1/11] Updating system packages...${NC}"
apt update -y
apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}\n"

# ============================================
# STEP 2: Install Node.js 22.x
# ============================================
echo -e "${GREEN}[2/11] Installing Node.js 22.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}\n"
else
    echo -e "${YELLOW}✓ Node.js already installed: $(node --version)${NC}\n"
fi

# ============================================
# STEP 3: Install PM2
# ============================================
echo -e "${GREEN}[3/11] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}\n"
else
    echo -e "${YELLOW}✓ PM2 already installed${NC}\n"
fi

# ============================================
# STEP 4: Install Nginx
# ============================================
echo -e "${GREEN}[4/11] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx installed and started${NC}\n"
else
    echo -e "${YELLOW}✓ Nginx already installed${NC}\n"
fi

# ============================================
# STEP 5: Install Certbot
# ============================================
echo -e "${GREEN}[5/11] Installing Certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot installed${NC}\n"
else
    echo -e "${YELLOW}✓ Certbot already installed${NC}\n"
fi

# ============================================
# STEP 6: Setup Git (if needed)
# ============================================
echo -e "${GREEN}[6/11] Setting up Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
fi
echo -e "${GREEN}✓ Git ready${NC}\n"

# ============================================
# STEP 7: Prompt for GitHub repo
# ============================================
echo -e "${YELLOW}[7/11] GitHub Repository Setup${NC}"
echo ""
echo "Enter your GitHub repository URL:"
echo "Example: https://github.com/username/rugsol.git"
echo ""
read -p "Repository URL: " GITHUB_REPO

if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}Error: Repository URL is required${NC}"
    exit 1
fi

# ============================================
# STEP 8: Clone repository
# ============================================
echo -e "${GREEN}[8/11] Cloning repository...${NC}"
mkdir -p /root/apps
cd /root/apps

if [ -d "rugsol" ]; then
    echo -e "${YELLOW}Directory exists, pulling latest changes...${NC}"
    cd rugsol
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Pull skipped"
else
    echo "Cloning from GitHub..."
    git clone $GITHUB_REPO rugsol
    cd rugsol
fi

echo -e "${GREEN}✓ Repository ready${NC}\n"

# ============================================
# STEP 9: Setup environment variables
# ============================================
echo -e "${YELLOW}[9/11] Environment Variables Setup${NC}"
echo ""

if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    echo ""

    # Helius API Key
    echo -e "${BLUE}Enter your HELIUS_API_KEY:${NC}"
    echo "(Get it from: https://helius.dev)"
    read -p "HELIUS_API_KEY: " HELIUS_KEY

    echo ""

    # Birdeye API Key
    echo -e "${BLUE}Enter your BIRDEYE_API_KEY:${NC}"
    echo "(Get it from: https://birdeye.so)"
    read -p "BIRDEYE_API_KEY: " BIRDEYE_KEY

    echo ""

    # Telegram (optional)
    echo -e "${BLUE}Telegram Bot (optional - press Enter to skip):${NC}"
    read -p "TELEGRAM_BOT_TOKEN (or press Enter): " TELEGRAM_TOKEN
    read -p "TELEGRAM_BOT_SECRET (or press Enter): " TELEGRAM_SECRET

    # Create .env.local
    cat > .env.local << EOF
# Helius API
HELIUS_API_KEY=$HELIUS_KEY

# Birdeye API
BIRDEYE_API_KEY=$BIRDEYE_KEY

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN
TELEGRAM_BOT_SECRET=$TELEGRAM_SECRET

# Production
NODE_ENV=production
EOF

    echo -e "${GREEN}✓ .env.local created${NC}\n"
else
    echo -e "${YELLOW}✓ .env.local already exists${NC}\n"
fi

# ============================================
# STEP 10: Install dependencies and build
# ============================================
echo -e "${GREEN}[10/11] Installing dependencies and building...${NC}"
echo "This may take a few minutes..."
echo ""

npm install

echo ""
echo "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}\n"
else
    echo -e "${RED}✗ Build failed. Check errors above.${NC}"
    exit 1
fi

# ============================================
# STEP 11: Setup PM2
# ============================================
echo -e "${GREEN}[11/11] Setting up PM2...${NC}"

# Create logs directory
mkdir -p logs

# Create PM2 ecosystem config
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
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
    }
  ]
};
EOFPM2

# Stop existing PM2 process if running
pm2 delete rugsol-web 2>/dev/null || true

# Start PM2
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root | grep "sudo" | bash

echo -e "${GREEN}✓ PM2 configured and running${NC}\n"

# ============================================
# Setup Nginx
# ============================================
echo -e "${GREEN}Setting up Nginx...${NC}"

# Remove default config
rm -f /etc/nginx/sites-enabled/default

# Create Nginx config
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

    # API rate limiting
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
EOFNGINX

# Enable site
ln -sf /etc/nginx/sites-available/rugsol.xyz /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo -e "${GREEN}✓ Nginx configured${NC}\n"
else
    echo -e "${RED}✗ Nginx config error${NC}"
    exit 1
fi

# ============================================
# Setup Firewall
# ============================================
echo -e "${GREEN}Setting up firewall...${NC}"
ufw allow 22/tcp >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
echo "y" | ufw enable >/dev/null 2>&1 || true
echo -e "${GREEN}✓ Firewall configured${NC}\n"

# ============================================
# Deployment Complete!
# ============================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ DEPLOYMENT SUCCESSFUL! 🎉      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Check if site works:"
echo "   Open: ${BLUE}http://rugsol.xyz${NC}"
echo ""
echo "2️⃣  Install SSL certificate:"
echo "   IMPORTANT: First disable Cloudflare Proxy (orange cloud → grey)"
echo "   Then run:"
echo "   ${BLUE}certbot --nginx -d rugsol.xyz -d www.rugsol.xyz${NC}"
echo ""
echo "3️⃣  Check PM2 status:"
echo "   ${BLUE}pm2 status${NC}"
echo "   ${BLUE}pm2 logs rugsol-web${NC}"
echo ""
echo "4️⃣  After SSL installation:"
echo "   You can re-enable Cloudflare Proxy (grey cloud → orange)"
echo ""
echo -e "${GREEN}📁 Important locations:${NC}"
echo "   App directory: /root/apps/rugsol"
echo "   Logs: /root/apps/rugsol/logs/"
echo "   Nginx config: /etc/nginx/sites-available/rugsol.xyz"
echo "   Environment: /root/apps/rugsol/.env.local"
echo ""
echo -e "${GREEN}🔧 Useful commands:${NC}"
echo "   pm2 restart rugsol-web  - Restart app"
echo "   pm2 logs rugsol-web     - View logs"
echo "   systemctl restart nginx - Restart Nginx"
echo "   nginx -t                - Test Nginx config"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
echo ""
