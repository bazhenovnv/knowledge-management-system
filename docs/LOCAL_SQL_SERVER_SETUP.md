# 🔌 Подключение облачных функций к локальному SQL Server

## 📋 Что нужно сделать

1. **Импортировать базу данных в SQL Server**
2. **Настроить удалённый доступ к SQL Server**
3. **Создать секрет с connection string**
4. **Создать облачную функцию для работы с БД**

---

## 1️⃣ Импорт базы данных

### Шаг 1: Откройте SQL Server Management Studio (SSMS)

### Шаг 2: Выполните скрипт
1. Откройте файл `export_to_sqlserver.sql`
2. Нажмите **F5** или кнопку **Execute**
3. Дождитесь завершения импорта

✅ **Результат:** База данных создана со всеми таблицами и данными

---

## 2️⃣ Настройка удалённого доступа к SQL Server

### Вариант A: SQL Server в локальной сети (простой, но менее безопасный)

#### 1. Включите TCP/IP протокол
```
SQL Server Configuration Manager → 
SQL Server Network Configuration → 
Protocols for MSSQLSERVER → 
TCP/IP → Enable
```

#### 2. Настройте порт (по умолчанию 1433)
```
TCP/IP → Properties → IP Addresses → 
IPAll → TCP Port: 1433
```

#### 3. Перезапустите SQL Server
```
Services → SQL Server (MSSQLSERVER) → Restart
```

#### 4. Создайте пользователя для подключения
```sql
-- В SSMS выполните:
CREATE LOGIN cloud_functions_user WITH PASSWORD = 'YourStrongPassword123!';
GO

USE t_p47619579_knowledge_management;
GO

CREATE USER cloud_functions_user FOR LOGIN cloud_functions_user;
GO

-- Дайте права на чтение/запись
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::t_p47619579_knowledge_management TO cloud_functions_user;
GO
```

#### 5. Откройте порт в Windows Firewall
```
Windows Defender Firewall → 
Advanced Settings → 
Inbound Rules → 
New Rule → 
Port → TCP → 1433 → 
Allow the connection
```

#### 6. Узнайте ваш внешний IP-адрес
- Перейдите на https://whatismyipaddress.com/
- Скопируйте ваш IPv4 адрес

⚠️ **Важно:** Если у вас динамический IP, используйте сервис DynDNS или рассмотрите Вариант B

---

### Вариант B: SQL Server через VPN туннель (рекомендуется)

Используйте **ngrok** для безопасного туннелирования:

#### 1. Установите ngrok
- Скачайте с https://ngrok.com/download
- Распакуйте в любую папку

#### 2. Зарегистрируйтесь и получите токен
- https://dashboard.ngrok.com/signup
- Скопируйте ваш authtoken

#### 3. Настройте ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 4. Запустите туннель для SQL Server
```bash
ngrok tcp 1433
```

#### 5. Скопируйте URL туннеля
Вы увидите что-то вроде:
```
Forwarding: tcp://0.tcp.ngrok.io:12345 -> localhost:1433
```

Сохраните: `0.tcp.ngrok.io:12345` - это ваш внешний адрес SQL Server

✅ **Преимущества:** 
- Безопасное подключение
- Не нужно открывать порты
- Работает с динамическим IP

---

## 3️⃣ Создание секрета с connection string

### Формат connection string для SQL Server

**Для варианта A (прямое подключение):**
```
Server=YOUR_IP_ADDRESS,1433;Database=t_p47619579_knowledge_management;User Id=cloud_functions_user;Password=YourStrongPassword123!;Encrypt=false;TrustServerCertificate=true;
```

**Для варианта B (ngrok туннель):**
```
Server=0.tcp.ngrok.io,12345;Database=t_p47619579_knowledge_management;User Id=cloud_functions_user;Password=YourStrongPassword123!;Encrypt=false;TrustServerCertificate=true;
```

### Замените значения:
- `YOUR_IP_ADDRESS` → ваш внешний IP (из шага 2.A.6)
- `0.tcp.ngrok.io,12345` → адрес из ngrok (из шага 2.B.5)
- `cloud_functions_user` → имя пользователя SQL
- `YourStrongPassword123!` → пароль пользователя SQL

---

## 4️⃣ Добавление секрета в poehali.dev

### В чате с Юрой напишите:
```
Добавь секрет SQL_SERVER_CONNECTION_STRING
```

Юра создаст секрет, и вы сможете добавить connection string через UI.

---

## 5️⃣ Пример облачной функции для работы с SQL Server

После добавления секрета, попросите Юру создать функцию:

```
Создай функцию для получения списка сотрудников из SQL Server
```

Юра автоматически создаст функцию, которая:
- Подключится к вашему SQL Server
- Выполнит SQL запросы
- Вернёт данные в JSON формате

---

## 🔐 Безопасность

### ✅ Рекомендации:
1. Используйте **сложные пароли** для SQL пользователя
2. Предпочитайте **ngrok туннель** вместо прямого доступа
3. Ограничьте права пользователя только нужными таблицами
4. Используйте **SSL/TLS** шифрование (для продакшена)

### ⚠️ Не рекомендуется:
- Использовать `sa` (admin) аккаунт
- Открывать SQL Server напрямую в интернет без VPN
- Хранить connection string в коде

---

## 📊 Проверка подключения

### Тест подключения в SSMS:
```sql
-- Проверьте, что пользователь может читать данные
SELECT * FROM t_p47619579_knowledge_management.employees;
```

### Тест из облачной функции:
После создания функции, Юра автоматически протестирует подключение и вернёт результат.

---

## 🆘 Решение проблем

### Ошибка: "Login failed for user"
- Проверьте правильность пароля
- Убедитесь, что пользователь создан в базе

### Ошибка: "Cannot connect to server"
- Проверьте, что SQL Server запущен
- Убедитесь, что TCP/IP включён
- Проверьте firewall правила
- Для ngrok: убедитесь, что туннель активен

### Ошибка: "Connection timeout"
- Проверьте правильность IP адреса или ngrok URL
- Проверьте порт (1433 или ngrok порт)

---

## 📞 Нужна помощь?

Напишите Юре:
- "Создай тестовую функцию для проверки SQL Server"
- "Покажи пример запроса к SQL Server"
- "Не могу подключиться к SQL Server"

Юра поможет настроить и отладить подключение! 🚀
