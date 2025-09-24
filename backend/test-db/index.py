import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Простая тестовая функция для проверки подключения к БД
    Args: event с httpMethod, body, queryStringParameters
    Returns: Базовая информация о подключении
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS для всех методов
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Проверяем наличие переменной DATABASE_URL
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'error': 'DATABASE_URL не найден',
                    'available_vars': list(os.environ.keys())
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Попробуем подключиться к БД
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            cursor = conn.cursor()
            
            # Простой SELECT запрос
            schema = 't_p47619579_knowledge_management'
            cursor.execute(f"SELECT COUNT(*) as employee_count FROM {schema}.employees")
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            response_data = {
                'success': True,
                'message': 'Подключение к БД работает',
                'employee_count': result['employee_count'] if result else 0,
                'schema': schema
            }
            
        except Exception as db_error:
            response_data = {
                'success': False,
                'db_error': str(db_error),
                'database_url_prefix': database_url[:50] + '...' if len(database_url) > 50 else database_url
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response_data, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f'Общая ошибка: {str(e)}',
                'event': event
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }