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
        
        # Обрабатываем разные действия
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'test')
        
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            cursor = conn.cursor()
            schema = 't_p47619579_knowledge_management'
            
            if action == 'list' and params.get('table') == 'employees':
                cursor.execute(f"SELECT * FROM {schema}.employees ORDER BY id")
                employees = cursor.fetchall()
                response_data = {
                    'data': [dict(emp) for emp in employees],
                    'count': len(employees)
                }
                
            elif action == 'stats':
                # Получаем статистику
                cursor.execute(f"SELECT COUNT(*) as active FROM {schema}.employees WHERE is_active = true")
                active_emp = cursor.fetchone()['active']
                
                cursor.execute(f"SELECT COUNT(*) as inactive FROM {schema}.employees WHERE is_active = false")
                inactive_emp = cursor.fetchone()['inactive']
                
                cursor.execute(f"SELECT COUNT(*) as active FROM {schema}.courses WHERE status = 'active'")
                active_courses = cursor.fetchone()['active']
                
                cursor.execute(f"SELECT COUNT(*) FROM {schema}.course_enrollments")
                enrollments = cursor.fetchone()['count']
                
                cursor.execute(f"SELECT COUNT(*) FROM {schema}.attendance")
                attendance = cursor.fetchone()['count']
                
                response_data = {
                    'stats': {
                        'active_employees': active_emp,
                        'inactive_employees': inactive_emp,
                        'active_courses': active_courses,
                        'total_enrollments': enrollments,
                        'total_attendance': attendance
                    }
                }
                
            else:
                # Базовый тест подключения
                cursor.execute(f"SELECT COUNT(*) as employee_count FROM {schema}.employees")
                result = cursor.fetchone()
                
                response_data = {
                    'success': True,
                    'message': 'Подключение к БД работает',
                    'employee_count': result['employee_count'] if result else 0,
                    'schema': schema
                }
            
            cursor.close()
            conn.close()
            
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