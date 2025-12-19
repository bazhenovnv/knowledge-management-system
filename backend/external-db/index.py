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
                'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Auth-Token, X-User-Id, X-Session-Id',
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
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            action = query_params.get('action', 'delete')
            body_data = query_params
        elif method in ['POST', 'PUT']:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            if method == 'PUT' and not action:
                action = 'update'
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
        elif action == 'create_test_full':
            result = handle_create_test_full(conn, body_data)
        elif action == 'update':
            result = handle_update(conn, body_data)
        elif action == 'update_test_full':
            result = handle_update_test_full(conn, body_data)
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
    
    print(f"Received query: {query}")
    
    if params:
        for i, param in enumerate(params, 1):
            placeholder = f'${i}'
            if isinstance(param, str):
                safe_param = param.replace("'", "''")
                query = query.replace(placeholder, f"'{safe_param}'")
            else:
                query = query.replace(placeholder, str(param))
    
    print(f"Final query: {query}")
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(query)
        except psycopg2.Error as e:
            print(f"Query execution error: {str(e)}")
            print(f"Query was: {query}")
            raise
        
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
            'data': result,
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
    import hashlib
    import secrets
    
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    data = body_data.get('data', {})
    
    if not table or not data:
        return error_response(400, 'Table name and data required')
    
    # Для таблицы employees: если есть password - конвертируем в password_hash
    if table == 'employees' and 'password' in data:
        password = data['password']
        salt = secrets.token_hex(8)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        data['password_hash'] = f"{salt}:{password_hash.hex()}"
        del data['password']
    
    # Если password_hash отсутствует в таблице employees - генерируем дефолтный
    if table == 'employees' and 'password_hash' not in data:
        salt = secrets.token_hex(8)
        password_hash = hashlib.pbkdf2_hmac('sha256', 'default123'.encode('utf-8'), salt.encode('utf-8'), 100000)
        data['password_hash'] = f"{salt}:{password_hash.hex()}"
    
    columns = ', '.join([f'"{k}"' for k in data.keys()])
    values = []
    for v in data.values():
        if v is None:
            values.append('NULL')
        elif isinstance(v, str):
            escaped_value = v.replace("'", "''")
            values.append(f"'{escaped_value}'")
        elif isinstance(v, bool):
            values.append('TRUE' if v else 'FALSE')
        else:
            values.append(str(v))
    values_str = ', '.join(values)
    
    query = f'INSERT INTO "{schema}"."{table}" ({columns}) VALUES ({values_str}) RETURNING *'
    
    print(f"[CREATE] Table: {schema}.{table}")
    print(f"[CREATE] Data: {data}")
    print(f"[CREATE] Query: {query}")
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(query)
            result = cursor.fetchone()
            return success_response({'data': dict(result) if result else {}})
        except psycopg2.Error as e:
            print(f"[CREATE ERROR] {str(e)}")
            print(f"[CREATE ERROR] Query: {query}")
            raise


