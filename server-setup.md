# Развертывание Backend на TimeWeb Cloud VPS

## 1. Подключитесь к серверу через SSH

```bash
ssh root@ваш-ip-адрес
```

## 2. Установите Node.js (если еще не установлен)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Проверка установки
```

## 3. Установите PM2 для управления процессами

```bash
sudo npm install -g pm2
```

## 4. Создайте директорию для проекта

```bash
mkdir -p /var/www/knowledge-api
cd /var/www/knowledge-api
```

## 5. Создайте файл package.json

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

## 6. Создайте файл server.js

```bash
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Query endpoint
app.post('/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
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
    
    for (let table of tables) {
      const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table.table_name}`;
      const countResult = await pool.query(countQuery);
      table.record_count = parseInt(countResult.rows[0].count);
    }
    
    const totalRecords = tables.reduce((sum, t) => sum + t.record_count, 0);
    
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
  console.log(`API Server running on port ${PORT}`);
});
EOF
```

## 7. Создайте файл .env с настройками базы данных

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://ваш_юзер:ваш_пароль@localhost:5432/ваша_база
NODE_ENV=production
PORT=3000
EOF
```

⚠️ **Замените DATABASE_URL на ваши реальные данные!**

## 8. Установите зависимости

```bash
npm install
```

## 9. Запустите сервер через PM2

```bash
pm2 start server.js --name knowledge-api
pm2 save
pm2 startup  # Автозапуск при перезагрузке сервера
```

## 10. Настройте Nginx как reverse proxy

```bash
sudo apt-get install -y nginx

cat > /etc/nginx/sites-available/knowledge-api << 'EOF'
server {
    listen 80;
    server_name api.ваш-домен.ru;  # Замените на ваш домен!

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
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/knowledge-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 11. Установите SSL сертификат (опционально, но рекомендуется)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.ваш-домен.ru
```

## 12. Проверка работы

```bash
# Проверка здоровья
curl http://localhost:3000/health

# Если настроили Nginx
curl http://api.ваш-домен.ru/health
```

## Управление сервером

```bash
pm2 status              # Статус процессов
pm2 logs knowledge-api  # Логи
pm2 restart knowledge-api  # Перезапуск
pm2 stop knowledge-api  # Остановка
```

## После развертывания

Обновите `src/services/externalDbService.ts` в вашем фронтенде:

```typescript
const EXTERNAL_DB_URL = 'https://api.ваш-домен.ru';
```

И измените запросы с `/query`, `/list`, `/stats` вместо одного эндпоинта.
