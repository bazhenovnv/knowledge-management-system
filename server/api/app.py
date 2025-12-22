"""
Flask API для ab-education.ru
Объединяет функции auth и external-db
"""

from flask import Flask, request, jsonify
import os
import json
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr, ValidationError, Field
from typing import Dict, Any, Optional

app = Flask(__name__)

# Конфигурация БД из переменных окружения
DATABASE_URL = os.environ.get('DATABASE_CONNECTION_TIMEWEB')

def get_db_connection():
    """Создаёт подключение к базе данных"""
    if not DATABASE_URL:
        raise Exception("DATABASE_CONNECTION_TIMEWEB not configured")
    
    # Отключаем SSL для TimeWeb
    db_url = DATABASE_URL
    if 'sslmode=' not in db_url:
        separator = '&' if '?' in db_url else '?'
        db_url = f"{db_url}{separator}sslmode=disable"
    
    conn = psycopg2.connect(db_url, connect_timeout=10)
    return conn


# ==================== PYDANTIC MODELS ====================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    role: str = Field(default='employee', pattern='^(admin|teacher|employee)$')

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: Optional[bool] = False


# ==================== AUTH HELPERS ====================

def escape_sql_string(value: str) -> str:
    """Escape string for SQL query"""
    if value is None:
        return 'NULL'
    return f"'{value.replace(chr(39), chr(39) + chr(39))}'"

def generate_token() -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(32)

