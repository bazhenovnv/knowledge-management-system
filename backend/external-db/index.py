'''
Business: TimeWeb Cloud PostgreSQL database connection for knowledge management system
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
                'Access-Control-Allow-Headers': 'Content-Type, Accept',
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
        
        database_url = os.environ.get('EXTERNAL_DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'EXTERNAL_DATABASE_URL not configured'})
            }
        
        database_url = database_url.replace('sslmode=verify-full', 'sslmode=require')
        conn = psycopg2.connect(database_url)
        
        if action == 'query':
            query = body_data.get('query', '')
            params = body_data.get('params', [])
            
            if params:
                for i, param in enumerate(params, 1):
                    placeholder = f'${i}'
                    if isinstance(param, str):
                        safe_param = param.replace("'", "''")
                        query = query.replace(placeholder, f"'{safe_param}'")
                    else:
                        query = query.replace(placeholder, str(param))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                
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
                        'body': json.dumps({'rows': result}, default=str)
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
            
            if not table:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Table name required'})
                }
            
            query = f'SELECT * FROM {schema}.{table} LIMIT {limit} OFFSET {offset}'
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
                
                cursor.execute(f'SELECT COUNT(*) as count FROM {schema}.{table}')
                count_row = cursor.fetchone()
                total_count = count_row['count'] if count_row else 0
                
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'rows': result,
                        'count': total_count
                    }, default=str)
                }
        
        elif action == 'stats':
            schema = body_data.get('schema', 'public')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(f"""
                    SELECT 
                        table_name,
                        (SELECT COUNT(*) FROM information_schema.columns 
                         WHERE table_schema = '{schema}' AND table_name = t.table_name) as column_count
                    FROM information_schema.tables t
                    WHERE table_schema = '{schema}'
                    ORDER BY table_name
                """)
                tables = cursor.fetchall()
                table_list = [dict(row) for row in tables]
                
                total_records = 0
                for table in table_list:
                    cursor.execute(f"SELECT COUNT(*) as count FROM {schema}.{table['table_name']}")
                    count_row = cursor.fetchone()
                    table['record_count'] = count_row['count'] if count_row else 0
                    total_records += table['record_count']
                
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'tables': table_list,
                        'totalTables': len(table_list),
                        'totalRecords': total_records
                    }, default=str)
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
                'body': json.dumps({'error': f'Unknown action: {action}'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
