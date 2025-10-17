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
        
        body_str = event.get('body')
        if body_str and body_str.strip():
            body = json.loads(body_str)
        else:
            body = {}
        function_name = body.get('function_name', 'unknown')
        response_time = body.get('response_time', 0)
        is_error = body.get('is_error', False)
        
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
        
        cur.execute("""
            INSERT INTO function_calls_detailed 
                (function_name, month_year, call_count, avg_response_time, error_count, updated_at)
            VALUES (%s, %s, 1, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (function_name, month_year) 
            DO UPDATE SET 
                call_count = function_calls_detailed.call_count + 1,
                avg_response_time = (function_calls_detailed.avg_response_time * function_calls_detailed.call_count + %s) / (function_calls_detailed.call_count + 1),
                error_count = function_calls_detailed.error_count + %s,
                updated_at = CURRENT_TIMESTAMP
        """, (function_name, current_month, response_time, 1 if is_error else 0, response_time, 1 if is_error else 0))
        
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