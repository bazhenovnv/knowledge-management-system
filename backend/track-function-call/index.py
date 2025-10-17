'''
Business: Отслеживает вызовы cloud функций и обновляет статистику
Args: event с httpMethod; context с request_id
Returns: HTTP response с обновленной статистикой
'''

import json
import os
from datetime import datetime
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        current_month = datetime.now().strftime('%Y-%m')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO function_call_stats (month_year, call_count, updated_at)
            VALUES (%s, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (month_year) 
            DO UPDATE SET 
                call_count = function_call_stats.call_count + 1,
                updated_at = CURRENT_TIMESTAMP
            RETURNING call_count
        """, (current_month,))
        
        result = cur.fetchone()
        call_count = result[0] if result else 0
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'month': current_month,
                'call_count': call_count
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
