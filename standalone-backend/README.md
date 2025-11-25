# 🚀 Standalone Backend API для управления базой данных

Это твой собственный Flask API сервер, который можно разместить на **любом хостинге** без ограничений.

## 📋 Что это даёт?

- ✅ Полный контроль над backend
- ✅ Никаких лимитов на количество запросов
- ✅ Подключение к твоей базе данных Timeweb Cloud
- ✅ Все функции CRUD для управления сотрудниками
- ✅ Можно размещать где угодно: Timeweb, Beget, DigitalOcean, AWS, VPS

---

## 🛠 Установка и запуск

### Локально (для тестирования)

1. **Установи зависимости:**
```bash
pip install -r requirements.txt
```

2. **Запусти сервер:**
```bash
python app.py
```

Сервер запустится на `http://localhost:8000`

3. **Проверь работу:**
```bash
curl http://localhost:8000/health
```

---

## 🌐 Размещение на хостинге

### Вариант 1: Timeweb Cloud (Рекомендую)

1. Зайди в панель Timeweb Cloud
2. Создай новое приложение Python
3. Загрузи файлы: `app.py`, `requirements.txt`
4. Укажи команду запуска:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```
5. Получи URL своего API (например, `https://твой-домен.timeweb.cloud`)

### Вариант 2: Любой VPS (Ubuntu/Debian)

1. Подключись к серверу по SSH
2. Установи Python и зависимости:
```bash
sudo apt update
sudo apt install python3 python3-pip -y
cd /var/www
git clone <твой-репозиторий>
cd standalone-backend
pip3 install -r requirements.txt
```

3. Настрой systemd сервис:
```bash
sudo nano /etc/systemd/system/api.service
```

Содержимое файла:
```ini
[Unit]
Description=Flask API Server
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/standalone-backend
ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

4. Запусти сервис:
```bash
sudo systemctl enable api
sudo systemctl start api
sudo systemctl status api
```

5. Настрой Nginx как прокси:
```nginx
server {
    listen 80;
    server_name твой-домен.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Вариант 3: Docker

1. Создай `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

2. Собери и запусти:
```bash
docker build -t my-api .
docker run -d -p 8000:8000 my-api
```

---

## 🔗 Подключение к проекту poehali.dev

После того как разместишь API на хостинге:

1. **Получи URL своего API** (например, `https://api.твой-домен.com`)

2. **Обнови проект в poehali.dev:**
   - Открой файл `.env` (или создай его)
   - Добавь строку:
   ```
   VITE_EXTERNAL_DB_URL=https://api.твой-домен.com
   ```

3. **Пересобери проект** в poehali.dev

Всё! Теперь твой сайт будет использовать твой собственный backend.

---

## 📡 API Endpoints

### `POST /` - Главный endpoint

**Примеры запросов:**

#### Получить всех сотрудников
```bash
curl -X POST https://api.твой-домен.com \
  -H "Content-Type: application/json" \
  -d '{
    "action": "query",
    "query": "SELECT * FROM t_p47619579_knowledge_management.employees WHERE is_active = true"
  }'
```

#### Добавить сотрудника
```bash
curl -X POST https://api.твой-домен.com \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "table": "employees",
    "data": {
      "full_name": "Иван Иванов",
      "email": "ivan@example.com",
      "password": "password123",
      "position": "Менеджер",
      "department": "Продажи",
      "role": "employee"
    }
  }'
```

#### Обновить сотрудника
```bash
curl -X POST https://api.твой-домен.com \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "table": "employees",
    "id": 1,
    "data": {
      "position": "Старший менеджер",
      "department": "Продажи"
    }
  }'
```

#### Удалить сотрудника (мягкое)
```bash
curl -X POST https://api.твой-домен.com \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "table": "employees",
    "id": 1
  }'
```

#### Получить статистику базы данных
```bash
curl -X POST https://api.твой-домен.com \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stats",
    "schema": "t_p47619579_knowledge_management"
  }'
```

### `GET /health` - Проверка здоровья API

```bash
curl https://api.твой-домен.com/health
```

Ответ:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🔒 Безопасность (ВАЖНО!)

### 1. Не храни пароли в коде!

Создай файл `.env`:
```env
DB_HOST=c6b7ae5ab8e72b5408272e27.twc1.net
DB_PORT=5432
DB_NAME=default_db
DB_USER=gen_user
DB_PASSWORD=TC>o0yl2J_PR(e
```

Обнови `app.py`:
```python
from dotenv import load_dotenv
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD')
}
```

Установи python-dotenv:
```bash
pip install python-dotenv
```

### 2. Настрой HTTPS

Используй Let's Encrypt + Nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.твой-домен.com
```

### 3. Ограничь CORS (опционально)

В `app.py` замени:
```python
CORS(app)  # Разрешаем всем
```

На:
```python
CORS(app, origins=['https://твой-сайт.com'])  # Только для твоего сайта
```

---

## 📊 Мониторинг и логи

### Просмотр логов (если используешь systemd):
```bash
sudo journalctl -u api -f
```

### Просмотр логов (если используешь Docker):
```bash
docker logs -f <container-id>
```

---

## ❓ Частые проблемы

### Ошибка подключения к базе данных
- Проверь, что IP сервера добавлен в белый список Timeweb Cloud
- Убедись, что SSL сертификат скачивается корректно

### Ошибка CORS
- Убедись, что `flask-cors` установлен
- Проверь настройки CORS в `app.py`

### Низкая производительность
- Увеличь количество воркеров gunicorn: `-w 8`
- Настрой connection pooling для PostgreSQL
- Используй Redis для кэширования

---

## 🆘 Поддержка

Если что-то не работает:
1. Проверь логи: `sudo journalctl -u api -f`
2. Проверь статус: `sudo systemctl status api`
3. Проверь здоровье API: `curl http://localhost:8000/health`

---

## 📝 Что дальше?

После размещения backend:
1. Получи URL своего API
2. Обнови переменную `VITE_EXTERNAL_DB_URL` в проекте poehali.dev
3. Пересобери проект
4. Наслаждайся работой без лимитов! 🎉
