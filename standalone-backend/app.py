"""
Flask API Server для управления базой данных
Твой собственный backend для размещения на любом хостинге

Установка:
pip install -r requirements.txt

Запуск локально:
python app.py

Запуск на продакшене (gunicorn):
gunicorn -w 4 -b 0.0.0.0:8000 app:app
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
import urllib.request
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов

# Настройки базы данных Timeweb Cloud
DB_CONFIG = {
    'host': 'c6b7ae5ab8e72b5408272e27.twc1.net',
    'port': '5432',
    'dbname': 'default_db',
    'user': 'gen_user',
    'password': 'TC>o0yl2J_PR(e'
}

SCHEMA = 't_p47619579_knowledge_management'

def get_db_connection():
    """Создание подключения к PostgreSQL с SSL"""
    # Скачиваем SSL сертификат
    cert_file = tempfile.NamedTemporaryFile(mode='w', suffix='.crt', delete=False)
    cert_content = urllib.request.urlopen('https://st.timeweb.com/cloud-static/ca.crt').read().decode('utf-8')
    cert_file.write(cert_content)
    cert_file.close()
    
    conn = psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        dbname=DB_CONFIG['dbname'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        sslmode='verify-full',
        sslrootcert=cert_file.name
    )
    conn.autocommit = True
    return conn


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint для проверки работоспособности"""
    return jsonify({'status': 'ok', 'service': 'knowledge-management-api'}), 200


@app.route('/', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def api_handler():
    """Главный обработчик всех запросов к API"""
    
    # CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Получаем action из параметров или тела запроса
        if request.method == 'GET':
            action = request.args.get('action')
            body_data = dict(request.args)
        else:
            body_data = request.get_json() or {}
            action = body_data.get('action')
            
            # Автоматическое определение action по HTTP методу
            if request.method == 'PUT' and not action:
                action = 'update'
            elif request.method == 'DELETE' and not action:
                action = 'delete'
        
        if not action:
            return jsonify({'error': 'Action required'}), 400
        
        # Подключаемся к базе данных
        conn = get_db_connection()
        
        # Маршрутизация по action
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
            return jsonify({'error': f'Unknown action: {action}'}), 400
        
        conn.close()
        return jsonify(result), 200
        
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


def handle_query(conn, body_data):
    """Выполнение произвольного SQL запроса"""
    query = body_data.get('query', '')
    params = body_data.get('params', [])
    
    # Замена плейсхолдеров $1, $2 на реальные значения
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
            return {'rows': [dict(row) for row in rows]}
        else:
            return {'affected': cursor.rowcount}


def handle_list(conn, body_data):
    """Получение списка записей из таблицы"""
    table = body_data.get('table', '')
    schema = body_data.get('schema', 'public')
    limit = int(body_data.get('limit', 100))
    offset = int(body_data.get('offset', 0))
    
    if not table:
        raise ValueError('Table name required')
    
    query = f'SELECT * FROM "{schema}"."{table}" LIMIT {limit} OFFSET {offset}'
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()
        
        cursor.execute(f'SELECT COUNT(*) as count FROM "{schema}"."{table}"')
        count_row = cursor.fetchone()
        total_count = count_row['count'] if count_row else 0
        
        return {
            'rows': [dict(row) for row in rows],
            'count': total_count
        }


def handle_stats(conn, body_data):
    """Получение статистики по таблицам"""
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
        
        return {
            'tables': table_list,
            'totalTables': len(table_list),
            'totalRecords': total_records
        }


def handle_create(conn, body_data):
    """Создание новой записи"""
    table = body_data.get('table', '')
    schema = body_data.get('schema', SCHEMA)
    data = body_data.get('data', {})
    
    if not table or not data:
        raise ValueError('Table name and data required')
    
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
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        result = cursor.fetchone()
        return {'data': dict(result) if result else {}}


def handle_update(conn, body_data):
    """Обновление записи"""
    table = body_data.get('table', '')
    schema = body_data.get('schema', SCHEMA)
    record_id = body_data.get('id')
    data = body_data.get('data', {})
    
    if not table or record_id is None or not data:
        raise ValueError('Table name, id and data required')
    
    # Специальная обработка пароля для таблицы employees
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
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query)
        result = cursor.fetchone()
        return {'data': dict(result) if result else {}}


def handle_delete(conn, body_data):
    """Удаление записи (мягкое или жёсткое)"""
    table = body_data.get('table', '')
    schema = body_data.get('schema', SCHEMA)
    record_id = body_data.get('id')
    permanent = body_data.get('permanent', False)
    cascade = body_data.get('cascade', False)
    
    if not table or record_id is None:
        raise ValueError('Table name and id required')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Жёсткое удаление сотрудника с каскадной очисткой связанных данных
        if table == 'employees' and permanent and cascade:
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
            return {'deleted': cursor.rowcount > 0, 'permanent': True, 'cascade': True}
        
        # Жёсткое удаление для других таблиц или если указан permanent
        elif permanent or table not in ['employees']:
            query = f'DELETE FROM "{schema}"."{table}" WHERE id = {record_id}'
            cursor.execute(query)
            return {'deleted': cursor.rowcount > 0, 'permanent': True}
        
        # Мягкое удаление (is_active = false)
        else:
            query = f'UPDATE "{schema}"."{table}" SET is_active = FALSE WHERE id = {record_id} RETURNING *'
            cursor.execute(query)
            result = cursor.fetchone()
            return {'data': dict(result) if result else {}, 'deleted': True, 'permanent': False}


@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute('SELECT 1')
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500


if __name__ == '__main__':
    # Запуск в режиме разработки
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)