# 📧 Настройка Email для восстановления пароля

## Быстрый старт

Система восстановления пароля работает в демо-режиме. Для настройки реальной отправки email выполните следующие шаги:

## 1. Регистрация в EmailJS

1. Перейдите на https://www.emailjs.com/
2. Создайте бесплатный аккаунт
3. Подтвердите email

## 2. Настройка email-сервиса

1. В панели EmailJS нажмите **"Add New Service"**
2. Выберите ваш email-провайдер:
   - **Gmail** - самый простой вариант
   - **Outlook/Hotmail**
   - **Yahoo**
   - Или любой другой SMTP
3. Следуйте инструкциям для подключения

## 3. Создание шаблона письма

1. Нажмите **"Create New Template"**
2. Настройте шаблон:

**Тема письма:**
```
Код восстановления пароля - {{company_name}}
```

**Текст письма:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .code { font-size: 32px; font-weight: bold; text-align: center; color: #667eea; background: #f8f9ff; padding: 20px; border-radius: 8px; letter-spacing: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Восстановление пароля</h1>
        <p>Здравствуйте!</p>
        <p>Ваш код подтверждения:</p>
        <div class="code">{{reset_code}}</div>
        <p>Код действителен 15 минут.</p>
        <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
    </div>
</body>
</html>
```

3. Сохраните шаблон

## 4. Получение API ключей

1. Перейдите в **"Account" → "API Keys"**
2. Скопируйте **Public Key**
3. В разделе **"Email Services"** скопируйте **Service ID**  
4. В разделе **"Email Templates"** скопируйте **Template ID**

## 5. Настройка в коде

Откройте файл `src/utils/emailConfig.ts` и замените:

```typescript
export const EMAIL_CONFIG = {
  PUBLIC_KEY: 'your_actual_public_key',      // Ваш Public Key
  SERVICE_ID: 'your_actual_service_id',      // Service ID  
  TEMPLATE_ID: 'your_actual_template_id',    // Template ID
  DEMO_MODE: false                           // Отключить демо-режим
};
```

## 6. Тестирование

1. Перезагрузите приложение
2. Попробуйте восстановить пароль
3. Проверьте почту (включая спам)

## Демо-режим

По умолчанию включен демо-режим:
- Email не отправляется
- Код показывается в уведомлении
- Для теста используйте код: **123456**

## Лимиты бесплатного плана

- EmailJS: 200 писем/месяц
- Для больших объемов рассмотрите платный план

## Безопасность

✅ **Что безопасно:**
- Public Key в коде (он предназначен для frontend)
- Service ID и Template ID в коде

❌ **Что НЕ размещать в коде:**
- Пароли от email
- Private API ключи
- SMTP пароли

## Альтернативы EmailJS

Для продакшена рассмотрите:
- **SendGrid** - до 100 писем/день бесплатно
- **Mailgun** - до 5,000 писем/месяц
- **AWS SES** - $0.10 за 1,000 писем
- **Resend** - 3,000 писем/месяц бесплатно

## Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что API ключи правильные
3. Проверьте настройки email-сервиса в EmailJS
4. Попробуйте отправить тестовое письмо через панель EmailJS