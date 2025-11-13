import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request

def setup_ssl_cert():
    """Download and setup SSL certificate for TimeWeb Cloud PostgreSQL"""
    cert_dir = '/tmp/.postgresql'
    cert_path = f'{cert_dir}/root.crt'
    
    if not os.path.exists(cert_path):
        os.makedirs(cert_dir, exist_ok=True)
        cert_url = 'https://st.timeweb.com/cloud-static/ca.crt'
        urllib.request.urlretrieve(cert_url, cert_path)
    
    os.environ['PGSSLROOTCERT'] = cert_path

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Универсальный прокси для работы с внешней БД TimeWeb Cloud без лимитов
    Args: event - dict с httpMethod, body с SQL запросом
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатами запроса
    '''
    setup_ssl_cert()
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
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
    
    # Get database connection string
    dsn = os.environ.get('EXTERNAL_DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        # Parse request
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'query')
        
        conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        result = {}
        
        if action == 'query':
            # Execute custom SQL query
            query = body_data.get('query', '')
            params = body_data.get('params', [])
            
            if not query:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Query is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(query, params)
            
            # Check if query returns data
            if cur.description:
                rows = cur.fetchall()
                result = {'rows': [dict(row) for row in rows], 'count': len(rows)}
            else:
                conn.commit()
                result = {'affected': cur.rowcount}
        
        elif action == 'list':
            # List data from table
            table = body_data.get('table', 'employees')
            schema = body_data.get('schema', 'public')
            limit = body_data.get('limit', 100)
            offset = body_data.get('offset', 0)
            
            query = f'SELECT * FROM {schema}.{table} LIMIT %s OFFSET %s'
            cur.execute(query, (limit, offset))
            rows = cur.fetchall()
            
            result = {'rows': [dict(row) for row in rows], 'count': len(rows)}
        
        elif action == 'stats':
            # Get database statistics
            schema = body_data.get('schema', 'public')
            
            # Get table counts
            cur.execute("""
                SELECT 
                    schemaname,
                    relname as tablename,
                    n_live_tup as row_count
                FROM pg_stat_user_tables
                WHERE schemaname = %s
                ORDER BY relname
            """, (schema,))
            
            tables = cur.fetchall()
            total_records = sum(t['row_count'] for t in tables)
            
            result = {
                'tables': [dict(t) for t in tables],
                'totalTables': len(tables),
                'totalRecords': total_records
            }
        
        elif action == 'create':
            # Create new record
            table = body_data.get('table')
            schema = body_data.get('schema', 'public')
            data = body_data.get('data', {})
            
            if not table or not data:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Table and data are required'}),
                    'isBase64Encoded': False
                }
            
            columns = list(data.keys())
            values = list(data.values())
            placeholders = ', '.join(['%s'] * len(values))
            columns_str = ', '.join(columns)
            
            query = f'INSERT INTO {schema}.{table} ({columns_str}) VALUES ({placeholders}) RETURNING *'
            cur.execute(query, values)
            conn.commit()
            
            inserted_row = cur.fetchone()
            result = {'data': dict(inserted_row) if inserted_row else None, 'created': True}
        
        elif action == 'update':
            # Update existing record
            table = body_data.get('table')
            schema = body_data.get('schema', 'public')
            record_id = body_data.get('id')
            data = body_data.get('data', {})
            
            if not table or not record_id or not data:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Table, ID and data are required'}),
                    'isBase64Encoded': False
                }
            
            set_parts = [f'{key} = %s' for key in data.keys()]
            set_clause = ', '.join(set_parts)
            values = list(data.values())
            values.append(record_id)
            
            query = f'UPDATE {schema}.{table} SET {set_clause} WHERE id = %s RETURNING *'
            cur.execute(query, values)
            conn.commit()
            
            updated_row = cur.fetchone()
            result = {'data': dict(updated_row) if updated_row else None, 'updated': True}
        
        elif action == 'delete':
            # Delete record
            table = body_data.get('table')
            schema = body_data.get('schema', 'public')
            record_id = body_data.get('id')
            
            if not table or not record_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Table and ID are required'}),
                    'isBase64Encoded': False
                }
            
            query = f'DELETE FROM {schema}.{table} WHERE id = %s'
            cur.execute(query, (record_id,))
            conn.commit()
            
            result = {'deleted': True, 'affected': cur.rowcount}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str),
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
                'error': str(e),
                'errorType': type(e).__name__
            }),
            'isBase64Encoded': False
        }