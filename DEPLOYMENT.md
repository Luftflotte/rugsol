# Production Deployment Guide — Ubuntu 24.04

Полная инструкция по деплою **rug** (Solana Token Security Analyzer) на VPS с Ubuntu 24.04.

## Предварительные требования

- ✅ Сервер Ubuntu 24.04 с root/sudo доступом
- ✅ Домен (например, `rugcheck.com`)
- ✅ DNS A-запись домена указывает на IP сервера
- ✅ Код загружен на GitHub

---

## 1. Первоначальная настройка сервера

### 1.1 Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Установка Node.js 22.x (LTS)

```bash
# Установка NodeSource репозитория
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Установка Node.js
sudo apt install -y nodejs

# Проверка версии
node --version  # должна быть v22.x.x
npm --version
```

### 1.3 Установка PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Настройка автозапуска PM2 при перезагрузке
pm2 startup systemd
# Выполни команду, которую выдаст PM2
```

### 1.4 Установка Nginx

```bash
sudo apt install -y nginx

# Проверка статуса
sudo systemctl status nginx
```

### 1.5 Установка Certbot (для SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Клонирование и настройка проекта

### 2.1 Создание директории для приложения

```bash
# Создай пользователя для приложения (опционально, но рекомендуется)
sudo useradd -m -s /bin/bash rugapp
sudo usermod -aG sudo rugapp

# Переключись на этого пользователя
sudo su - rugapp

# Создай директорию для проекта
mkdir -p ~/apps
cd ~/apps
```

### 2.2 Клонирование репозитория

```bash
# Замени на URL твоего репозитория
git clone https://github.com/ТВОЙ_USERNAME/rug.git
cd rug
```

### 2.3 Установка зависимостей

```bash
npm install --production=false
```

### 2.4 Настройка переменных окружения

```bash
# Создай .env.local файл
nano .env.local
```

Добавь следующее содержимое:

```env
# Helius API (обязательно)
HELIUS_API_KEY=your_helius_api_key_here

# Birdeye API (обязательно)
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_SECRET=your_webhook_secret_here

