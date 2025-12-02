#!/bin/bash

# Скрипт настройки SSL сертификата с Let's Encrypt

set -e

echo "🔒 Настройка SSL сертификата..."

# Проверка наличия домена
if [ -z "$DOMAIN" ]; then
    echo "❌ Ошибка: не указан домен"
    echo "Использование: DOMAIN=example.com bash setup-ssl.sh"
    exit 1
fi

# Установка Certbot
echo "📦 Установка Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Остановка Nginx для получения сертификата
echo "⏸️ Временная остановка Nginx..."
systemctl stop nginx

# Получение SSL сертификата
echo "📜 Получение SSL сертификата для $DOMAIN..."
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    -d $DOMAIN

# Настройка Nginx для HTTPS
echo "⚙️ Настройка Nginx для HTTPS..."
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/app/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Автообновление сертификата
echo "🔄 Настройка автообновления сертификата..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Запуск Nginx
echo "▶️ Запуск Nginx..."
systemctl start nginx
systemctl reload nginx

echo "✅ SSL сертификат успешно настроен!"
echo "🔒 HTTPS доступен: https://$DOMAIN"
