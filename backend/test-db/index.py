import json

def handler(event, context):
    """
    Простая тестовая функция для проверки подключения к БД
    Args: event с httpMethod, body, queryStringParameters
    Returns: Базовая информация о подключении
    """
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Простой тест
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Test OK'}),
        'isBase64Encoded': False
    }