# Production настройки
NODE_ENV=production
```

Сохрани файл: `Ctrl + X`, затем `Y`, затем `Enter`.

### 2.5 Сборка приложения

```bash
npm run build
```

Проверь, что сборка прошла успешно (должна создаться папка `.next`):

```bash
ls -la .next
```

---

## 3. Настройка PM2

### 3.1 Создание PM2 ecosystem файла

```bash
nano ecosystem.config.js
```

Добавь следующее содержимое:

```javascript
module.exports = {
  apps: [
    {
      name: 'rug-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/rugapp/apps/rug',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/rugapp/apps/rug/logs/err.log',
      out_file: '/home/rugapp/apps/rug/logs/out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
```

### 3.2 Создание папки для логов

```bash
mkdir -p logs
```

### 3.3 Запуск приложения через PM2

```bash
# Запуск
pm2 start ecosystem.config.js

# Проверка статуса
pm2 status

# Просмотр логов
pm2 logs rug-web

# Сохранение конфигурации PM2
pm2 save
```

### 3.4 Полезные команды PM2

```bash
# Перезапуск
pm2 restart rug-web

# Остановка
pm2 stop rug-web

# Удаление
pm2 delete rug-web

# Мониторинг
pm2 monit

# Просмотр логов в реальном времени
pm2 logs rug-web --lines 100
```

---

## 4. Настройка Nginx

### 4.1 Создание конфигурации Nginx

```bash
# Выйди из пользователя rugapp
exit

# Создай конфиг для твоего сайта (замени rugcheck.com на твой домен)
sudo nano /etc/nginx/sites-available/rugcheck.com
```

Добавь следующее содержимое (замени `rugcheck.com` на свой домен):

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

upstream nextjs_upstream {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name rugcheck.com www.rugcheck.com;

    # Временная настройка для Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Редирект на HTTPS (будет активен после получения SSL)
    # location / {
    #     return 301 https://$server_name$request_uri;
    # }

    # Временный проксинг до получения SSL
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
    }
}
```

### 4.2 Активация конфигурации

```bash
# Создай символическую ссылку
sudo ln -s /etc/nginx/sites-available/rugcheck.com /etc/nginx/sites-enabled/

# Удали дефолтный конфиг
sudo rm /etc/nginx/sites-enabled/default

# Проверь конфигурацию на ошибки
sudo nginx -t

# Перезапусти Nginx
sudo systemctl restart nginx
```

### 4.3 Проверка работы

Открой браузер и перейди на `http://твой-домен.com` — должен открыться твой сайт.

---

## 5. Настройка SSL (HTTPS)

### 5.1 Получение SSL сертификата от Let's Encrypt

```bash
# Получение сертификата (замени rugcheck.com на свой домен)
sudo certbot --nginx -d rugcheck.com -d www.rugcheck.com
```

Certbot автоматически:
- Получит сертификат
- Настроит Nginx для HTTPS
- Настроит автоматическое продление

### 5.2 Обновление Nginx конфигурации для production

После получения SSL, обнови конфигурацию:

```bash
sudo nano /etc/nginx/sites-available/rugcheck.com
```

Замени содержимое на полную production конфигурацию:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=scan_limit:10m rate=2r/s;

upstream nextjs_upstream {
  server 127.0.0.1:3000;
  keepalive 64;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name rugcheck.com www.rugcheck.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rugcheck.com www.rugcheck.com;

    # SSL certificates (Certbot автоматически заполнит эти пути)
    ssl_certificate /etc/letsencrypt/live/rugcheck.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rugcheck.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/rugcheck.com/chain.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Next.js static files
    location /_next/static {
        proxy_pass http://nextjs_upstream;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes with rate limiting
    location /api/scan {
        limit_req zone=scan_limit burst=5 nodelay;
        limit_req_status 429;
        
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Main app
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
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

### 5.3 Применение изменений

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 5.4 Проверка SSL

Открой `https://твой-домен.com` — должен работать HTTPS с зеленым замком.

Проверь SSL конфигурацию на [SSL Labs](https://www.ssllabs.com/ssltest/):
```
https://www.ssllabs.com/ssltest/analyze.html?d=твой-домен.com
```

---

## 6. Настройка Telegram Bot (опционально)

Если хочешь запустить Telegram бота:

### 6.1 Настройка PM2 для бота

Обнови `ecosystem.config.js`:

```bash
nano /home/rugapp/apps/rug/ecosystem.config.js
```

Добавь вторую секцию в массив `apps`:

```javascript
module.exports = {
  apps: [
    {
      name: 'rug-web',
      // ... существующая конфигурация
    },
    {
      name: 'rug-bot',
      script: 'npm',
      args: 'run bot',
      cwd: '/home/rugapp/apps/rug',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/rugapp/apps/rug/logs/bot-err.log',
      out_file: '/home/rugapp/apps/rug/logs/bot-out.log',
      time: true,
      autorestart: true
    }
  ]
};
```

### 6.2 Настройка webhook

```bash
cd /home/rugapp/apps/rug
npm run bot:setup
```

### 6.3 Запуск бота

```bash
pm2 restart ecosystem.config.js
pm2 logs rug-bot
```

---

## 7. Настройка Firewall

### 7.1 Установка UFW

```bash
sudo apt install -y ufw
```

### 7.2 Настройка правил

```bash
# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status verbose
```

---

## 8. Мониторинг и обслуживание

### 8.1 Просмотр логов

```bash
# PM2 логи
pm2 logs rug-web --lines 200

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Системные логи Next.js
journalctl -u pm2-rugapp.service -f
```

### 8.2 Мониторинг ресурсов

```bash
# PM2 monitoring
pm2 monit

# Системные ресурсы
htop

# Использование диска
df -h

# Статистика Nginx
sudo nginx -V
```

### 8.3 Автоматическое продление SSL

Certbot автоматически настроил cron job для продления. Проверь:

```bash
sudo systemctl status certbot.timer
```

Ручная проверка продления (dry run):

```bash
sudo certbot renew --dry-run
```

---

## 9. Деплой обновлений

Когда нужно обновить код:

```bash
# Переключись на пользователя rugapp
sudo su - rugapp
cd ~/apps/rug

# Получи последние изменения
git pull origin main

# Установи новые зависимости (если есть)
npm install

# Пересобери проект
npm run build

# Перезапусти PM2
pm2 restart rug-web

# Проверь логи
pm2 logs rug-web --lines 50
```

### 9.1 Автоматизация деплоя (опционально)

Создай deploy скрипт:

```bash
nano /home/rugapp/apps/rug/deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart rug-web

echo "✅ Deployment complete!"

# Show logs
pm2 logs rug-web --lines 20
```

Сделай скрипт исполняемым:

```bash
chmod +x /home/rugapp/apps/rug/deploy.sh
```

Теперь деплой — одна команда:

```bash
./deploy.sh
```

---

## 10. Бэкапы

### 10.1 Настройка автоматического бэкапа .env

```bash
# Создай директорию для бэкапов
mkdir -p ~/backups

# Создай скрипт бэкапа
nano ~/backups/backup-env.sh
```

```bash
#!/bin/bash

BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

cp ~/apps/rug/.env.local $BACKUP_DIR/env_$DATE.backup

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "env_*.backup" -mtime +30 -delete

echo "Backup created: env_$DATE.backup"
```

```bash
chmod +x ~/backups/backup-env.sh

# Добавь в crontab (бэкап каждый день в 3 AM)
crontab -e
```

Добавь строку:

```
0 3 * * * /home/rugapp/backups/backup-env.sh
```

---

## 11. Проверка production-готовности

### Чеклист перед запуском:

- ✅ Next.js собран без ошибок (`npm run build`)
- ✅ PM2 запущен и показывает статус "online"
- ✅ Nginx конфигурация проверена (`nginx -t`)
- ✅ SSL сертификат получен и работает (зеленый замок в браузере)
- ✅ Firewall настроен (порты 80, 443, 22 открыты)
- ✅ `.env.local` заполнен правильными API ключами
- ✅ Логи PM2 не показывают ошибок
- ✅ Сайт открывается по домену через HTTPS
- ✅ API routes отвечают (проверь `/api/stats`)
- ✅ Rate limiting работает (Nginx возвращает 429 при превышении)

### Тестирование endpoints:

```bash
# Проверка health endpoint
curl https://твой-домен.com/health

# Проверка stats API
curl https://твой-домен.com/api/stats

# Проверка scan API (замени на реальный token address)
curl -X POST https://твой-домен.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"address":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}'
```

---

## 12. Troubleshooting

### Проблема: Next.js не запускается

```bash
# Проверь логи PM2
pm2 logs rug-web --err

# Проверь порт 3000
sudo netstat -tlnp | grep 3000

# Перезапусти PM2
pm2 restart rug-web
```

### Проблема: 502 Bad Gateway от Nginx

```bash
# Проверь, работает ли Next.js
curl http://localhost:3000

# Проверь логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверь конфигурацию Nginx
sudo nginx -t

# Перезапусти оба сервиса
pm2 restart rug-web
sudo systemctl restart nginx
```

### Проблема: SSL не работает

```bash
# Проверь сертификаты
sudo certbot certificates

# Попробуй получить заново
sudo certbot --nginx -d твой-домен.com

# Проверь конфигурацию Nginx
sudo nginx -t
```

### Проблема: Высокое использование CPU/RAM

```bash
# Проверь PM2 статус
pm2 status

# Уменьши количество instances в ecosystem.config.js
# Вместо 'max' поставь конкретное число, например:
instances: 2

# Перезапусти
pm2 restart rug-web
```

---

## 13. Production оптимизации

### 13.1 Кеширование в Next.js

Обнови `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
```

### 13.2 Swap файл (для серверов с малым объемом RAM)

```bash
# Создание 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Сделать постоянным
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 14. Полезные команды

### PM2

```bash
pm2 list                    # Список процессов
pm2 restart rug-web         # Перезапуск
pm2 stop rug-web            # Остановка
pm2 delete rug-web          # Удаление
pm2 logs rug-web            # Логи
pm2 monit                   # Мониторинг
pm2 save                    # Сохранить конфигурацию
pm2 resurrect               # Восстановить сохраненные процессы
```

### Nginx

```bash
sudo nginx -t               # Проверка конфигурации
sudo systemctl restart nginx # Перезапуск
sudo systemctl status nginx  # Статус
sudo tail -f /var/log/nginx/access.log  # Access logs
sudo tail -f /var/log/nginx/error.log   # Error logs
```

### Git

```bash
git pull origin main        # Получить изменения
git status                  # Статус репозитория
git log --oneline -10       # Последние 10 коммитов
```

---

## 15. Контакты и поддержка

После деплоя твой сайт будет доступен по адресу:
- **HTTP:** `http://твой-домен.com` (редирект на HTTPS)
- **HTTPS:** `https://твой-домен.com`

**Важные файлы:**
- Код: `/home/rugapp/apps/rug`
- Логи: `/home/rugapp/apps/rug/logs`
- Env: `/home/rugapp/apps/rug/.env.local`
- Nginx config: `/etc/nginx/sites-available/твой-домен.com`
- PM2 config: `/home/rugapp/apps/rug/ecosystem.config.js`

---

**🎉 Готово! Твой Solana token analyzer теперь в production!**
