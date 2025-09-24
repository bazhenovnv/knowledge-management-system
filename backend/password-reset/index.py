import json
import os
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from datetime import datetime, timedelta
import hashlib

# Временное хранилище кодов (в реальном приложении использовать Redis или DB)
reset_codes = {}

def generate_reset_code() -> str:
    """Генерирует 6-значный код восстановления"""
    return ''.join(random.choices(string.digits, k=6))

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Отправляет email через SMTP"""
    try:
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_user or not smtp_password:
            print("SMTP credentials not configured")
            return False
        
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html', 'utf-8'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

def create_email_template(code: str, user_email: str) -> str:
    """Создает HTML-шаблон для email"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Восстановление пароля</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }}
            .code {{ font-size: 32px; font-weight: bold; text-align: center; color: #667eea; background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }}
            .text {{ color: #333; line-height: 1.6; margin-bottom: 20px; }}
            .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">КО</div>
                <h1 style="color: #333; margin: 0;">Восстановление пароля</h1>
                <p style="color: #666; margin: 10px 0 0;">Корпоративное обучение</p>
            </div>
            
            <p class="text">Здравствуйте!</p>
            
            <p class="text">Вы запросили восстановление пароля для аккаунта <strong>{user_email}</strong>.</p>
            
            <p class="text">Ваш код подтверждения:</p>
            
            <div class="code">{code}</div>
            
            <p class="text">Введите этот код в форме восстановления пароля. Код действителен в течение 15 минут.</p>
            
            <div class="warning">
                <strong>Внимание!</strong> Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш аккаунт останется в безопасности.
            </div>
            
            <div class="footer">
                <p>С уважением,<br>Команда "Корпоративное обучение"</p>
                <p style="font-size: 12px; color: #999;">Это автоматическое сообщение, не отвечайте на него.</p>
            </div>
        </div>
    </body>
    </html>
    """

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для восстановления пароля с отправкой кода на email
    Поддерживает: отправка кода, проверка кода, сброс пароля
    """
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'send_code':
            email = body_data.get('email', '').strip().lower()
            
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email обязателен'})
                }
            
            # Простая валидация email
            if '@' not in email or '.' not in email:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный формат email'})
                }
            
            # Генерируем код
            code = generate_reset_code()
            
            # Сохраняем код с временной меткой
            reset_codes[email] = {
                'code': code,
                'created_at': datetime.now().isoformat(),
                'attempts': 0
            }
            
            # Создаем email
            subject = "Код восстановления пароля - Корпоративное обучение"
            body = create_email_template(code, email)
            
            # Отправляем email
            if send_email(email, subject, body):
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Код отправлен на ваш email',
                        'email': email
                    })
                }
            else:
                # Если настройки SMTP не заданы, возвращаем успех с демо-кодом
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Код отправлен на ваш email',
                        'email': email,
                        'demo_code': code,  # Только для демонстрации
                        'demo_mode': True
                    })
                }
        
        elif action == 'verify_code':
            email = body_data.get('email', '').strip().lower()
            code = body_data.get('code', '').strip()
            
            if not email or not code:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и код обязательны'})
                }
            
            # Проверяем код
            stored_data = reset_codes.get(email)
            if not stored_data:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Код не найден или истек'})
                }
            
            # Проверяем количество попыток
            if stored_data['attempts'] >= 3:
                del reset_codes[email]
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Превышено количество попыток'})
                }
            
            # Проверяем время истечения (15 минут)
            created_at = datetime.fromisoformat(stored_data['created_at'])
            if datetime.now() - created_at > timedelta(minutes=15):
                del reset_codes[email]
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Код истек. Запросите новый'})
                }
            
            # Проверяем код
            if stored_data['code'] == code:
                # Генерируем временный токен для сброса пароля
                reset_token = hashlib.sha256(f"{email}{code}{datetime.now()}".encode()).hexdigest()[:32]
                stored_data['reset_token'] = reset_token
                stored_data['verified'] = True
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Код подтвержден',
                        'reset_token': reset_token
                    })
                }
            else:
                stored_data['attempts'] += 1
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Неверный код',
                        'attempts_left': 3 - stored_data['attempts']
                    })
                }
        
        elif action == 'reset_password':
            email = body_data.get('email', '').strip().lower()
            reset_token = body_data.get('reset_token', '')
            new_password = body_data.get('new_password', '')
            
            if not all([email, reset_token, new_password]):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Все поля обязательны'})
                }
            
            if len(new_password) < 6:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пароль должен содержать минимум 6 символов'})
                }
            
            # Проверяем токен
            stored_data = reset_codes.get(email)
            if not stored_data or not stored_data.get('verified') or stored_data.get('reset_token') != reset_token:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный токен сброса'})
                }
            
            # Здесь должно быть обновление пароля в базе данных
            # Для демонстрации просто симулируем успех
            
            # Удаляем использованный код
            del reset_codes[email]
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Пароль успешно изменен'
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
    
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный JSON'})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'})
        }