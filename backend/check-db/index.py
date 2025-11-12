'''
Temporary function to check database contents
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
        cursor = conn.cursor()
        
        # Получаем список всех сотрудников
        cursor.execute("""
            SELECT id, email, full_name, role, is_active 
            FROM t_p47619579_knowledge_management.employees 
            ORDER BY id
            LIMIT 20
        """)
        
        employees = []
        for row in cursor.fetchall():
            employees.append({
                'id': row[0],
                'email': row[1],
                'full_name': row[2],
                'role': row[3],
                'is_active': row[4]
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
                'database_host': database_url.split('@')[1].split('/')[0] if '@' in database_url else 'unknown',
                'employees_count': len(employees),
                'employees': employees
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