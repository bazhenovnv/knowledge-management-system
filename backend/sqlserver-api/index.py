"""
Business: API для работы с SQL Server базой данных через Cloudflare туннель
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: JSON ответ с данными из БД
"""

import json
import urllib.request
import urllib.parse
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # Обработка CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # URL локального API сервера через Cloudflare туннель
    TUNNEL_URL = 'https://dragon-engaging-icons-lot.trycloudflare.com'
    
    try:
        params = event.get('queryStringParameters') or {}
        query_text = params.get('query', '')
        
        if method == 'GET':
            # Формируем URL с параметрами
            if query_text:
                url = f"{TUNNEL_URL}?query={urllib.parse.quote(query_text)}"
            else:
                url = TUNNEL_URL
            
            # Отправляем GET запрос
            req = urllib.request.Request(url, method='GET')
            req.add_header('Content-Type', 'application/json')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
        
        elif method == 'POST':
            # Читаем тело запроса
            body_data = json.loads(event.get('body', '{}'))
            
            # Отправляем POST запрос
            data = json.dumps(body_data).encode('utf-8')
            req = urllib.request.Request(TUNNEL_URL, data=data, method='POST')
            req.add_header('Content-Type', 'application/json')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
        
        else:
            result = {'error': f'Метод {method} не поддерживается'}
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': error_body,
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'tunnel_url': TUNNEL_URL
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }