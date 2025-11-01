# Полное развертывание приложения на TimeWeb Cloud

## Архитектура
Сервер **ab-education** (109.68.215.186):
- ✅ PostgreSQL база данных
- ✅ Node.js Backend API (порт 3000)
- ✅ React Frontend (собранный билд)
- ✅ Nginx (раздача фронтенда + проксирование API)

---

## Часть 1: Подключение и подготовка

### 1.1. Подключитесь к серверу

```bash
ssh root@109.68.215.186
```

### 1.2. Обновите систему

```bash
apt update
apt upgrade -y
```

### 1.3. Установите необходимое ПО

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# PM2
npm install -g pm2

# Nginx
apt-get install -y nginx

# Git (для клонирования репозитория)
apt-get install -y git

# Проверка установки
node -v
npm -v
nginx -v
```

---

## Часть 2: Backend API

### 2.1. Создайте директорию для API

```bash
mkdir -p /var/www/knowledge-api
cd /var/www/knowledge-api
```

### 2.2. Создайте package.json

```bash
cat > package.json << 'EOF'
{
  "name": "knowledge-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}
EOF
```

### 2.3. Создайте server.js

```bash
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
    const result = await pool.query(query, params);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/list', async (req, res) => {
  try {
    const { table, schema = 'public', limit = 100, offset = 0 } = req.body;
    const query = `SELECT * FROM ${schema}.${table} LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table}`;
    const countResult = await pool.query(countQuery);
    res.json({ rows: result.rows, count: parseInt(countResult.rows[0].count) });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stats', async (req, res) => {
  try {
    const { schema = 'public' } = req.body;
    const tablesQuery = `
      SELECT table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = $1 AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = $1
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(tablesQuery, [schema]);
    const tables = tablesResult.rows;
    let totalRecords = 0;
    for (let table of tables) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table.table_name}`;
        const countResult = await pool.query(countQuery);
        table.record_count = parseInt(countResult.rows[0].count);
        totalRecords += table.record_count;
      } catch (err) {
        table.record_count = 0;
      }
    }
    res.json({ tables, totalTables: tables.length, totalRecords });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
EOF
```

### 2.4. Создайте .env файл

⚠️ **ВАЖНО: Замените на ваши данные из TimeWeb Cloud панели!**

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://ваш_user:ваш_пароль@localhost:5432/ваша_база
NODE_ENV=production
PORT=3000
EOF
```

### 2.5. Установите зависимости и запустите

```bash
npm install
pm2 start server.js --name knowledge-api
pm2 save
pm2 startup
```

### 2.6. Проверьте работу API

```bash
curl http://localhost:3000/api/health
# Должно вернуть: {"status":"ok","database":"connected",...}
```

---

## Часть 3: Frontend (React приложение)

### 3.1. Клонируйте проект с GitHub

Если вы уже подключили GitHub к poehali.dev:

```bash
cd /var/www
git clone https://github.com/ваш-username/ваш-репозиторий.git knowledge-frontend
cd knowledge-frontend
```

**ИЛИ** если репозитория нет, создам скрипт для скачивания билда с poehali.dev.

### 3.2. Установите зависимости

```bash
npm install
```

### 3.3. Настройте переменные окружения

Создайте файл `.env.production`:

```bash
cat > .env.production << 'EOF'
VITE_API_URL=http://109.68.215.186/api
EOF
```

### 3.4. Соберите production билд

```bash
npm run build
```

Это создаст папку `dist/` с готовым приложением.

---

## Часть 4: Nginx (веб-сервер)

### 4.1. Создайте конфигурацию Nginx

```bash
cat > /etc/nginx/sites-available/knowledge-app << 'EOF'
server {
    listen 80;
    server_name 109.68.215.186;  # Или ваш домен

    # Frontend
    root /var/www/knowledge-frontend/dist;
    index index.html;

    # Сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend - все запросы на index.html (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Кеширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

### 4.2. Активируйте конфигурацию

```bash
# Удалите дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Активируйте новую
ln -s /etc/nginx/sites-available/knowledge-app /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t

# Перезапустите Nginx
systemctl restart nginx
systemctl enable nginx
```

### 4.3. Откройте порты в файрволе

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH (ВАЖНО!)
ufw enable
ufw status
```

---

## Часть 5: SSL сертификат (опционально, но рекомендуется)

Если у вас есть домен, привязанный к 109.68.215.186:

```bash
# Установка Certbot
apt-get install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автообновление сертификата
certbot renew --dry-run
```

Certbot автоматически изменит конфигурацию Nginx для HTTPS.

---

## Часть 6: Обновление приложения

Когда нужно обновить код:

```bash
# Backend
cd /var/www/knowledge-api
# Внесите изменения в код
pm2 restart knowledge-api

# Frontend
cd /var/www/knowledge-frontend
git pull  # Если используете Git
npm run build
# Nginx автоматически подхватит новые файлы
```

---

## 🔧 Полезные команды

### PM2 (управление backend)
```bash
pm2 status              # Статус
pm2 logs knowledge-api  # Логи
pm2 restart knowledge-api  # Перезапуск
pm2 stop knowledge-api     # Остановка
```

### Nginx (управление веб-сервером)
```bash
systemctl status nginx   # Статус
systemctl restart nginx  # Перезапуск
nginx -t                 # Проверка конфигурации
tail -f /var/log/nginx/access.log  # Логи доступа
tail -f /var/log/nginx/error.log   # Логи ошибок
```

### PostgreSQL
```bash
systemctl status postgresql   # Статус
psql -U ваш_user -d ваша_база  # Подключение к БД
```

---

## 🌐 Доступ к приложению

После развертывания ваше приложение будет доступно:
- **HTTP**: `http://109.68.215.186`
- **HTTPS** (с SSL): `https://ваш-домен.ru`
- **API**: `http://109.68.215.186/api/health`

---

## ⚠️ Важные моменты

1. **Безопасность**: Обязательно смените пароли PostgreSQL и добавьте файрвол
2. **Резервные копии**: Настройте автоматические бэкапы БД
3. **Мониторинг**: Установите систему мониторинга (например, PM2 Plus)
4. **Логи**: Регулярно проверяйте логи на ошибки

---

## 🆘 Troubleshooting

### Проблема: Nginx не запускается
```bash
nginx -t  # Проверьте синтаксис
systemctl status nginx  # Смотрите ошибки
```

### Проблема: Backend API не отвечает
```bash
pm2 logs knowledge-api  # Смотрите логи
curl http://localhost:3000/api/health  # Проверьте локально
```

### Проблема: Frontend показывает ошибку
```bash
# Проверьте что билд собрался
ls -la /var/www/knowledge-frontend/dist

# Проверьте права доступа
chmod -R 755 /var/www/knowledge-frontend/dist
```

---

## ✅ Готово!

Теперь у вас полностью независимое приложение на собственном сервере! 🎉
