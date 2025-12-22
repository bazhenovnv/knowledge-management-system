#!/bin/bash

# Скрипт деплоя на сервер ab-education.ru
# Использование: ./deploy-to-server.sh

set -e

echo "🚀 Начинаю деплой на ab-education.ru..."

# 1. Собираем production билд
echo "📦 Собираю production билд..."
npm run build

# 2. Создаем архив dist
echo "📦 Создаю архив dist.tar.gz..."
tar -czf dist.tar.gz -C dist .

# 3. Загружаем на сервер
echo "⬆️  Загружаю на сервер..."
scp dist.tar.gz root@6152655-mg709640.tw1.ru:/tmp/

# 4. Разворачиваем на сервере
echo "🔧 Разворачиваю на сервере..."
ssh root@6152655-mg709640.tw1.ru << 'ENDSSH'
set -e

# Бэкап старой версии
if [ -d /var/www/giftbox/dist ]; then
    echo "💾 Создаю бэкап старой версии..."
    rm -rf /var/www/giftbox/dist.old
    mv /var/www/giftbox/dist /var/www/giftbox/dist.old
fi

# Создаем директорию если её нет
mkdir -p /var/www/giftbox/dist

# Распаковываем новую версию
echo "📂 Распаковываю новую версию..."
tar -xzf /tmp/dist.tar.gz -C /var/www/giftbox/dist

# Устанавливаем права
chown -R www-data:www-data /var/www/giftbox/dist
chmod -R 755 /var/www/giftbox/dist

# Очищаем временные файлы
rm /tmp/dist.tar.gz

echo "✅ Деплой завершён!"
ENDSSH

# 5. Удаляем локальный архив
rm dist.tar.gz

echo ""
echo "✅ Деплой успешно завершён!"
echo ""

# 6. Проверяем работу сайта и API
echo "🔍 Проверяю доступность сайта..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://ab-education.ru)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Сайт работает: http://ab-education.ru (HTTP $HTTP_CODE)"
else
    echo "⚠️  Сайт вернул код: HTTP $HTTP_CODE"
fi

echo ""
echo "🔍 Проверяю работу API..."
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://ab-education.ru/api/hello)
if [ "$API_CODE" = "200" ]; then
    echo "✅ API работает: http://ab-education.ru/api/hello (HTTP $API_CODE)"
    API_RESPONSE=$(curl -s http://ab-education.ru/api/hello)
    echo "📋 Ответ API: $API_RESPONSE"
elif [ "$API_CODE" = "426" ]; then
    echo "❌ API возвращает ошибку 426 (Upgrade Required)"
    echo "   Возможно, не обновлен nginx конфиг. Запустите: ./server-setup.sh"
else
    echo "⚠️  API вернул код: HTTP $API_CODE"
fi

echo ""
echo "🌐 Сайт: http://ab-education.ru"
echo "🔌 API: http://ab-education.ru/api/"