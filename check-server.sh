#!/bin/bash

# Quick server status check script
echo "=== SERVER STATUS CHECK ==="
echo ""

echo "1. Node.js:"
if command -v node &> /dev/null; then
    echo "   ✓ Installed: $(node --version)"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "2. NPM:"
if command -v npm &> /dev/null; then
    echo "   ✓ Installed: $(npm --version)"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "3. PM2:"
if command -v pm2 &> /dev/null; then
    echo "   ✓ Installed: $(pm2 --version)"
    echo "   PM2 Status:"
    pm2 status 2>/dev/null || echo "   No processes running"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "4. Nginx:"
if command -v nginx &> /dev/null; then
    echo "   ✓ Installed: $(nginx -v 2>&1 | cut -d'/' -f2)"
    systemctl is-active nginx &> /dev/null && echo "   Status: Running" || echo "   Status: Not running"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "5. Certbot:"
if command -v certbot &> /dev/null; then
    echo "   ✓ Installed: $(certbot --version 2>&1 | head -n1)"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "6. Git:"
if command -v git &> /dev/null; then
    echo "   ✓ Installed: $(git --version | cut -d' ' -f3)"
else
    echo "   ✗ Not installed"
fi

echo ""
echo "7. Project directory:"
if [ -d "/root/apps/rugsol" ]; then
    echo "   ✓ Exists at /root/apps/rugsol"
    if [ -f "/root/apps/rugsol/.env.local" ]; then
        echo "   ✓ .env.local exists"
    else
        echo "   ✗ .env.local missing"
    fi
    if [ -d "/root/apps/rugsol/.next" ]; then
        echo "   ✓ Built (.next exists)"
    else
        echo "   ✗ Not built yet"
    fi
    if [ -d "/root/apps/rugsol/node_modules" ]; then
        echo "   ✓ node_modules exists"
    else
        echo "   ✗ node_modules missing"
    fi
else
    echo "   ✗ Project not cloned yet"
fi

echo ""
echo "8. Nginx config:"
if [ -f "/etc/nginx/sites-available/rugsol.xyz" ]; then
    echo "   ✓ Config exists"
    if [ -L "/etc/nginx/sites-enabled/rugsol.xyz" ]; then
        echo "   ✓ Enabled"
    else
        echo "   ✗ Not enabled"
    fi
else
    echo "   ✗ Config missing"
fi

echo ""
echo "9. SSL Certificate:"
if [ -d "/etc/letsencrypt/live/rugsol.xyz" ]; then
    echo "   ✓ SSL installed"
else
    echo "   ✗ SSL not installed"
fi

echo ""
echo "10. Firewall:"
if command -v ufw &> /dev/null; then
    echo "   ✓ UFW installed"
    ufw status | grep -q "Status: active" && echo "   Status: Active" || echo "   Status: Inactive"
else
    echo "   ✗ UFW not installed"
fi

echo ""
echo "=== END STATUS CHECK ==="
