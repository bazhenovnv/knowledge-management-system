#!/bin/bash
# Установка Python backend на сервер ab-education.ru

set -e

echo "🚀 Установка Python backend на сервер..."

# 1. Установка Python и зависимостей
echo "📦 Устанавливаем Python и pip..."
apt-get update
apt-get install -y python3 python3-pip python3-venv

# 2. Создаём виртуальное окружение
echo "🔧 Создаём виртуальное окружение..."
cd /var/www/giftbox
python3 -m venv venv
source venv/bin/activate

# 3. Устанавливаем зависимости
echo "📚 Устанавливаем зависимости..."
pip install --upgrade pip
pip install flask psycopg2-binary pydantic email-validator gunicorn

# 4. Создаём Flask приложение
echo "⚙️ Создаём Flask API..."
mkdir -p /var/www/giftbox/api

# 5. Копируем .env с секретами
echo "🔐 Настраиваем переменные окружения..."
cat > /var/www/giftbox/api/.env << 'ENV_EOF'
DATABASE_CONNECTION_TIMEWEB=postgresql://gen_user:TC>o0yl2J_PR(e@c6b7ae5ab8e72b5408272e27.twc1.net:5432/default_db
ENV_EOF

# 6. Создаём systemd сервис для API
echo "🔧 Создаём systemd сервис..."
cat > /etc/systemd/system/ab-education-api.service << 'SERVICE_EOF'
[Unit]
Description=AB Education API Service
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/giftbox/api
Environment="PATH=/var/www/giftbox/venv/bin"
EnvironmentFile=/var/www/giftbox/api/.env
ExecStart=/var/www/giftbox/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 --timeout 120 app:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# 7. Обновляем nginx конфигурацию
echo "🌐 Обновляем nginx конфигурацию..."
cat > /etc/nginx/sites-available/ab-education.ru << 'NGINX_EOF'
server {
    listen 80;
    server_name ab-education.ru www.ab-education.ru;
    
    root /var/www/giftbox/dist;
    index index.html;
    
    # API на локальном Flask (через gunicorn)
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
    
    # Статика с кэшем
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # SPA режим
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
NGINX_EOF

# 8. Проверяем и перезагружаем nginx
nginx -t && systemctl reload nginx

# 9. Запускаем API сервис
echo "🚀 Запускаем API сервис..."
systemctl daemon-reload
systemctl enable ab-education-api.service
systemctl start ab-education-api.service

# 10. Проверяем статус
systemctl status ab-education-api.service --no-pager

echo "✅ Backend установлен успешно!"
echo "📊 Проверьте логи: journalctl -u ab-education-api.service -f"
