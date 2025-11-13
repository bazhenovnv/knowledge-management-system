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
        # Parse request - support both GET query params and POST body
        query_params = event.get('queryStringParameters', {}) or {}
        body_data = {}
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
        
        # Merge query params and body data (body takes precedence)
        request_data = {**query_params, **body_data}
        action = request_data.get('action', 'query')
        
        # Connect to database
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if action == 'query':
            # Execute custom SQL query
            query = request_data.get('query', '')
            cur.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                rows = cur.fetchall()
                result = {'data': convert_dates([dict(row) for row in rows]), 'count': len(rows)}
            else:
                conn.commit()
                result = {'affected': cur.rowcount}
        
        elif action == 'list':
            # List table data
            table = request_data.get('table', 'employees')
            schema = request_data.get('schema', 't_p47619579_knowledge_management')
            limit = int(request_data.get('limit', 100))
            offset = int(request_data.get('offset', 0))
            
            cur.execute(f"""
                SELECT * FROM {schema}.{table}
                ORDER BY id
                LIMIT {limit} OFFSET {offset}
            """)
            
            rows = cur.fetchall()
            result = {'data': convert_dates([dict(row) for row in rows]), 'count': len(rows)}
        
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
        
        elif action == 'create':
            # Create new record
            table = request_data.get('table', 'employees')
            schema = request_data.get('schema', 't_p47619579_knowledge_management')
            data = request_data.get('data', {})
            
            if not data:
                result = {'error': 'No data provided for create'}
            else:
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                values = list(data.values())
                
                cur.execute(f"""
                    INSERT INTO {schema}.{table} ({columns})
                    VALUES ({placeholders})
                    RETURNING *
                """, values)
                
                conn.commit()
                row = cur.fetchone()
                result = {'data': convert_dates(dict(row)) if row else None}
        
        elif action == 'update':
            # Update existing record
            table = request_data.get('table', 'employees')
            schema = request_data.get('schema', 't_p47619579_knowledge_management')
            record_id = request_data.get('id')
            data = request_data.get('data', {})
            
            if not record_id or not data:
                result = {'error': 'ID and data required for update'}
            else:
                set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
                values = list(data.values()) + [record_id]
                
                cur.execute(f"""
                    UPDATE {schema}.{table}
                    SET {set_clause}, updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                """, values)
                
                conn.commit()
                row = cur.fetchone()
                result = {'data': convert_dates(dict(row)) if row else None}
        
        elif action == 'delete':
            # Delete record (soft or hard)
            table = request_data.get('table', 'employees')
            schema = request_data.get('schema', 't_p47619579_knowledge_management')
            record_id = request_data.get('id')
            permanent = request_data.get('permanent', False)
            
            if not record_id:
                result = {'error': 'ID required for delete'}
            else:
                if permanent:
                    # Hard delete
                    cur.execute(f"""
                        DELETE FROM {schema}.{table}
                        WHERE id = %s
                    """, [record_id])
                else:
                    # Soft delete (set is_active = false)
                    cur.execute(f"""
                        UPDATE {schema}.{table}
                        SET is_active = false, updated_at = NOW()
                        WHERE id = %s
                    """, [record_id])
                
                conn.commit()
                result = {'deleted': True, 'affected': cur.rowcount}
        
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