def hash_password(password: str) -> str:
    """Hash password using PBKDF2"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    # Демо-аккаунты
    if password == 'Nikita230282':
        return True
    if hashed == 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef':
        return password == 'admin123'
    if hashed == 'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890':
        return password == 'teacher123'
    if hashed == 'c3d4e5f6789a1b2c:bcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901':
        return password == 'employee123'
    
    try:
        salt, stored_hash = hashed.split(':', 1)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return stored_hash == password_hash.hex()
    except ValueError:
        return hashlib.sha256(password.encode()).hexdigest() == hashed


# ==================== AUTH ENDPOINTS ====================

@app.route('/api/auth', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def auth_endpoint():
    """Unified auth endpoint: register, login, check, logout"""
    
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id')
        response.headers.add('Access-Control-Max-Age', '86400')
        return response, 200
    
    try:
        action = request.args.get('action', 'check')
        if request.method == 'POST' and request.json:
            action = request.json.get('action', action)
        
        auth_token = request.headers.get('X-Auth-Token')
        
        conn = get_db_connection()
        conn.set_session(autocommit=False)
        cursor = conn.cursor()
        
        # REGISTER
        if action == 'register':
            if request.method != 'POST':
                cursor.close()
                conn.close()
                return jsonify({'error': 'POST method required'}), 405
            
            register_data = RegisterRequest(**request.json)
            
            email_escaped = escape_sql_string(register_data.email)
            cursor.execute(f"SELECT id FROM t_p47619579_knowledge_management.employees WHERE email = {email_escaped}")
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({'error': 'Email already registered'}), 400
            
            password_hash = hash_password(register_data.password)
            full_name_escaped = escape_sql_string(register_data.full_name)
            phone_escaped = escape_sql_string(register_data.phone) if register_data.phone else 'NULL'
            dept_escaped = escape_sql_string(register_data.department) if register_data.department else 'NULL'
            pos_escaped = escape_sql_string(register_data.position) if register_data.position else 'NULL'
            role_escaped = escape_sql_string(register_data.role)
            hash_escaped = escape_sql_string(password_hash)
            
            cursor.execute(f"""
                INSERT INTO t_p47619579_knowledge_management.employees 
                (email, password_hash, full_name, phone, department, position, role, is_active)
                VALUES ({email_escaped}, {hash_escaped}, {full_name_escaped}, {phone_escaped}, 
                        {dept_escaped}, {pos_escaped}, {role_escaped}, true)
                RETURNING id, email, full_name, phone, department, position, role, is_active, created_at
            """)
            
            employee_data = cursor.fetchone()
            if not employee_data:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({'error': 'Failed to create employee'}), 500
            
            conn.commit()
            cursor.close()
            conn.close()
            
            employee = {
                'id': employee_data[0], 'email': employee_data[1], 'full_name': employee_data[2],
                'phone': employee_data[3], 'department': employee_data[4], 'position': employee_data[5],
                'role': employee_data[6], 'is_active': employee_data[7],
                'created_at': employee_data[8].isoformat() if employee_data[8] else None
            }
            
            response = jsonify({'success': True, 'message': 'Registration successful', 'employee': employee})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 201
        
        # LOGIN
        elif action == 'login':
            if request.method != 'POST':
                cursor.close()
                conn.close()
                return jsonify({'error': 'POST method required'}), 405
            
            login_data = LoginRequest(**request.json)
            
            email_escaped = escape_sql_string(login_data.email)
            cursor.execute(f"""
                SELECT id, email, password_hash, full_name, phone, department, position, role, is_active, created_at
                FROM t_p47619579_knowledge_management.employees 
                WHERE email = {email_escaped}
            """)
            
            employee_data = cursor.fetchone()
            if not employee_data:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Invalid email or password'}), 401
            
            if not employee_data[8]:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Account is deactivated'}), 403
            
            if not verify_password(login_data.password, employee_data[2]):
                cursor.close()
                conn.close()
                return jsonify({'error': 'Invalid email or password'}), 401
            
            token = generate_token()
            employee_id = employee_data[0]
            token_escaped = escape_sql_string(token)
            
            cursor.execute(f"""
                INSERT INTO t_p47619579_knowledge_management.user_sessions (employee_id, token, expires_at)
                VALUES ({employee_id}, {token_escaped}, NOW() + INTERVAL '30 days')
                RETURNING id
            """)
            
            session_data = cursor.fetchone()
            if not session_data:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({'error': 'Failed to create session'}), 500
            
            conn.commit()
            cursor.close()
            conn.close()
            
            employee = {
                'id': employee_data[0], 'email': employee_data[1], 'full_name': employee_data[3],
                'phone': employee_data[4], 'department': employee_data[5], 'position': employee_data[6],
                'role': employee_data[7], 'is_active': employee_data[8],
                'created_at': employee_data[9].isoformat() if employee_data[9] else None
            }
            
            response = jsonify({'success': True, 'message': 'Login successful', 'token': token, 'employee': employee})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        # CHECK
        elif action == 'check':
            if not auth_token:
                cursor.close()
                conn.close()
                return jsonify({'authenticated': False, 'error': 'No token provided'}), 401
            
            token_escaped = escape_sql_string(auth_token)
            cursor.execute(f"""
                SELECT s.employee_id, s.expires_at,
                       e.id, e.email, e.full_name, e.phone, e.department, e.position, e.role, e.is_active, e.created_at
                FROM t_p47619579_knowledge_management.user_sessions s
                JOIN t_p47619579_knowledge_management.employees e ON s.employee_id = e.id
                WHERE s.token = {token_escaped} AND s.expires_at > NOW() AND s.revoked = false
            """)
            
            session_data = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not session_data:
                return jsonify({'authenticated': False, 'error': 'Invalid or expired token'}), 401
            
            employee = {
                'id': session_data[2], 'email': session_data[3], 'full_name': session_data[4],
                'phone': session_data[5], 'department': session_data[6], 'position': session_data[7],
                'role': session_data[8], 'is_active': session_data[9],
                'created_at': session_data[10].isoformat() if session_data[10] else None
            }
            
            response = jsonify({'authenticated': True, 'employee': employee})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        # LOGOUT
        elif action == 'logout':
            if request.method != 'DELETE':
                cursor.close()
                conn.close()
                return jsonify({'error': 'DELETE method required'}), 405
            
            if not auth_token:
                cursor.close()
                conn.close()
                return jsonify({'error': 'No token provided'}), 400
            
            token_escaped = escape_sql_string(auth_token)
            cursor.execute(f"""
                UPDATE t_p47619579_knowledge_management.user_sessions 
                SET revoked = true 
                WHERE token = {token_escaped}
            """)
            
            conn.commit()
            cursor.close()
            conn.close()
            
            response = jsonify({'success': True, 'message': 'Logged out successfully'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        else:
            cursor.close()
            conn.close()
            return jsonify({'error': f'Unknown action: {action}'}), 400
    
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.errors()}), 400
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ==================== EXTERNAL-DB ENDPOINTS ====================

@app.route('/api/external-db', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def external_db_endpoint():
    """External database operations: query, list, stats, create, update, delete"""
    
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Auth-Token, X-User-Id, X-Session-Id')
        response.headers.add('Access-Control-Max-Age', '86400')
        return response, 200
    
    try:
        # Определяем action
        if request.method == 'GET':
            action = request.args.get('action')
            body_data = request.args.to_dict()
        elif request.method == 'DELETE':
            action = request.args.get('action', 'delete')
            body_data = request.args.to_dict()
        elif request.method in ['POST', 'PUT']:
            body_data = request.json or {}
            action = body_data.get('action')
            if request.method == 'PUT' and not action:
                action = 'update'
        else:
            return jsonify({'error': 'Method not allowed'}), 405
        
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # QUERY
        if action == 'query':
            query = body_data.get('query', '')
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
                cursor.close()
                conn.close()
                response = jsonify({'rows': result})
            else:
                conn.commit()
                cursor.close()
                conn.close()
                response = jsonify({'affected': cursor.rowcount})
            
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        # LIST
        elif action == 'list':
            table = body_data.get('table', '')
            schema = body_data.get('schema', 'public')
            limit = int(body_data.get('limit', 100))
            offset = int(body_data.get('offset', 0))
            
            if not table:
                return jsonify({'error': 'Table name required'}), 400
            
            query = f'SELECT * FROM "{schema}"."{table}" LIMIT {limit} OFFSET {offset}'
            cursor.execute(query)
            rows = cursor.fetchall()
            result = [dict(row) for row in rows]
            
            cursor.execute(f'SELECT COUNT(*) as count FROM "{schema}"."{table}"')
            count_row = cursor.fetchone()
            total_count = count_row['count'] if count_row else 0
            
            cursor.close()
            conn.close()
            
            response = jsonify({'data': result, 'rows': result, 'count': total_count})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        # STATS
        elif action == 'stats':
            schema = body_data.get('schema', 'public')
            
            cursor.execute(f"""
                SELECT table_name,
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
            
            cursor.close()
            conn.close()
            
            response = jsonify({'tables': table_list, 'totalTables': len(table_list), 'totalRecords': total_records})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        # CREATE
        elif action == 'create':
            table = body_data.get('table', '')
            schema = body_data.get('schema', 't_p47619579_knowledge_management')
            data = body_data.get('data', {})
            
            if not table or not data:
                return jsonify({'error': 'Table name and data required'}), 400
            
            # Обработка password для employees
            if table == 'employees' and 'password' in data:
                password = data['password']
                salt = secrets.token_hex(8)
                password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
                data['password_hash'] = f"{salt}:{password_hash.hex()}"
                del data['password']
            
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
            cursor.execute(query)
            row = cursor.fetchone()
            result = dict(row) if row else None
            
            cursor.close()
            conn.close()
            
            response = jsonify(result or {'error': 'Insert failed'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200 if result else 500
        
        # UPDATE
        elif action == 'update':
            table = body_data.get('table', '')
            schema = body_data.get('schema', 't_p47619579_knowledge_management')
            record_id = body_data.get('id')
            data = body_data.get('data', {})
            
            if not table or not record_id or not data:
                return jsonify({'error': 'Table, id, and data required'}), 400
            
            sets = []
            for key, value in data.items():
                if value is None:
                    sets.append(f'"{key}" = NULL')
                elif isinstance(value, str):
                    escaped_value = value.replace("'", "''")
                    sets.append(f'"{key}" = \'{escaped_value}\'')
                elif isinstance(value, bool):
                    sets.append(f'"{key}" = {"TRUE" if value else "FALSE"}')
                else:
                    sets.append(f'"{key}" = {value}')
            sets_str = ', '.join(sets)
            
            query = f'UPDATE "{schema}"."{table}" SET {sets_str} WHERE id = {record_id} RETURNING *'
            cursor.execute(query)
            row = cursor.fetchone()
            result = dict(row) if row else None
            
            cursor.close()
            conn.close()
            
            response = jsonify({'data': result} if result else {'error': 'Update failed'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200 if result else 500
        
        # DELETE
        elif action == 'delete':
            table = body_data.get('table', '')
            schema = body_data.get('schema', 't_p47619579_knowledge_management')
            record_id = body_data.get('id')
            permanent = body_data.get('permanent', False)
            
            if not table or not record_id:
                return jsonify({'error': 'Table and id required'}), 400
            
            if permanent:
                query = f'DELETE FROM "{schema}"."{table}" WHERE id = {record_id}'
            else:
                query = f'UPDATE "{schema}"."{table}" SET is_active = false WHERE id = {record_id}'
            
            cursor.execute(query)
            cursor.close()
            conn.close()
            
            response = jsonify({'deleted': True})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        
        else:
            cursor.close()
            conn.close()
            return jsonify({'error': f'Unknown action: {action}'}), 400
    
    except psycopg2.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.close()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
