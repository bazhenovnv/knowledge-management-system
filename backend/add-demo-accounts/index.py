'''
Add demo accounts to the auth database
'''
import json
import os
import psycopg2
import urllib.request
from typing import Dict, Any

def setup_ssl_cert():
    """Download and setup SSL certificate for TimeWeb Cloud PostgreSQL"""
    cert_dir = '/tmp/.postgresql'
    cert_path = f'{cert_dir}/root.crt'
    
    if not os.path.exists(cert_path):
        os.makedirs(cert_dir, exist_ok=True)
        cert_url = 'https://st.timeweb.com/cloud-static/ca.crt'
        urllib.request.urlretrieve(cert_url, cert_path)
    
    os.environ['PGSSLROOTCERT'] = cert_path

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        setup_ssl_cert()
        database_url = os.environ.get('DATABASE_CONNECTION_TIMEWEB') or os.environ.get('EXTERNAL_DATABASE_URL_FINAL')
        
        conn = psycopg2.connect(database_url)
        conn.set_session(autocommit=False)
        cursor = conn.cursor()
        
        # Удаляем старые demo аккаунты если есть
        cursor.execute("""
            DELETE FROM t_p47619579_knowledge_management.employees 
            WHERE email IN ('admin@example.com', 'teacher@example.com', 'employee@example.com')
        """)
        
        # Добавляем новые demo аккаунты
        cursor.execute("""
            INSERT INTO t_p47619579_knowledge_management.employees 
            (email, password_hash, full_name, department, position, role, is_active, created_at)
            VALUES 
            ('admin@example.com', 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 
             'Администратор Системы', 'IT', 'Системный администратор', 'admin', true, NOW()),
            ('teacher@example.com', 'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
             'Преподаватель Тестовый', 'Образование', 'Старший преподаватель', 'teacher', true, NOW()),
            ('employee@example.com', 'c3d4e5f6789a1b2c:bcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
             'Сотрудник Тестовый', 'Общий отдел', 'Специалист', 'employee', true, NOW())
        """)
        
        conn.commit()
        
        # Проверяем что аккаунты добавились
        cursor.execute("""
            SELECT id, email, full_name, role 
            FROM t_p47619579_knowledge_management.employees 
            WHERE email LIKE '%example.com'
            ORDER BY email
        """)
        
        added_accounts = []
        for row in cursor.fetchall():
            added_accounts.append({
                'id': row[0],
                'email': row[1],
                'full_name': row[2],
                'role': row[3]
            })
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Demo accounts added successfully',
                'accounts': added_accounts
            }, ensure_ascii=False),
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
