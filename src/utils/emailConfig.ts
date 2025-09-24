// Конфигурация для EmailJS
// Для настройки email-отправки:
// 1. Зарегистрируйтесь на https://www.emailjs.com/
// 2. Создайте email-сервис (Gmail, Outlook и т.д.)
// 3. Создайте email-шаблон
// 4. Замените значения ниже на ваши

export const EMAIL_CONFIG = {
  // Получите на emailjs.com в разделе Account > API Keys
  PUBLIC_KEY: 'your_public_key',
  
  // ID сервиса email (Gmail, Outlook и т.д.)
  SERVICE_ID: 'your_service_id',
  
  // ID шаблона письма
  TEMPLATE_ID: 'your_template_id',
  
  // Включить демо-режим (показывать код в уведомлениях)
  DEMO_MODE: true
};

// Пример шаблона письма для EmailJS:
/*
Тема: Код восстановления пароля - {{company_name}}

Текст письма:
Здравствуйте!

Вы запросили восстановление пароля для системы "{{company_name}}".

Ваш код подтверждения: {{reset_code}}

Код действителен в течение 15 минут.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.

С уважением,
Команда поддержки
*/

export interface EmailTemplateParams {
  to_email: string;
  reset_code: string;
  company_name: string;
  user_name?: string;
}

export const getEmailTemplate = (params: EmailTemplateParams): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Восстановление пароля</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
            .code { font-size: 32px; font-weight: bold; text-align: center; color: #667eea; background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .text { color: #333; line-height: 1.6; margin-bottom: 20px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">КО</div>
                <h1 style="color: #333; margin: 0;">Восстановление пароля</h1>
                <p style="color: #666; margin: 10px 0 0;">${params.company_name}</p>
            </div>
            
            <p class="text">Здравствуйте${params.user_name ? ', ' + params.user_name : ''}!</p>
            
            <p class="text">Вы запросили восстановление пароля для аккаунта <strong>${params.to_email}</strong>.</p>
            
            <p class="text">Ваш код подтверждения:</p>
            
            <div class="code">${params.reset_code}</div>
            
            <p class="text">Введите этот код в форме восстановления пароля. Код действителен в течение 15 минут.</p>
            
            <div class="warning">
                <strong>Внимание!</strong> Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш аккаунт останется в безопасности.
            </div>
            
            <div class="footer">
                <p>С уважением,<br>Команда "${params.company_name}"</p>
                <p style="font-size: 12px; color: #999;">Это автоматическое сообщение, не отвечайте на него.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};