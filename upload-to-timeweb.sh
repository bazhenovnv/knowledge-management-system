#!/bin/bash

# Скрипт загрузки на Timeweb VPS
# Использование: bash upload-to-timeweb.sh

SERVER="109.68.215.186"
USER="root"
REMOTE_PATH="/var/www/ab-education"

echo "🚀 Загрузка файлов на сервер $SERVER..."

# Создаем директорию на сервере (если не существует)
ssh $USER@$SERVER "mkdir -p $REMOTE_PATH"

# Загружаем файлы из dist/
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env*' \
  dist/ $USER@$SERVER:$REMOTE_PATH/

echo "✅ Файлы загружены!"
echo ""
echo "📝 Следующий шаг - настройте Nginx на сервере:"
echo "   ssh $USER@$SERVER"
echo "   nano /etc/nginx/sites-available/ab-education"
