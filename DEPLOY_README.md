# 🚀 Развертывание на собственном сервере TimeWeb Cloud

## Ваша инфраструктура

- **Сервер**: ab-education (109.68.215.186)
- **Backend**: Node.js + Express (порт 3000)
- **Frontend**: React + Vite (Nginx)
- **База данных**: PostgreSQL

---

## 📋 Быстрый старт

### Вариант 1: Автоматическое развертывание (рекомендуется)

1. Откройте файл `DEPLOY_FULL_STACK.md` - следуйте инструкциям по настройке сервера
2. После настройки сервера, запустите скрипт развертывания:

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите развертывание
./deploy.sh
```

Скрипт автоматически:
- ✅ Соберет production билд
- ✅ Загрузит файлы на сервер
- ✅ Настроит права доступа
- ✅ Перезапустит Nginx

### Вариант 2: Ручное развертывание

См. подробную инструкцию в файле `DEPLOY_FULL_STACK.md`

---

## 🔧 Структура проекта после развертывания

На сервере будет следующая структура:

```
/var/www/
├── knowledge-api/          # Backend API
│   ├── server.js
│   ├── package.json
│   ├── .env               # Настройки БД
│   └── node_modules/
│
└── knowledge-frontend/     # Frontend
    └── dist/              # Собранный билд React
        ├── index.html
        ├── assets/
        └── ...
```

---

## 🌐 URL после развертывания

- **Фронтенд**: http://109.68.215.186
- **API Health**: http://109.68.215.186/api/health
- **API Query**: http://109.68.215.186/api/query
- **API List**: http://109.68.215.186/api/list
- **API Stats**: http://109.68.215.186/api/stats

---

## 🔄 Обновление приложения

### Обновление Frontend

```bash
# На вашем локальном компьютере
./deploy.sh
```

### Обновление Backend

```bash
# Подключитесь к серверу
ssh root@109.68.215.186

# Перейдите в директорию API
cd /var/www/knowledge-api

# Внесите изменения в код (через nano или vim)
nano server.js

# Перезапустите API
pm2 restart knowledge-api
```

---

## 📊 Мониторинг

### Проверка статуса сервисов

```bash
# Backend API
pm2 status
pm2 logs knowledge-api

# Nginx
systemctl status nginx

# PostgreSQL
systemctl status postgresql
```

### Логи

```bash
# Backend API логи
pm2 logs knowledge-api --lines 100

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🛠️ Troubleshooting

### Проблема: Приложение не открывается

```bash
# Проверьте Nginx
systemctl status nginx
nginx -t

# Проверьте что файлы на месте
ls -la /var/www/knowledge-frontend/dist
```

### Проблема: API не отвечает

```bash
# Проверьте статус API
pm2 status

# Посмотрите логи
pm2 logs knowledge-api

# Проверьте подключение к БД
curl http://localhost:3000/api/health
```

### Проблема: CORS ошибки

Проверьте что в `server.js` есть:

```javascript
app.use(cors({ origin: '*' }));
```

---

## 🔐 Безопасность

### Рекомендации:

1. **Смените пароль PostgreSQL**
   ```bash
   sudo -u postgres psql
   \password ваш_пользователь
   ```

2. **Настройте файрвол**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

3. **Установите SSL сертификат**
   ```bash
   certbot --nginx -d ваш-домен.ru
   ```

4. **Настройте автоматические обновления**
   ```bash
   apt install unattended-upgrades
   dpkg-reconfigure --priority=low unattended-upgrades
   ```

---

## 📦 Backup базы данных

### Создание backup

```bash
# Автоматический backup
pg_dump -U ваш_user ваша_база > /backups/db_$(date +%Y%m%d).sql

# Создание cron задачи для ежедневного backup
crontab -e
# Добавьте строку:
0 2 * * * pg_dump -U ваш_user ваша_база > /backups/db_$(date +\%Y\%m\%d).sql
```

### Восстановление из backup

```bash
psql -U ваш_user ваша_база < /backups/db_20250101.sql
```

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи (см. раздел "Мониторинг")
2. Убедитесь что все сервисы запущены
3. Проверьте подключение к БД
4. Проверьте права доступа к файлам

---

## ✅ Чеклист после развертывания

- [ ] Backend API запущен и отвечает на `/api/health`
- [ ] Nginx раздает фронтенд
- [ ] База данных подключена и работает
- [ ] SSL сертификат установлен (опционально)
- [ ] Файрвол настроен
- [ ] Backup настроен
- [ ] Приложение доступно по IP/домену

---

## 🎉 Готово!

Теперь у вас полностью независимое приложение на собственном сервере!

**Следующие шаги:**
1. Привяжите домен к IP 109.68.215.186
2. Установите SSL сертификат
3. Настройте мониторинг
4. Настройте автоматические бэкапы
