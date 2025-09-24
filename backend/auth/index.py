import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, ValidationError, Field
from typing import Dict, Any, Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    role: str = Field(default='employee', pattern='^(admin|manager|employee)$')

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: Optional[bool] = False

def generate_token() -> str:
    """Generate secure random token for user session"""
    return secrets.token_urlsafe(32)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Unified authentication API for registration, login, check, and logout
    Args: event with httpMethod, body, headers, queryStringParameters; context with request_id
    Returns: HTTP response based on action parameter
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Get action from query parameters or body
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'check')
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', action)
        
        # Get auth token from header
        headers = event.get('headers', {})
        auth_token = headers.get('X-Auth-Token')
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database connection not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if action == 'register':
            if method != 'POST':
                return {
                    'statusCode': 405,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'POST method required for registration'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            register_data = RegisterRequest(**body_data)
            
            # Check if email already exists
            cursor.execute("SELECT id FROM employees WHERE email = %s", (register_data.email,))
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email already registered'}),
                    'isBase64Encoded': False
                }
            
            # Hash password and create employee
            password_hash = hashlib.sha256(register_data.password.encode()).hexdigest()
            
            cursor.execute("""
                INSERT INTO employees (email, password_hash, full_name, phone, department, position, role, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, email, full_name, phone, department, position, role, is_active, created_at
            """, (
                register_data.email, password_hash, register_data.full_name,
                register_data.phone, register_data.department, register_data.position,
                register_data.role, True
            ))
            
            employee_data = cursor.fetchone()
            if not employee_data:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Failed to create employee'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cursor.close()
            conn.close()
            
            employee = {
                'id': employee_data[0], 'email': employee_data[1], 'full_name': employee_data[2],
                'phone': employee_data[3], 'department': employee_data[4], 'position': employee_data[5],
                'role': employee_data[6], 'is_active': employee_data[7],
                'created_at': employee_data[8].isoformat() if employee_data[8] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True, 'message': 'Employee registered successfully', 'employee': employee
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            if method != 'POST':
                return {
                    'statusCode': 405,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'POST method required for login'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            login_data = LoginRequest(**body_data)
            
            password_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
            
            cursor.execute("""
                SELECT id, email, password_hash, full_name, phone, department, position, role, is_active, avatar_url, theme
                FROM employees 
                WHERE email = %s AND password_hash = %s AND is_active = true
            """, (login_data.email, password_hash))
            
            employee_data = cursor.fetchone()
            if not employee_data:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid email or password'}),
                    'isBase64Encoded': False
                }
            
            employee_id = employee_data[0]
            session_token = generate_token()
            expires_hours = 168 if login_data.remember_me else 24
            expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
            
            headers_req = event.get('headers', {})
            user_agent = headers_req.get('User-Agent', 'Unknown')
            request_context = event.get('requestContext', {})
            identity = request_context.get('identity', {})
            source_ip = identity.get('sourceIp', '127.0.0.1')
            
            cursor.execute("""
                INSERT INTO user_sessions (employee_id, token, expires_at, user_agent, ip_address)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, created_at
            """, (employee_id, session_token, expires_at, user_agent, source_ip))
            
            session_data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            employee = {
                'id': employee_data[0], 'email': employee_data[1], 'full_name': employee_data[3],
                'phone': employee_data[4], 'department': employee_data[5], 'position': employee_data[6],
                'role': employee_data[7], 'is_active': employee_data[8], 'avatar_url': employee_data[9],
                'theme': employee_data[10]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True, 'message': 'Login successful', 'employee': employee,
                    'session': {
                        'token': session_token, 'expires_at': expires_at.isoformat(),
                        'session_id': session_data[0]
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'check':
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                auth_token = body_data.get('token', auth_token)
            
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication token required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                SELECT s.id as session_id, s.employee_id, s.expires_at, e.id, e.email, e.full_name,
                       e.phone, e.department, e.position, e.role, e.is_active, e.avatar_url, e.theme
                FROM user_sessions s
                JOIN employees e ON s.employee_id = e.id
                WHERE s.token = %s AND s.expires_at > %s AND e.is_active = true
            """, (auth_token, datetime.utcnow()))
            
            session_data = cursor.fetchone()
            if not session_data:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired token'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (session_data[0],))
            conn.commit()
            cursor.close()
            conn.close()
            
            employee = {
                'id': session_data[3], 'email': session_data[4], 'full_name': session_data[5],
                'phone': session_data[6], 'department': session_data[7], 'position': session_data[8],
                'role': session_data[9], 'is_active': session_data[10], 'avatar_url': session_data[11],
                'theme': session_data[12]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True, 'authenticated': True, 'employee': employee,
                    'session': {'session_id': session_data[0], 'employee_id': session_data[1],
                               'expires_at': session_data[2].isoformat() if session_data[2] else None}
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'logout':
            all_sessions = False
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                if body_data.get('token'):
                    auth_token = body_data.get('token')
                all_sessions = body_data.get('all_sessions', False)
            
            if not auth_token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication token required'}),
                    'isBase64Encoded': False
                }
            
            if all_sessions:
                cursor.execute("SELECT employee_id FROM user_sessions WHERE token = %s", (auth_token,))
                result = cursor.fetchone()
                if result:
                    employee_id = result[0]
                    cursor.execute("DELETE FROM user_sessions WHERE employee_id = %s", (employee_id,))
                    deleted_count = cursor.rowcount
                else:
                    deleted_count = 0
            else:
                cursor.execute("DELETE FROM user_sessions WHERE token = %s", (auth_token,))
                deleted_count = cursor.rowcount
            
            conn.commit()
            cursor.close()
            conn.close()
            
            if deleted_count == 0:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'message': 'Session not found or already expired'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Logout successful. {"All sessions" if all_sessions else "Session"} invalidated.',
                    'sessions_deleted': deleted_count
                }),
                'isBase64Encoded': False
            }
        
        else:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Unknown action: {action}. Use register, login, check, or logout'}),
                'isBase64Encoded': False
            }
        
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Validation error', 'details': e.errors()}),
            'isBase64Encoded': False
        }
        
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database error', 'message': str(e)}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error', 'message': str(e), 'request_id': context.request_id}),
            'isBase64Encoded': False
        }