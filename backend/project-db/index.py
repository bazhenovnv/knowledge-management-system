'''
Business: PostgreSQL database proxy for project - handles queries, list, and stats operations
Args: event with httpMethod, body containing action, query, params, table, schema
Returns: HTTP response with query results or database statistics
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'isBase64Encoded': False,
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        
        if action == 'query':
            query = body_data.get('query', '')
            params = body_data.get('params', [])
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                
                if query.strip().upper().startswith('SELECT'):
                    rows = cursor.fetchall()
                    result = [dict(row) for row in rows]
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'rows': result})
                    }
                else:
                    conn.commit()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'affected': cursor.rowcount})
                    }
        
        elif action == 'list':
            table = body_data.get('table', '')
            schema = body_data.get('schema', 'public')
            limit = body_data.get('limit', 100)
            offset = body_data.get('offset', 0)
            
            query = f'SELECT * FROM {schema}.{table} LIMIT {limit} OFFSET {offset}'
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
                
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'rows': result})
            }
        
        elif action == 'stats':
            schema = body_data.get('schema', 'public')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(f"""
                    SELECT 
                        table_name,
                        (SELECT COUNT(*) FROM information_schema.columns 
                         WHERE table_schema = t.table_schema 
                         AND table_name = t.table_name) as column_count
                    FROM information_schema.tables t
                    WHERE table_schema = '{schema}'
                    ORDER BY table_name
                """)
                tables = cursor.fetchall()
                
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'tables': [dict(t) for t in tables],
                    'totalTables': len(tables),
                    'totalRecords': 0
                })
            }
        
        else:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': 'Database error',
                'message': str(e)
            })
        }