def handle_update(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    import hashlib
    import secrets
    
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    record_id = body_data.get('id')
    data = body_data.get('data', {})
    
    if not table or record_id is None or not data:
        return error_response(400, 'Table name, id and data required')
    
    if table == 'employees' and 'password' in data and data['password']:
        password = data['password']
        salt = secrets.token_hex(8)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        data['password_hash'] = f"{salt}:{password_hash.hex()}"
        del data['password']
    
    set_parts = []
    for k, v in data.items():
        if v is None:
            set_parts.append(f'"{k}" = NULL')
        elif isinstance(v, str):
            escaped_value = v.replace("'", "''")
            set_parts.append(f'"{k}" = \'{escaped_value}\'')
        elif isinstance(v, bool):
            set_parts.append(f'"{k}" = {"TRUE" if v else "FALSE"}')
        else:
            set_parts.append(f'"{k}" = {v}')
    
    set_clause = ', '.join(set_parts)
    query = f'UPDATE "{schema}"."{table}" SET {set_clause} WHERE id = {record_id} RETURNING *'
    
    print(f"[UPDATE] Table: {schema}.{table}, ID: {record_id}")
    print(f"[UPDATE] Data: {data}")
    print(f"[UPDATE] Query: {query}")
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute(query)
            result = cursor.fetchone()
            return success_response({'data': dict(result) if result else {}})
        except psycopg2.Error as e:
            print(f"[UPDATE ERROR] {str(e)}")
            print(f"[UPDATE ERROR] Query: {query}")
            raise


def handle_delete(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    table = body_data.get('table', '')
    schema = body_data.get('schema', 't_p47619579_knowledge_management')
    record_id = body_data.get('id')
    permanent_param = body_data.get('permanent', False)
    permanent = permanent_param in [True, 'true', 'True', '1']
    cascade_param = body_data.get('cascade', False)
    cascade = cascade_param in [True, 'true', 'True', '1']
    
    if not table or record_id is None:
        return error_response(400, 'Table name and id required')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        if table == 'tests' and permanent:
            cursor.execute(f'''
                DELETE FROM "{schema}"."test_answers" 
                WHERE question_id IN (
                    SELECT id FROM "{schema}"."test_questions" WHERE test_id = {record_id}
                )
            ''')
            cursor.execute(f'DELETE FROM "{schema}"."test_questions" WHERE test_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."test_user_answers" WHERE result_id IN (SELECT id FROM "{schema}"."test_results" WHERE test_id = {record_id})')
            cursor.execute(f'DELETE FROM "{schema}"."test_results" WHERE test_id = {record_id}')
            
            query = f'DELETE FROM "{schema}"."{table}" WHERE id = {record_id}'
            cursor.execute(query)
            return success_response({'deleted': cursor.rowcount > 0, 'permanent': True, 'cascade': True})
        
        elif table == 'employees' and permanent and cascade:
            cursor.execute(f'''
                DELETE FROM "{schema}"."test_user_answers" 
                WHERE result_id IN (
                    SELECT id FROM "{schema}"."test_results" WHERE employee_id = {record_id}
                )
            ''')
            cursor.execute(f'DELETE FROM "{schema}"."test_results" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."course_enrollments" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."notifications" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."attendance" WHERE employee_id = {record_id}')
            cursor.execute(f'DELETE FROM "{schema}"."user_sessions" WHERE employee_id = {record_id}')
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


def handle_create_test_full(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    """Создание теста с вопросами и ответами за один запрос"""
    schema = 't_p47619579_knowledge_management'
    
    print(f"[CREATE_TEST_FULL] Received body_data: {body_data}")
    
    title = body_data.get('title')
    description = body_data.get('description')
    creator_id = body_data.get('creator_id')
    questions = body_data.get('questions', [])
    
    print(f"[CREATE_TEST_FULL] title={title}, creator_id={creator_id}, questions_count={len(questions)}")
    
    if not title or not creator_id:
        return error_response(400, 'Title and creator_id required')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Создаём тест
        test_data = {
            'title': title,
            'description': description,
            'creator_id': creator_id,
            'course_id': body_data.get('course_id'),
            'time_limit': body_data.get('time_limit'),
            'passing_score': body_data.get('passing_score', 70),
            'max_attempts': body_data.get('max_attempts', 3),
            'is_active': True
        }
        
        columns = ', '.join([f'"{k}"' for k, v in test_data.items() if v is not None])
        values = []
        for k, v in test_data.items():
            if v is None:
                continue
            elif isinstance(v, str):
                values.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
            elif isinstance(v, bool):
                values.append('TRUE' if v else 'FALSE')
            else:
                values.append(str(v))
        values_str = ', '.join(values)
        
        cursor.execute(f'INSERT INTO "{schema}"."tests" ({columns}) VALUES ({values_str}) RETURNING *')
        test = dict(cursor.fetchone())
        test_id = test['id']
        
        # Создаём вопросы
        for idx, q in enumerate(questions):
            q_data = {
                'test_id': test_id,
                'question_text': q['question_text'],
                'question_type': q.get('question_type', 'single_choice'),
                'points': q.get('points', 1),
                'order_num': idx + 1
            }
            
            q_columns = ', '.join([f'"{k}"' for k in q_data.keys()])
            q_values = []
            for v in q_data.values():
                if isinstance(v, str):
                    q_values.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
                else:
                    q_values.append(str(v))
            q_values_str = ', '.join(q_values)
            
            cursor.execute(f'INSERT INTO "{schema}"."test_questions" ({q_columns}) VALUES ({q_values_str}) RETURNING id')
            question_id = cursor.fetchone()['id']
            
            # Создаём ответы
            for a_idx, a in enumerate(q.get('answers', [])):
                a_data = {
                    'question_id': question_id,
                    'answer_text': a['answer_text'],
                    'is_correct': a.get('is_correct', False),
                    'order_num': a_idx + 1
                }
                
                a_columns = ', '.join([f'"{k}"' for k in a_data.keys()])
                a_values = []
                for v in a_data.values():
                    if isinstance(v, str):
                        a_values.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
                    elif isinstance(v, bool):
                        a_values.append('TRUE' if v else 'FALSE')
                    else:
                        a_values.append(str(v))
                a_values_str = ', '.join(a_values)
                
                cursor.execute(f'INSERT INTO "{schema}"."test_answers" ({a_columns}) VALUES ({a_values_str})')
        
        return success_response({'data': test, 'message': 'Test created successfully'})


def handle_update_test_full(conn, body_data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление теста с вопросами и ответами"""
    schema = 't_p47619579_knowledge_management'
    test_id = body_data.get('id')
    questions = body_data.get('questions', [])
    
    if not test_id:
        return error_response(400, 'Test ID required')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Обновляем тест
        test_updates = {}
        for field in ['title', 'description', 'course_id', 'time_limit', 'passing_score', 'max_attempts']:
            if field in body_data:
                test_updates[field] = body_data[field]
        
        if test_updates:
            set_parts = []
            for k, v in test_updates.items():
                if v is None:
                    set_parts.append(f'"{k}" = NULL')
                elif isinstance(v, str):
                    set_parts.append(f'"{k}" = \'{v.replace(chr(39), chr(39)+chr(39))}\'')
                elif isinstance(v, bool):
                    set_parts.append(f'"{k}" = {"TRUE" if v else "FALSE"}')
                else:
                    set_parts.append(f'"{k}" = {v}')
            
            set_clause = ', '.join(set_parts)
            cursor.execute(f'UPDATE "{schema}"."tests" SET {set_clause} WHERE id = {test_id}')
        
        # Удаляем старые вопросы и ответы
        cursor.execute(f'''
            DELETE FROM "{schema}"."test_answers" 
            WHERE question_id IN (
                SELECT id FROM "{schema}"."test_questions" WHERE test_id = {test_id}
            )
        ''')
        cursor.execute(f'DELETE FROM "{schema}"."test_questions" WHERE test_id = {test_id}')
        
        # Создаём новые вопросы и ответы
        for idx, q in enumerate(questions):
            q_data = {
                'test_id': test_id,
                'question_text': q['question_text'],
                'question_type': q.get('question_type', 'single_choice'),
                'points': q.get('points', 1),
                'order_num': idx + 1
            }
            
            q_columns = ', '.join([f'"{k}"' for k in q_data.keys()])
            q_values = []
            for v in q_data.values():
                if isinstance(v, str):
                    q_values.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
                else:
                    q_values.append(str(v))
            q_values_str = ', '.join(q_values)
            
            cursor.execute(f'INSERT INTO "{schema}"."test_questions" ({q_columns}) VALUES ({q_values_str}) RETURNING id')
            question_id = cursor.fetchone()['id']
            
            for a_idx, a in enumerate(q.get('answers', [])):
                a_data = {
                    'question_id': question_id,
                    'answer_text': a['answer_text'],
                    'is_correct': a.get('is_correct', False),
                    'order_num': a_idx + 1
                }
                
                a_columns = ', '.join([f'"{k}"' for k in a_data.keys()])
                a_values = []
                for v in a_data.values():
                    if isinstance(v, str):
                        a_values.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
                    elif isinstance(v, bool):
                        a_values.append('TRUE' if v else 'FALSE')
                    else:
                        a_values.append(str(v))
                a_values_str = ', '.join(a_values)
                
                cursor.execute(f'INSERT INTO "{schema}"."test_answers" ({a_columns}) VALUES ({a_values_str})')
        
        cursor.execute(f'SELECT * FROM "{schema}"."tests" WHERE id = {test_id}')
        test = dict(cursor.fetchone())
        
        return success_response({'data': test, 'message': 'Test updated successfully'})


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