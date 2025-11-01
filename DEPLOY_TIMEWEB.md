# Развертывание на TimeWeb Cloud (ab-education)

## Текущая инфраструктура
- Сервер: **ab-education**
- IP: **109.68.215.186**
- Ресурсы: 2 CPU, 4 ГБ RAM, 50 ГБ NVMe
- База данных: PostgreSQL (уже установлена)

## Что нужно установить

### 1. Подключитесь к серверу

```bash
ssh root@109.68.215.186
```

### 2. Установите Node.js 20

```bash
# Добавление репозитория NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js
sudo apt-get install -y nodejs

# Проверка
node -v  # Должно показать v20.x.x
npm -v
```

### 3. Установите PM2 (менеджер процессов)

```bash
sudo npm install -g pm2
```

### 4. Создайте директорию проекта

```bash
mkdir -p /var/www/knowledge-api
cd /var/www/knowledge-api
```

### 5. Создайте package.json

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

### 6. Создайте server.js

```bash
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS для работы с poehali.dev
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Подключение к PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false  // Локальное подключение без SSL
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Query endpoint
app.post('/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
    console.log('Query:', query, 'Params:', params);
    
    const result = await pool.query(query, params);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List endpoint
app.post('/list', async (req, res) => {
  try {
    const { table, schema = 'public', limit = 100, offset = 0 } = req.body;
    console.log('List:', table, 'Schema:', schema, 'Limit:', limit);
    
    const query = `SELECT * FROM ${schema}.${table} LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    
    const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table}`;
    const countResult = await pool.query(countQuery);
    
    res.json({ 
      rows: result.rows, 
      count: parseInt(countResult.rows[0].count) 
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoint
app.post('/stats', async (req, res) => {
  try {
    const { schema = 'public' } = req.body;
    console.log('Stats for schema:', schema);
    
    const tablesQuery = `
      SELECT 
        table_name,
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
        console.error(`Error counting ${table.table_name}:`, err.message);
        table.record_count = 0;
      }
    }
    
    res.json({
      tables,
      totalTables: tables.length,
      totalRecords
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Knowledge API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});
EOF
```

### 7. Создайте .env файл

⚠️ **ВАЖНО: Замените на ваши реальные данные!**

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://gen_user:ваш_пароль@localhost:5432/default_db
NODE_ENV=production
PORT=3000
EOF
```

Чтобы узнать правильную строку подключения:
1. Зайдите в панель TimeWeb Cloud
2. Откройте раздел "Базы данных"
3. Скопируйте строку подключения PostgreSQL

### 8. Установите зависимости

```bash
npm install
```

### 9. Запустите сервер через PM2

```bash
# Запуск
pm2 start server.js --name knowledge-api

# Автозапуск при перезагрузке сервера
pm2 save
pm2 startup

# Проверка статуса
pm2 status
pm2 logs knowledge-api
```

### 10. Проверьте работу API

```bash
# Локально на сервере
curl http://localhost:3000/health

# Должен вернуть:
# {"status":"ok","timestamp":"...","database":"connected"}
```

### 11. Настройте Nginx (опционально, для домена и SSL)

Если хотите использовать домен (например api.вашдомен.ru):

```bash
# Установка Nginx
sudo apt-get install -y nginx

# Создание конфигурации
sudo cat > /etc/nginx/sites-available/knowledge-api << 'EOF'
server {
    listen 80;
    server_name 109.68.215.186;  # Или api.вашдомен.ru

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Accept' always;
    }
}
EOF

# Активация
sudo ln -s /etc/nginx/sites-available/knowledge-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 12. Откройте порт в файрволе

```bash
# Если используете Nginx
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Если подключаетесь напрямую к Node.js
sudo ufw allow 3000/tcp
```

## 🔧 Управление сервером

```bash
# Статус
pm2 status

# Логи
pm2 logs knowledge-api

# Перезапуск
pm2 restart knowledge-api

# Остановка
pm2 stop knowledge-api

# Удаление
pm2 delete knowledge-api
```

## 🌐 URL вашего API

После настройки ваш API будет доступен по адресу:
- **С Nginx**: `http://109.68.215.186/health`
- **Напрямую**: `http://109.68.215.186:3000/health`
- **С доменом**: `http://api.вашдомен.ru/health` (если настроили)

## ✅ Следующий шаг

После развертывания API сообщите мне URL, и я обновлю фронтенд для работы с вашим сервером!
