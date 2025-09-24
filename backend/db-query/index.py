import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Execute read-only SQL queries on the database
    Args: event - dict with httpMethod, body containing query and max_rows
          context - object with request_id, function_name attributes  
    Returns: HTTP response with query results
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
        query = body_data.get('query', '').strip()
        max_rows = body_data.get('max_rows', 100)
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Query is required'}),
                'isBase64Encoded': False
            }
        
        # Security check: only allow SELECT queries
        query_upper = query.upper().strip()
        if not query_upper.startswith('SELECT'):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Only SELECT queries are allowed'}),
                'isBase64Encoded': False
            }
        
        # Check for potentially dangerous keywords
        dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE']
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Keyword {keyword} is not allowed in read-only queries'}),
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
        cur = conn.cursor()
        
        # Execute query with limit
        limited_query = f"{query} LIMIT {max_rows}"
        cur.execute(limited_query)
        
        # Fetch results
        rows = cur.fetchall()
        
        # Get column names
        columns = [desc[0] for desc in cur.description] if cur.description else []
        
        # Convert to list of dictionaries
        results = []
        for row in rows:
            row_dict = {}
            for i, col_name in enumerate(columns):
                # Handle special data types
                value = row[i]
                if hasattr(value, 'isoformat'):  # datetime objects
                    value = value.isoformat()
                row_dict[col_name] = value
            results.append(row_dict)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'rows': results,
                'columns': columns,
                'row_count': len(results)
            }),
            'isBase64Encoded': False
        }
        
    except psycopg2.Error as e:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }