# API Server для TimeWeb PostgreSQL

Этот API сервер работает с базой данных TimeWeb Cloud PostgreSQL.

## Установка на сервере

1. Скопируй папку `server` на сервер:
```bash
scp -r server/ root@IP:/var/www/abeliovich/
```

2. На сервере установи зависимости:
```bash
cd /var/www/abeliovich/server
npm install
```

3. Установи PM2 (если ещё не установлен):
```bash
npm install -g pm2
```

4. Создай папку для логов:
```bash
mkdir -p logs
```

5. Запусти API сервер:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. Проверь статус:
```bash
pm2 status
pm2 logs ab-education-api
```

7. Настрой nginx (в файле `/etc/nginx/sites-available/ab-education.ru`):
```nginx
# Внутри блока server добавь:
location /api/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

8. Перезагрузи nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## API Endpoints

### GET /api?action=list&table=TABLE_NAME
Получить список записей из таблицы

### GET /api?action=stats
Получить статистику по базе данных

### POST /api
```json
{
  "action": "query",
  "query": "SELECT * FROM table_name"
}
```

## Мониторинг

```bash
# Посмотреть логи
pm2 logs ab-education-api

# Перезапустить
pm2 restart ab-education-api

# Остановить
pm2 stop ab-education-api
```
