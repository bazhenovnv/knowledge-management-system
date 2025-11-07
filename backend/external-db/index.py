'''
Business: Direct PostgreSQL connection to TimeWeb Cloud database for knowledge management
Args: event with httpMethod, queryStringParameters or body containing action (query/list/stats)
Returns: HTTP response with database results in JSON format
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

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
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            action = query_params.get('action')
            body_data = query_params
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
        else:
            return error_response(405, 'Method not allowed')
        
        database_url = 'postgresql://gen_user:TC%3Eo0yl2J_PR(e@c6b7ae5ab8e72b5408272e27.twc1.net:5432/default_db?sslmode=require'
        
        database_url = database_url.replace('sslmode=verify-full', 'sslmode=require')
        
        conn = psycopg2.connect(database_url)
        
        if action == 'query':
            result = handle_query(conn, body_data)
        elif action == 'list':
            result = handle_list(conn, body_data)
        elif action == 'stats':
            result = handle_stats(conn, body_data)
        else:
            conn.close()
            return error_response(400, f'Unknown action: {action}')
        
        conn.close()
        return result
    
    except psycopg2.Error as e:
        return error_response(500, f'Database error: {str(e)}')
    except Exception as e:
        return error_response(500, f'Server error: {str(e)}')


def handle_query(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
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
            return success_response({'rows': result})
        else:
            conn.commit()
            return success_response({'affected': cursor.rowcount})


def handle_list(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    table = body_data.get('table', '')
    schema = body_data.get('schema', 'public')
    limit = int(body_data.get('limit', 100))
    offset = int(body_data.get('offset', 0))
    
    if not table:
        return error_response(400, 'Table name required')
    
    query = f'SELECT * FROM {schema}.{table} LIMIT {limit} OFFSET {offset}'
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        
        cursor.execute(f'SELECT COUNT(*) as count FROM {schema}.{table}')
        count_row = cursor.fetchone()
        total_count = count_row['count'] if count_row else 0
        
        return success_response({
            'rows': result,
            'count': total_count
        })


def handle_stats(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
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
        
        return success_response({
            'tables': table_list,
            'totalTables': len(table_list),
            'totalRecords': total_records
        })


def success_response(data: Any) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(data, default=str)
    }


def error_response(status_code: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': message})
    }