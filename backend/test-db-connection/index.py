import json
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Test PostgreSQL database connection with simple query
    Args: event - dict with httpMethod, body containing connection_string
          context - object with request_id attribute
    Returns: HTTP response with connection test results
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        connection_string = body_data.get('connection_string', '')
        
        if not connection_string:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Connection string is required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        
        cursor.execute('SELECT version()')
        version = cursor.fetchone()[0]
        
        cursor.execute('SELECT current_database()')
        database = cursor.fetchone()[0]
        
        cursor.execute('SELECT current_user')
        user = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schemaname, tablename
            LIMIT 50
        ''')
        tables = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'connection': {
                    'database': database,
                    'user': user,
                    'version': version
                },
                'tables': [{'schema': t[0], 'name': t[1]} for t in tables],
                'tablesCount': len(tables)
            }),
            'isBase64Encoded': False
        }
        
    except psycopg2.Error as db_error:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(db_error),
                'errorType': 'DatabaseError'
            }),
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
                'error': str(e),
                'errorType': type(e).__name__
            }),
            'isBase64Encoded': False
        }