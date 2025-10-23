"""
Business: API для работы с SQL Server базой данных через туннель
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: JSON ответ с данными из БД
"""

import json
import pymssql
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # Обработка CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # ВАЖНО: Эти данные будут заменены после запуска ngrok
    SQL_HOST = 'NGROK_HOST_HERE'  # Например: 0.tcp.ngrok.io
    SQL_PORT = 'NGROK_PORT_HERE'  # Например: 12345
    SQL_USER = 'sa'
    SQL_PASSWORD = '12345'
    SQL_DATABASE = 'StudentAccounting'
    
    if SQL_HOST == 'NGROK_HOST_HERE':
        return {
            'statusCode': 503,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'SQL Server туннель не настроен',
                'message': 'Запусти sqlserver_tunnel.py и ngrok, затем обнови данные в коде'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    try:
        # Подключение к SQL Server через туннель
        conn = pymssql.connect(
            server=SQL_HOST,
            port=int(SQL_PORT),
            user=SQL_USER,
            password=SQL_PASSWORD,
            database=SQL_DATABASE,
            timeout=10
        )
        cursor = conn.cursor(as_dict=True)
        
        params = event.get('queryStringParameters') or {}
        query_text = params.get('query', '')
        
        if method == 'GET':
            # Выполняем SELECT запрос
            if not query_text:
                # По умолчанию - список таблиц
                cursor.execute("""
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'
                """)
            else:
                cursor.execute(query_text)
            
            rows = cursor.fetchall()
            result = {
                'success': True,
                'data': rows,
                'count': len(rows)
            }
        
        elif method == 'POST':
            # Выполняем INSERT/UPDATE/DELETE запрос
            body_data = json.loads(event.get('body', '{}'))
            query_text = body_data.get('query', '')
            
            if not query_text:
                raise ValueError('Не указан SQL запрос')
            
            cursor.execute(query_text)
            conn.commit()
            
            result = {
                'success': True,
                'message': 'Запрос выполнен',
                'affected_rows': cursor.rowcount
            }
        
        else:
            result = {'error': f'Метод {method} не поддерживается'}
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
