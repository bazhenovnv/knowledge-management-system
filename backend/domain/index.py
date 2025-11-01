'''
Business: Управление доменом проекта - добавление и получение информации о подключенном домене
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с информацией о домене
'''

import json
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import os

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Database connection
    dsn = os.environ.get('EXTERNAL_DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # GET - получить текущий домен
        if method == 'GET':
            cur.execute('SELECT domain_name, connected_at, ssl_enabled FROM domains ORDER BY connected_at DESC LIMIT 1')
            domain = cur.fetchone()
            
            if domain:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'domain': domain['domain_name'],
                        'connectedAt': domain['connected_at'].isoformat() if domain['connected_at'] else None,
                        'sslEnabled': domain['ssl_enabled']
                    }, default=str)
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'No domain connected'})
                }
        
        # POST - подключить новый домен
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            domain_name = body.get('domain')
            
            if not domain_name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Domain name is required'})
                }
            
            # Удалить старые домены и добавить новый
            cur.execute('DELETE FROM domains')
            cur.execute(
                'INSERT INTO domains (domain_name, ssl_enabled) VALUES (%s, %s) RETURNING id, domain_name, connected_at, ssl_enabled',
                (domain_name, True)
            )
            new_domain = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'domain': new_domain['domain_name'],
                    'connectedAt': new_domain['connected_at'].isoformat() if new_domain['connected_at'] else None,
                    'sslEnabled': new_domain['ssl_enabled']
                }, default=str)
            }
        
        # DELETE - отключить домен
        elif method == 'DELETE':
            cur.execute('DELETE FROM domains')
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Domain disconnected'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cur.close()
        conn.close()