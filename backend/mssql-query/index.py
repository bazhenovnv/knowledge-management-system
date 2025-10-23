import json
import os
import pymssql
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Универсальная функция для выполнения SQL запросов к MS SQL Server
    Args: event с httpMethod='POST', body={'query': 'SELECT ...', 'params': []}
    Returns: JSON с результатами запроса или ошибкой
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только POST запросы разрешены'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        query = body_data.get('query', '').strip()
        params = body_data.get('params', [])
        database = body_data.get('database', 'master')
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'SQL запрос не указан'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Подключение к MS SQL Server
        conn = pymssql.connect(
            server='tcp-free.tunnel4.com',
            port=33035,
            user='Bazhenov_ab',
            password='NewPassword123!',
            database=database,
            tds_version='7.0',
            timeout=30
        )
        cursor = conn.cursor(as_dict=True)
        
        # Выполнение запроса
        if params:
            cursor.execute(query, tuple(params))
        else:
            cursor.execute(query)
        
        # Определяем тип операции
        query_upper = query.upper().strip()
        is_select = query_upper.startswith('SELECT') or query_upper.startswith('EXEC') or query_upper.startswith('SHOW')
        
        result = {}
        
        if is_select:
            # SELECT запрос - возвращаем данные
            rows = cursor.fetchall()
            result = {
                'success': True,
                'data': rows,
                'rowCount': len(rows),
                'query': query
            }
        else:
            # INSERT/UPDATE/DELETE - коммитим и возвращаем affected rows
            conn.commit()
            result = {
                'success': True,
                'message': 'Запрос выполнен успешно',
                'rowsAffected': cursor.rowcount,
                'query': query
            }
        
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
        
    except pymssql.Error as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка SQL Server: {str(e)}',
                'query': body_data.get('query', '')
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка: {str(e)}'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
