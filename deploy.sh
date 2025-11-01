#!/bin/bash

echo "🚀 Развертывание Knowledge Management System на TimeWeb Cloud"
echo "============================================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные
SERVER_IP="109.68.215.186"
SERVER_USER="root"
BACKEND_DIR="/var/www/knowledge-api"
FRONTEND_DIR="/var/www/knowledge-frontend"

echo -e "${YELLOW}Шаг 1: Сборка production билда${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Ошибка: Папка dist не создана!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Билд успешно собран${NC}"

echo -e "${YELLOW}Шаг 2: Подключение к серверу и подготовка директорий${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Создание директорий если их нет
    mkdir -p /var/www/knowledge-frontend
    
    # Создание backup предыдущей версии
    if [ -d "/var/www/knowledge-frontend/dist" ]; then
        echo "Создание backup..."
        mv /var/www/knowledge-frontend/dist /var/www/knowledge-frontend/dist.backup.$(date +%Y%m%d_%H%M%S)
    fi
ENDSSH

echo -e "${GREEN}✅ Директории подготовлены${NC}"

echo -e "${YELLOW}Шаг 3: Загрузка файлов на сервер${NC}"
rsync -avz --progress dist/ ${SERVER_USER}@${SERVER_IP}:${FRONTEND_DIR}/dist/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Файлы успешно загружены${NC}"
else
    echo -e "${RED}❌ Ошибка при загрузке файлов${NC}"
    exit 1
fi

echo -e "${YELLOW}Шаг 4: Настройка прав доступа${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    chmod -R 755 /var/www/knowledge-frontend/dist
    chown -R www-data:www-data /var/www/knowledge-frontend/dist
ENDSSH

echo -e "${GREEN}✅ Права доступа настроены${NC}"

echo -e "${YELLOW}Шаг 5: Перезапуск Nginx${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    nginx -t && systemctl reload nginx
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx перезапущен${NC}"
else
    echo -e "${RED}❌ Ошибка при перезапуске Nginx${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🎉 Развертывание завершено успешно!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "Ваше приложение доступно по адресу:"
echo -e "${YELLOW}http://${SERVER_IP}${NC}"
echo ""
echo -e "API доступно по адресу:"
echo -e "${YELLOW}http://${SERVER_IP}/api/health${NC}"
echo ""
