# Деплой на сервер ab-education.ru

## Первоначальная настройка сервера (выполняется один раз)

```bash
# Делаем скрипты исполняемыми
chmod +x server-setup.sh deploy-to-server.sh

# Настраиваем сервер
./server-setup.sh
```

Этот скрипт:
- Загружает правильный nginx конфиг на сервер
- Удаляет старые конфиги giftbox
- Настраивает проксирование /api/ на Cloud Functions
- Перезапускает nginx

## Деплой новой версии

```bash
# Собрать и задеплоить на сервер
./deploy-to-server.sh
```

Этот скрипт:
1. Собирает production билд (`npm run build`)
2. Создает архив dist.tar.gz
3. Загружает на сервер
4. Делает бэкап старой версии
5. Разворачивает новую версию
6. Устанавливает правильные права

## Ручной деплой

Если нужно сделать вручную:

```bash
# 1. Соберите production билд
npm run build

# 2. Создайте архив
tar -czf dist.tar.gz -C dist .

# 3. Загрузите на сервер
scp dist.tar.gz root@6152655-mg709640.tw1.ru:/tmp/

# 4. На сервере выполните:
ssh root@6152655-mg709640.tw1.ru

# Бэкап
cd /var/www/giftbox
rm -rf dist.old
mv dist dist.old

# Распаковка
mkdir -p dist
tar -xzf /tmp/dist.tar.gz -C dist

# Права
chown -R www-data:www-data dist
chmod -R 755 dist

# Очистка
rm /tmp/dist.tar.gz
```

## Структура на сервере

```
/var/www/giftbox/
├── dist/           # Текущая версия сайта
├── dist.old/       # Бэкап предыдущей версии
└── dist.backup/    # Старый бэкап (можно удалить)

/etc/nginx/sites-available/
└── ab-education.ru  # Конфиг nginx

/etc/nginx/sites-enabled/
└── ab-education.ru  # Symlink на конфиг
```

## Откат к предыдущей версии

Если что-то пошло не так:

```bash
ssh root@6152655-mg709640.tw1.ru
cd /var/www/giftbox
rm -rf dist
mv dist.old dist
systemctl reload nginx
```

## Проверка работы

После деплоя откройте:
- http://ab-education.ru - основной сайт
- http://ab-education.ru/api/auth - проверка API (должен вернуть 404 или ответ от Cloud Functions)

## Важные настройки

### API Gateway URL
Все `/api/*` запросы проксируются на:
```
https://d5dg4veem6hdahn1ohgk.apigw.yandexcloud.net
```

### Environment Variables
Production переменные в `.env.production`:
- `VITE_API_URL=/api` - локальный путь к API
- Остальные URL указывают на Cloud Functions

## Troubleshooting

### Ошибка 405 или 426
- Проверьте nginx конфиг: `nginx -T | grep -A 30 "ab-education.ru"`
- Убедитесь, что proxy_pass использует HTTPS
- Перезагрузите nginx: `systemctl reload nginx`

### Файлы не обновляются
- Очистите кэш браузера: Ctrl+Shift+R
- Проверьте права: `ls -la /var/www/giftbox/dist`
- Должны быть: `drwxr-xr-x www-data www-data`

### API не работает
- Проверьте логи nginx: `tail -f /var/log/nginx/error.log`
- Проверьте доступность Cloud Functions
- Убедитесь, что в nginx.conf есть location /api/
