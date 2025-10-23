# Как подключить SQL Server к сайту education.a-b.ru

## Шаг 1: Установи ngrok (бесплатный туннель)

1. Скачай ngrok: https://ngrok.com/download
2. Распакуй в `C:\Server_ab\`
3. Зарегистрируйся на ngrok.com и получи токен
4. Выполни в командной строке:
```bash
ngrok config add-authtoken ТУТ_ТВОЙ_ТОКЕН
```

## Шаг 2: Запусти туннель для SQL Server

### Терминал 1 - SQL Туннель
```bash
cd C:\Server_ab
python sqlserver_tunnel.py
```

Должно появиться:
```
🚀 SQL Server Tunnel запущен!
Туннель слушает на порту: 5001
```

### Терминал 2 - ngrok
```bash
cd C:\Server_ab
ngrok tcp 5001
```

Должно появиться:
```
Forwarding: tcp://0.tcp.ngrok.io:12345 -> localhost:5001
```

**⚠️ ВАЖНО:** Скопируй адрес `0.tcp.ngrok.io` и порт `12345`

## Шаг 3: Отправь мне данные

Напиши в чат:
```
Готово! Вот данные:
Хост: 0.tcp.ngrok.io
Порт: 12345
```

Я создам облачную функцию с этими данными, и сайт заработает!

## Важные замечания

- **Держи ОБА терминала открытыми** (sqlserver_tunnel.py и ngrok)
- При перезапуске ngrok адрес изменится (в бесплатной версии)
- SQL Server должен быть запущен
- Проверь, что SQL Server слушает на порту 1433:
  - SQL Server Configuration Manager
  - SQL Server Network Configuration
  - Protocols for MSSQLSERVER
  - TCP/IP = Enabled, Port = 1433

## Проверка работы

Если всё работает, ты увидишь:
- В `sqlserver_tunnel.py`: "Новое подключение от..."
- В `ngrok`: запросы в разделе "HTTP Requests"

## Альтернатива (если ngrok не работает)

Используй Cloudflare Tunnel (бесплатно навсегда):
```bash
cloudflared tunnel --url tcp://localhost:5001
```
