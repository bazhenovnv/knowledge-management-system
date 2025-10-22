import json
import os
import pymssql
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Выполнение SQL запросов к SQL Server базе данных
    Args: event с httpMethod, body содержит query (SQL запрос) и params (параметры)
    Returns: HTTP response с результатами запроса
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': 'SQL Server Query API',
                'usage': 'POST with {"query": "SELECT * FROM employees", "params": []}'
            })
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    conn = None
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        query = body_data.get('query', '')
        params = body_data.get('params', [])
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Query is required'})
            }
        
        conn = pymssql.connect(
            server='xtunnel.ru:19379',
            user='cloud_user',
            password='YourStrongPassword123!',
            database='master',
            tds_version='7.0'
        )
        cursor = conn.cursor(as_dict=True)
        
        if params:
            cursor.execute(query, tuple(params))
        else:
            cursor.execute(query)
        
        if query.strip().upper().startswith('SELECT'):
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                row_dict = {}
                for key, value in row.items():
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    row_dict[key] = value
                results.append(row_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'data': results,
                    'count': len(results)
                })
            }
        else:
            conn.commit()
            affected_rows = cursor.rowcount
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'message': 'Query executed successfully',
                    'affected_rows': affected_rows
                })
            }
        
    except pymssql.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'SQL Server error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()
