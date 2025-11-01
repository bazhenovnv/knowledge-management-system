import json
import os
import psycopg2
import pyodbc
from typing import Dict, Any, List, Tuple
from datetime import datetime
import urllib.request
import ssl

def setup_ssl_cert():
    """Download and setup SSL certificate for TimeWeb Cloud PostgreSQL"""
    import os
    cert_dir = '/tmp/.postgresql'
    cert_path = f'{cert_dir}/root.crt'
    
    if not os.path.exists(cert_path):
        os.makedirs(cert_dir, exist_ok=True)
        cert_url = 'https://st.timeweb.com/cloud-static/ca.crt'
        urllib.request.urlretrieve(cert_url, cert_path)
    
    os.environ['PGSSLROOTCERT'] = cert_path

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация данных из PostgreSQL в SQL Server
    Args: event с httpMethod, queryStringParameters (table - имя таблицы для синхронизации)
    Returns: HTTP response с результатом синхронизации
    '''
    setup_ssl_cert()
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    pg_conn = None
    sql_conn = None
    
    try:
        postgres_dsn = os.environ.get('EXTERNAL_DATABASE_URL')
        sqlserver_conn_str = os.environ.get('SQL_SERVER_CONNECTION_STRING')
        
        if not postgres_dsn or not sqlserver_conn_str:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database credentials not configured'})
            }
        
        pg_conn = psycopg2.connect(postgres_dsn)
        sql_conn = pyodbc.connect(sqlserver_conn_str)
        
        body_data = json.loads(event.get('body', '{}'))
        table_name = body_data.get('table', 'all')
        
        tables_to_sync = []
        if table_name == 'all':
            tables_to_sync = [
                'employees', 'courses', 'tests', 'test_questions', 
                'test_answers', 'course_enrollments', 'user_sessions',
                'scheduled_notifications', 'test_results', 'deadline_reminders',
                'db_request_stats', 'function_call_stats'
            ]
        else:
            tables_to_sync = [table_name]
        
        results = {}
        
        for table in tables_to_sync:
            try:
                synced_count = sync_table(pg_conn, sql_conn, table)
                results[table] = {'status': 'success', 'rows': synced_count}
            except Exception as e:
                results[table] = {'status': 'error', 'message': str(e)}
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Синхронизация завершена',
                'results': results,
                'timestamp': datetime.now().isoformat()
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if pg_conn:
            pg_conn.close()
        if sql_conn:
            sql_conn.close()


def sync_table(pg_conn, sql_conn, table_name: str) -> int:
    pg_cursor = pg_conn.cursor()
    sql_cursor = sql_conn.cursor()
    
    pg_cursor.execute(f'SELECT * FROM {table_name}')
    columns = [desc[0] for desc in pg_cursor.description]
    rows = pg_cursor.fetchall()
    
    sql_cursor.execute(f'DELETE FROM {table_name}')
    sql_conn.commit()
    
    if len(rows) == 0:
        return 0
    
    placeholders = ','.join(['?' for _ in columns])
    insert_query = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders})"
    
    sql_cursor.execute(f'SET IDENTITY_INSERT {table_name} ON')
    
    for row in rows:
        sql_cursor.execute(insert_query, row)
    
    sql_cursor.execute(f'SET IDENTITY_INSERT {table_name} OFF')
    sql_conn.commit()
    
    pg_cursor.close()
    sql_cursor.close()
    
    return len(rows)