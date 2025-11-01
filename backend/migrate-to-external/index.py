import json
import os
import psycopg2
from typing import Dict, Any, List, Tuple

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Migrate all data from internal DB to external TimeWeb Cloud DB
    Args: event - dict with httpMethod, body with migration options
          context - object with request_id attribute
    Returns: HTTP response with migration results
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
        internal_dsn = os.environ.get('DATABASE_URL')
        external_dsn = os.environ.get('EXTERNAL_DATABASE_URL')
        
        if not internal_dsn or not external_dsn:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database connections not configured'}),
                'isBase64Encoded': False
            }
        
        source_conn = psycopg2.connect(internal_dsn)
        target_conn = psycopg2.connect(external_dsn)
        
        source_cursor = source_conn.cursor()
        target_cursor = target_conn.cursor()
        
        schema = 't_p47619579_knowledge_management'
        
        source_cursor.execute(f'''
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = '{schema}'
            ORDER BY tablename
        ''')
        tables = [row[0] for row in source_cursor.fetchall()]
        
        migrated_tables = []
        errors = []
        
        for table in tables:
            try:
                target_cursor.execute(f'''
                    SELECT column_name, data_type, character_maximum_length, is_nullable
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = '{table}'
                    ORDER BY ordinal_position
                ''')
                existing_columns = target_cursor.fetchall()
                
                if not existing_columns:
                    source_cursor.execute(f'''
                        SELECT column_name, data_type, character_maximum_length, is_nullable
                        FROM information_schema.columns
                        WHERE table_schema = '{schema}' AND table_name = '{table}'
                        ORDER BY ordinal_position
                    ''')
                    columns = source_cursor.fetchall()
                    
                    create_cols = []
                    for col in columns:
                        col_name, data_type, max_len, nullable = col
                        type_def = data_type
                        if data_type == 'character varying' and max_len:
                            type_def = f'VARCHAR({max_len})'
                        elif data_type == 'timestamp without time zone':
                            type_def = 'TIMESTAMP'
                        elif data_type == 'ARRAY':
                            type_def = 'TEXT[]'
                        
                        null_constraint = '' if nullable == 'YES' else ' NOT NULL'
                        create_cols.append(f'{col_name} {type_def}{null_constraint}')
                    
                    create_sql = f'CREATE TABLE IF NOT EXISTS {table} ({", ".join(create_cols)})'
                    target_cursor.execute(create_sql)
                    target_conn.commit()
                
                source_cursor.execute(f'SELECT * FROM {schema}.{table}')
                rows = source_cursor.fetchall()
                
                if rows:
                    source_cursor.execute(f'''
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_schema = '{schema}' AND table_name = '{table}'
                        ORDER BY ordinal_position
                    ''')
                    columns = [row[0] for row in source_cursor.fetchall()]
                    
                    target_cursor.execute(f'TRUNCATE TABLE {table} CASCADE')
                    
                    placeholders = ','.join(['%s'] * len(columns))
                    insert_sql = f'INSERT INTO {table} ({",".join(columns)}) VALUES ({placeholders})'
                    
                    for row in rows:
                        target_cursor.execute(insert_sql, row)
                    
                    target_conn.commit()
                
                migrated_tables.append({
                    'table': table,
                    'rows': len(rows),
                    'status': 'success'
                })
                
            except Exception as table_error:
                errors.append({
                    'table': table,
                    'error': str(table_error)
                })
                target_conn.rollback()
        
        source_cursor.close()
        target_cursor.close()
        source_conn.close()
        target_conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'migrated': migrated_tables,
                'errors': errors,
                'totalTables': len(migrated_tables),
                'totalRows': sum(t['rows'] for t in migrated_tables)
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
