import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Get database structure information (schemas, tables, columns)
    Args: event - dict with httpMethod, body containing level and optional schema/table names
          context - object with request_id, function_name attributes
    Returns: HTTP response with database structure data
    """
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Parse request body
        body_data = json.loads(event.get('body', '{}'))
        level = body_data.get('level', 'database')
        schema_name = body_data.get('schema_name', 'public')
        table_name = body_data.get('table_name')
        
        # Mock response since we don't have DATABASE_URL configured yet
        if level == 'database':
            result = {'tables': [
                {'table_name': 'employees', 'row_count': 25},
                {'table_name': 'users', 'row_count': 12},
                {'table_name': 'courses', 'row_count': 8}
            ]}
        elif level == 'table' and table_name:
            result = {'columns': [
                {'column_name': 'id', 'data_type': 'integer', 'is_nullable': 'NO', 'column_default': "nextval('employees_id_seq'::regclass)"},
                {'column_name': 'name', 'data_type': 'varchar', 'is_nullable': 'NO', 'column_default': None},
                {'column_name': 'email', 'data_type': 'varchar', 'is_nullable': 'YES', 'column_default': None},
                {'column_name': 'created_at', 'data_type': 'timestamp', 'is_nullable': 'NO', 'column_default': 'CURRENT_TIMESTAMP'}
            ]}
        else:
            result = {'error': 'Invalid level or missing table_name'}
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }