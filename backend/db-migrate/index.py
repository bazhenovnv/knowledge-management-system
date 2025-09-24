import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Apply database migrations to update schema
    Args: event - dict with httpMethod, body containing migration_content and optional migration_name
          context - object with request_id, function_name attributes
    Returns: HTTP response with migration result
    """
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        migration_content = body_data.get('migration_content', '').strip()
        migration_name = body_data.get('migration_name', '')
        
        if not migration_content:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Migration content is required'}),
                'isBase64Encoded': False
            }
        
        # Get database connection
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database URL not configured'}),
                'isBase64Encoded': False
            }
        
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = False  # Use transactions
        cur = conn.cursor()
        
        try:
            # Execute migration SQL
            cur.execute(migration_content)
            conn.commit()
            
            # Generate migration filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            if migration_name:
                filename = f"V{timestamp}__{migration_name}.sql"
            else:
                filename = f"V{timestamp}__migration.sql"
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'migration_file': filename,
                    'message': 'Migration executed successfully'
                }),
                'isBase64Encoded': False
            }
            
        except psycopg2.Error as e:
            conn.rollback()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Migration failed: {str(e)}'}),
                'isBase64Encoded': False
            }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }