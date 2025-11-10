#!/bin/bash

# Скрипт автоматического деплоя на Timeweb VPS
# Использование: bash deploy-to-timeweb.sh

set -e

echo "🚀 Начинаю деплой на ab-education.ru"

# Переменные
SERVER_IP="109.68.215.186"
SERVER_USER="root"
REMOTE_DIR="/var/www/ab-education"
BUILD_DIR="builds/df32d3de5578de49a4cc08aebe9b30b45ef3e56b/5fba4"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Шаг 1/5: Проверка SSH доступа...${NC}"
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'SSH OK'" 2>/dev/null; then
    echo "❌ Не могу подключиться к серверу $SERVER_IP"
    echo "Убедитесь, что:"
    echo "  1. У вас есть SSH доступ к серверу"
    echo "  2. SSH ключ добавлен: ssh-copy-id $SERVER_USER@$SERVER_IP"
    exit 1
fi
echo -e "${GREEN}✅ SSH доступ есть${NC}"

echo -e "${YELLOW}Шаг 2/5: Создание директории на сервере...${NC}"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
echo -e "${GREEN}✅ Директория создана${NC}"

echo -e "${YELLOW}Шаг 3/5: Загрузка файлов на сервер...${NC}"
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    $BUILD_DIR/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/
echo -e "${GREEN}✅ Файлы загружены${NC}"

echo -e "${YELLOW}Шаг 4/5: Настройка Nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Проверка установки Nginx
if ! command -v nginx &> /dev/null; then
    echo "Устанавливаю Nginx..."
    apt-get update -qq
    apt-get install -y nginx
fi

# Создание конфигурации Nginx
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

# Активация конфигурации
ln -sf /etc/nginx/sites-available/ab-education /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск Nginx
if nginx -t 2>&1; then
    systemctl restart nginx
    echo "Nginx перезапущен успешно"
else
    echo "Ошибка в конфигурации Nginx"
    exit 1
fi

# Открытие портов в UFW (если активен)
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    ufw allow 80/tcp
    ufw allow 443/tcp
fi
ENDSSH
echo -e "${GREEN}✅ Nginx настроен${NC}"

echo -e "${YELLOW}Шаг 5/5: Проверка работы сайта...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Сайт работает! HTTP код: $HTTP_CODE${NC}"
else
    echo -e "${YELLOW}⚠️  Сайт отвечает с кодом: $HTTP_CODE${NC}"
    echo "Проверьте логи: ssh $SERVER_USER@$SERVER_IP 'tail -n 50 /var/log/nginx/ab-education-error.log'"
fi

echo ""
echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
echo "📍 Ваш сайт доступен по адресам:"
echo "   - http://$SERVER_IP"
echo "   - http://ab-education.ru (после обновления DNS)"
echo ""
echo "🔐 Для установки SSL сертификата выполните:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   apt-get install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d ab-education.ru -d www.ab-education.ru"
echo ""
echo "📊 Полезные команды:"
echo "   - Логи: ssh $SERVER_USER@$SERVER_IP 'tail -f /var/log/nginx/ab-education-access.log'"
echo "   - Статус Nginx: ssh $SERVER_USER@$SERVER_IP 'systemctl status nginx'"
echo "   - Рестарт Nginx: ssh $SERVER_USER@$SERVER_IP 'systemctl restart nginx'"
