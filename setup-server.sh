#!/bin/bash

# Команды для выполнения на Timeweb VPS сервере
# Подключитесь: ssh root@109.68.215.186
# Затем выполните эти команды поочередно

echo "=== Настройка сервера для ab-education.ru ==="

# 1. Создаем директорию для сайта
mkdir -p /var/www/ab-education
cd /var/www/ab-education

# 2. Устанавливаем Nginx (если не установлен)
apt-get update
apt-get install -y nginx

# 3. Создаем конфигурацию Nginx
cat > /etc/nginx/sites-available/ab-education << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ab-education.ru www.ab-education.ru;

    root /var/www/ab-education;
    index index.html;

    access_log /var/log/nginx/ab-education-access.log;
    error_log /var/log/nginx/ab-education-error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-User-Id, X-Auth-Token" always;
}
EOF

# 4. Активируем конфигурацию
ln -sf /etc/nginx/sites-available/ab-education /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 5. Проверяем конфигурацию
nginx -t

# 6. Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx

# 7. Открываем порты
ufw allow 80/tcp
ufw allow 443/tcp

echo ""
echo "✅ Nginx настроен!"
echo ""
echo "📁 Теперь загрузите файлы сайта в /var/www/ab-education/"
echo "   Можно использовать SCP, SFTP или Git"
echo ""
echo "🔐 Для установки SSL сертификата выполните:"
echo "   apt-get install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d ab-education.ru -d www.ab-education.ru"
