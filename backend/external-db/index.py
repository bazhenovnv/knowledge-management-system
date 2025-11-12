'''
Business: Direct PostgreSQL connection to TimeWeb Cloud database for knowledge management
Args: event with httpMethod, queryStringParameters or body containing action (query/list/stats)
Returns: HTTP response with database results in JSON format
'''

import json
import os
import ssl
import tempfile
import urllib.request
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        
        db_host = 'c6b7ae5ab8e72b5408272e27.twc1.net'
        db_port = '5432'
        db_name = 'default_db'
        db_user = 'gen_user'
        db_password = 'TC>o0yl2J_PR(e'
        
        cert_file = tempfile.NamedTemporaryFile(mode='w', suffix='.crt', delete=False)
        cert_content = urllib.request.urlopen('https://st.timeweb.com/cloud-static/ca.crt').read().decode('utf-8')
        cert_file.write(cert_content)
        cert_file.close()
        
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password,
            sslmode='verify-full',
            sslrootcert=cert_file.name
        )
        conn.autocommit = True
        
        if action == 'query':
            result = handle_query(conn, body_data)
        elif action == 'list':
            result = handle_list(conn, body_data)
        elif action == 'stats':
            result = handle_stats(conn, body_data)
        elif action == 'create':
            result = handle_create(conn, body_data)
        elif action == 'update':
            result = handle_update(conn, body_data)
        elif action == 'delete':
            result = handle_delete(conn, body_data)
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
    
    query = f'SELECT * FROM "{schema}"."{table}" LIMIT {limit} OFFSET {offset}'
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        
        cursor.execute(f'SELECT COUNT(*) as count FROM "{schema}"."{table}"')
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
            cursor.execute(f"SELECT COUNT(*) as count FROM \"{schema}\".\"{table['table_name']}\"")
            count_row = cursor.fetchone()
            table['record_count'] = count_row['count'] if count_row else 0
            total_records += table['record_count']
        
        return success_response({
            'tables': table_list,
            'totalTables': len(table_list),
            'totalRecords': total_records
        })


def handle_create(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    data = body_data.get('data', {})
    
    if not table or not data:
        return error_response(400, 'Table name and data required')
    
    columns = ', '.join([f'"{k}"' for k in data.keys()])
    values = []
    for v in data.values():
        if v is None:
            values.append('NULL')
        elif isinstance(v, str):
            values.append(f"'{v.replace(chr(39), chr(39)*2)}'")
        elif isinstance(v, bool):
            values.append('TRUE' if v else 'FALSE')
        else:
            values.append(str(v))
    values_str = ', '.join(values)
    
    query = f'INSERT INTO "{schema}"."{table}" ({columns}) VALUES ({values_str}) RETURNING *'
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        result = cursor.fetchone()
        return success_response({'data': dict(result) if result else {}})


def handle_update(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    record_id = body_data.get('id')
    data = body_data.get('data', {})
    
    if not table or record_id is None or not data:
        return error_response(400, 'Table name, id and data required')
    
    set_parts = []
    for k, v in data.items():
        if v is None:
            set_parts.append(f'"{k}" = NULL')
        elif isinstance(v, str):
            set_parts.append(f'"{k}" = \'{v.replace(chr(39), chr(39)*2)}\'')
        elif isinstance(v, bool):
            set_parts.append(f'"{k}" = {"TRUE" if v else "FALSE"}')
        else:
            set_parts.append(f'"{k}" = {v}')
    
    set_clause = ', '.join(set_parts)
    query = f'UPDATE "{schema}"."{table}" SET {set_clause} WHERE id = {record_id} RETURNING *'
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        result = cursor.fetchone()
        return success_response({'data': dict(result) if result else {}})


def handle_delete(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    record_id = body_data.get('id')
    permanent = body_data.get('permanent', False)
    cascade = body_data.get('cascade', False)
    
    if not table or record_id is None:
        return error_response(400, 'Table name and id required')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        if table == 'employees' and permanent and cascade:
            cursor.execute(f'DELETE FROM "{schema}"."course_enrollments" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."test_results" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."test_answers" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."notifications" WHERE employee_id = {record_id}')
            cursor.execute(f'UPDATE "{schema}"."courses" SET instructor_id = NULL WHERE instructor_id = {record_id}')
            cursor.execute(f'UPDATE "{schema}"."tests" SET creator_id = NULL WHERE creator_id = {record_id}')
            
            query = f'DELETE FROM "{schema}"."{table}" WHERE id = {record_id}'
            cursor.execute(query)
            return success_response({'deleted': cursor.rowcount > 0, 'permanent': True, 'cascade': True})
        
        elif permanent or table not in ['employees']:
            query = f'DELETE FROM "{schema}"."{table}" WHERE id = {record_id}'
            cursor.execute(query)
            return success_response({'deleted': cursor.rowcount > 0, 'permanent': True})
        else:
            query = f'UPDATE "{schema}"."{table}" SET is_active = FALSE WHERE id = {record_id} RETURNING *'
            cursor.execute(query)
            result = cursor.fetchone()
            return success_response({'data': dict(result) if result else {}, 'deleted': True, 'permanent': False})


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