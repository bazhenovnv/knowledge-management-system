import json
import os
import psycopg2
import hashlib
import secrets
import string
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

def get_db_connection():
    """Получает подключение к базе данных"""
    try:
        database_url = os.environ.get('EXTERNAL_DATABASE_URL')
        if not database_url:
            raise Exception("EXTERNAL_DATABASE_URL не настроен")
        
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def generate_reset_code() -> str:
    """Генерирует 6-значный код восстановления"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def generate_reset_token() -> str:
    """Генерирует токен для сброса пароля"""
    return secrets.token_urlsafe(32)

def hash_password(password: str) -> str:
    """Хеширует пароль с солью"""
    import bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def cleanup_old_codes(conn, email: str) -> None:
    """Удаляет старые неиспользованные коды для email"""
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE password_reset_codes SET is_used = true WHERE email = %s AND is_used = false",
            (email,)
        )

def check_user_exists(conn, email: str) -> bool:
    """Проверяет, существует ли пользователь с данным email"""
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM employees WHERE email = %s AND is_active = true",
            (email,)
        )
        return cursor.fetchone()[0] > 0

def create_reset_code(conn, email: str) -> Tuple[str, datetime]:
    """Создает новый код восстановления"""
    code = generate_reset_code()
    expires_at = datetime.now() + timedelta(minutes=15)
    
    # Деактивируем старые коды
    cleanup_old_codes(conn, email)
    
    # Создаем новый код
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO password_reset_codes (email, code, expires_at)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (email, code, expires_at))
        
        reset_id = cursor.fetchone()[0]
        print(f"Created reset code {reset_id} for {email}")
    
    return code, expires_at

def verify_reset_code(conn, email: str, code: str) -> Optional[str]:
    """Проверяет код и возвращает токен сброса"""
    with conn.cursor() as cursor:
        # Получаем активный код
        cursor.execute("""
            SELECT id, attempts, expires_at, is_verified, is_used
            FROM password_reset_codes
            WHERE email = %s AND code = %s AND is_used = false
            ORDER BY created_at DESC
            LIMIT 1
        """, (email, code))
        
        result = cursor.fetchone()
        if not result:
            return None
        
        reset_id, attempts, expires_at, is_verified, is_used = result
        
        # Проверяем срок действия
        if datetime.now() > expires_at:
            cursor.execute(
                "UPDATE password_reset_codes SET is_used = true WHERE id = %s",
                (reset_id,)
            )
            return None
        
        # Проверяем количество попыток
        if attempts >= 3:
            cursor.execute(
                "UPDATE password_reset_codes SET is_used = true WHERE id = %s",
                (reset_id,)
            )
            return None
        
        # Если код уже проверен, возвращаем существующий токен
        if is_verified:
            cursor.execute(
                "SELECT reset_token FROM password_reset_codes WHERE id = %s",
                (reset_id,)
            )
            return cursor.fetchone()[0]
        
        # Генерируем токен и отмечаем как проверенный
        reset_token = generate_reset_token()
        cursor.execute("""
            UPDATE password_reset_codes 
            SET reset_token = %s, is_verified = true, attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (reset_token, reset_id))
        
        return reset_token

def increment_attempts(conn, email: str, code: str) -> int:
    """Увеличивает счетчик попыток и возвращает текущее количество"""
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE password_reset_codes 
            SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
            WHERE email = %s AND code = %s AND is_used = false
            RETURNING attempts
        """, (email, code))
        
        result = cursor.fetchone()
        return result[0] if result else 3

def reset_user_password(conn, email: str, reset_token: str, new_password: str) -> bool:
    """Сбрасывает пароль пользователя"""
    with conn.cursor() as cursor:
        # Проверяем валидность токена
        cursor.execute("""
            SELECT id FROM password_reset_codes
            WHERE email = %s AND reset_token = %s AND is_verified = true AND is_used = false
            AND expires_at > CURRENT_TIMESTAMP
        """, (email, reset_token))
        
        result = cursor.fetchone()
        if not result:
            return False
        
        reset_id = result[0]
        
        # Хешируем новый пароль
        password_hash = hash_password(new_password)
        
        # Обновляем пароль пользователя
        cursor.execute("""
            UPDATE employees 
            SET password_hash = %s, last_password_reset = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE email = %s
        """, (password_hash, email))
        
        # Отмечаем код как использованный
        cursor.execute("""
            UPDATE password_reset_codes 
            SET is_used = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (reset_id,))
        
        return True

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для восстановления пароля с базой данных
    Действия: send_code, verify_code, reset_password
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
        
        # Подключаемся к базе данных
        conn = get_db_connection()
        
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
            
            # Проверяем, существует ли пользователь
            if not check_user_exists(conn, email):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email не найден'})
                }
            
            # Создаем код восстановления
            code, expires_at = create_reset_code(conn, email)
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Код отправлен на ваш email',
                    'email': email,
                    'demo_code': code,  # Для демонстрации
                    'expires_at': expires_at.isoformat()
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
            reset_token = verify_reset_code(conn, email, code)
            
            if reset_token:
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
                # Увеличиваем счетчик попыток
                attempts = increment_attempts(conn, email, code)
                attempts_left = max(0, 3 - attempts)
                
                if attempts_left == 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Превышено количество попыток'})
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'error': 'Неверный код или код истек',
                            'attempts_left': attempts_left
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
            
            # Сбрасываем пароль
            success = reset_user_password(conn, email, reset_token, new_password)
            
            if success:
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
                    'body': json.dumps({'error': 'Неверный токен сброса или токен истек'})
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
    finally:
        try:
            conn.close()
        except:
            pass