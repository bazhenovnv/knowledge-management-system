import json
import os
from typing import Dict, Any
from datetime import date, datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def convert_dates(obj):
    """Convert date/datetime objects to ISO format strings"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_dates(item) for item in obj]
    return obj

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Прокси для работы со встроенной БД проекта poehali.dev
    Args: event - dict с httpMethod, body с action
          context - объект с request_id
    Returns: HTTP response с данными из БД
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Get DATABASE_URL (встроенная БД проекта)
    dsn = os.environ.get('DATABASE_URL')
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
        
        # Connect to database
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if action == 'query':
            # Execute custom SQL query
            query = body_data.get('query', '')
            cur.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                rows = cur.fetchall()
                result = {'rows': convert_dates([dict(row) for row in rows]), 'count': len(rows)}
            else:
                conn.commit()
                result = {'affected': cur.rowcount}
        
        elif action == 'list':
            # List table data
            table = body_data.get('table', 'employees')
            schema = body_data.get('schema', 't_p47619579_knowledge_management')
            limit = body_data.get('limit', 100)
            offset = body_data.get('offset', 0)
            
            cur.execute(f"""
                SELECT * FROM {schema}.{table}
                ORDER BY id
                LIMIT {limit} OFFSET {offset}
            """)
            
            rows = cur.fetchall()
            result = {'rows': convert_dates([dict(row) for row in rows]), 'count': len(rows)}
        
        elif action == 'stats':
            # Get database statistics
            cur.execute("""
                SELECT 
                    schemaname,
                    relname as tablename,
                    n_live_tup as row_count
                FROM pg_stat_user_tables
                WHERE schemaname = 't_p47619579_knowledge_management'
                ORDER BY relname
            """)
            
            tables = [dict(row) for row in cur.fetchall()]
            total_records = sum(t['row_count'] or 0 for t in tables)
            
            result = {
                'tables': tables,
                'totalTables': len(tables),
                'totalRecords': total_records
            }
        
        else:
            result = {'error': f'Unknown action: {action}'}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }