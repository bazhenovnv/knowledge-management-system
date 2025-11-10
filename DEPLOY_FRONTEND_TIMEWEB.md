# Развертывание фронтенда на Timeweb VPS

## Шаг 1: Измените DNS-запись

В панели управления доменом ab-education.ru:
- Измените A-запись с `83.147.247.229` на `109.68.215.186`
- Подождите 5-30 минут распространения DNS

## Шаг 2: Подключитесь к серверу

```bash
ssh root@109.68.215.186
```

## Шаг 3: Установите Nginx (если еще не установлен)

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

## Шаг 4: Создайте директорию для сайта

```bash
mkdir -p /var/www/ab-education
```

## Шаг 5: Соберите проект локально

На вашем компьютере (или в терминале poehali.dev):

```bash
npm run build
```

Это создаст папку `dist/` с готовыми файлами.

## Шаг 6: Загрузите файлы на сервер

**Вариант A: Через SCP (с вашего компьютера)**

```bash
scp -r dist/* root@109.68.215.186:/var/www/ab-education/
```

**Вариант B: Через GitHub**

```bash
# На сервере
cd /var/www/ab-education
git clone https://github.com/ваш-репозиторий.git .
npm install
npm run build
mv dist/* ./
rm -rf dist node_modules
```

## Шаг 7: Настройте Nginx

```bash
cat > /etc/nginx/sites-available/ab-education << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ab-education.ru www.ab-education.ru;

    root /var/www/ab-education;
    index index.html;

    # Логи
    access_log /var/log/nginx/ab-education-access.log;
    error_log /var/log/nginx/ab-education-error.log;

    # Сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # SPA routing - все запросы отправляем на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS для API
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-User-Id, X-Auth-Token" always;
}
EOF
```

## Шаг 8: Активируйте конфигурацию

```bash
# Создайте символическую ссылку
ln -s /etc/nginx/sites-available/ab-education /etc/nginx/sites-enabled/

# Удалите дефолтный конфиг (если мешает)
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Перезапустите Nginx
systemctl restart nginx
```

## Шаг 9: Откройте порты в файрволе

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw status
```

## Шаг 10: Установите SSL-сертификат (HTTPS)

```bash
# Установите Certbot
apt-get install -y certbot python3-certbot-nginx

# Получите сертификат
certbot --nginx -d ab-education.ru -d www.ab-education.ru

# Автопродление будет настроено автоматически
```

## Шаг 11: Проверьте работу сайта

Откройте в браузере:
- http://ab-education.ru (HTTP)
- https://ab-education.ru (HTTPS после установки SSL)

## 🔄 Обновление сайта

Когда нужно обновить код:

```bash
# Локально соберите новую версию
npm run build

# Загрузите на сервер
scp -r dist/* root@109.68.215.186:/var/www/ab-education/

# Очистите кэш браузера или перезапустите Nginx
ssh root@109.68.215.186 "systemctl reload nginx"
```

## 📊 Полезные команды

```bash
# Логи Nginx
tail -f /var/log/nginx/ab-education-access.log
tail -f /var/log/nginx/ab-education-error.log

# Статус Nginx
systemctl status nginx

# Перезапуск Nginx
systemctl restart nginx

# Проверка конфигурации
nginx -t

# Размер папки сайта
du -sh /var/www/ab-education
```

## ⚠️ Важные замечания

1. **Backend API** — ваш фронтенд использует Cloud Functions (functions.poehali.dev), они продолжат работать
2. **База данных** — фронтенд обращается к API, которые подключены к вашей Timeweb БД
3. **Метрика** — Yandex.Metrika настроена на домен ab-education.ru и будет работать
4. **SSL обязателен** — многие функции (геолокация, камера) требуют HTTPS

## 🎯 Результат

После выполнения всех шагов:
- ✅ Сайт доступен по адресу https://ab-education.ru
- ✅ SSL-сертификат установлен автоматически
- ✅ Все API работают через Cloud Functions
- ✅ База данных на Timeweb подключена
- ✅ Роутинг SPA настроен правильно
