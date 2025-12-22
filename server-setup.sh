#!/bin/bash

# Скрипт первоначальной настройки сервера
# Использование: ./server-setup.sh

set -e

echo "🔧 Настройка сервера ab-education.ru..."

# Загружаем конфиг nginx на сервер
echo "📤 Загружаю nginx конфиг на сервер..."
scp nginx-config.conf root@6152655-mg709640.tw1.ru:/tmp/ab-education.conf

# Настраиваем nginx на сервере
ssh root@6152655-mg709640.tw1.ru << 'ENDSSH'
set -e

echo "🗑️  Удаляю старые конфиги..."
# Удаляем старые конфиги
rm -f /etc/nginx/sites-enabled/giftbox
rm -f /etc/nginx/sites-available/giftbox
rm -f /etc/nginx/sites-enabled/ab-education.ru
rm -f /etc/nginx/sites-available/ab-education.ru

# Устанавливаем новый конфиг
echo "📝 Устанавливаю новый конфиг..."
mv /tmp/ab-education.conf /etc/nginx/sites-available/ab-education.ru

# Создаем symlink если его нет
if [ ! -L /etc/nginx/sites-enabled/ab-education.ru ]; then
    ln -s /etc/nginx/sites-available/ab-education.ru /etc/nginx/sites-enabled/ab-education.ru
fi

# Проверяем конфиг
echo "✅ Проверяю nginx конфиг..."
nginx -t

# Перезагружаем nginx
echo "🔄 Перезагружаю nginx..."
systemctl reload nginx

echo "✅ Сервер настроен!"
ENDSSH

echo ""
echo "✅ Настройка сервера завершена!"
echo ""

# Проверяем работу nginx
echo "🔍 Проверяю доступность сервера..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://ab-education.ru 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✅ Nginx работает (HTTP $HTTP_CODE)"
else
    echo "⚠️  Сервер вернул код: HTTP $HTTP_CODE"
fi

echo ""
echo "🌐 Теперь можно выполнить деплой: ./deploy-to-server.sh"