'''
Business: API для управления материалами базы знаний и подразделами
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name
Returns: HTTP response dict
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import ssl

def setup_ssl_cert():
    """Download and setup SSL certificate for TimeWeb Cloud PostgreSQL"""
    import os
    cert_dir = '/tmp/.postgresql'
    cert_path = f'{cert_dir}/root.crt'
    
    if not os.path.exists(cert_path):
        os.makedirs(cert_dir, exist_ok=True)
        cert_url = 'https://st.timeweb.com/cloud-static/ca.crt'
        urllib.request.urlretrieve(cert_url, cert_path)
    
    os.environ['PGSSLROOTCERT'] = cert_path

def get_db_connection():
    '''Создает подключение к базе данных'''
    dsn = os.environ.get('EXTERNAL_DATABASE_URL')
    return psycopg2.connect(dsn)

def escape_sql_string(value: str) -> str:
    '''Экранирует строку для использования в SQL'''
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    setup_ssl_cert()
    method: str = event.get('httpMethod', 'GET')
    
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
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            
            if action == 'subsection':
                subsection_name = params.get('name', '')
                query = f"SELECT content FROM t_p47619579_knowledge_management.knowledge_subsections WHERE subsection_name = {escape_sql_string(subsection_name)}"
                cur.execute(query)
                result = cur.fetchone()
                content = result['content'] if result else ''
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'content': content})
                }
            
            else:
                category = params.get('category', '')
                query = "SELECT * FROM t_p47619579_knowledge_management.knowledge_materials WHERE 1=1"
                
                if category:
                    query += f" AND category = {escape_sql_string(category)}"
                
                query += " ORDER BY created_at DESC"
                
                cur.execute(query)
                materials = cur.fetchall()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(m) for m in materials], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'save_subsection':
                subsection_name = body_data.get('subsection_name')
                content = body_data.get('content')
                
                query = f"SELECT id FROM t_p47619579_knowledge_management.knowledge_subsections WHERE subsection_name = {escape_sql_string(subsection_name)}"
                cur.execute(query)
                existing = cur.fetchone()
                
                if existing:
                    query = f"""UPDATE t_p47619579_knowledge_management.knowledge_subsections 
                                SET content = {escape_sql_string(content)}, updated_at = CURRENT_TIMESTAMP 
                                WHERE subsection_name = {escape_sql_string(subsection_name)}"""
                    cur.execute(query)
                else:
                    query = f"""INSERT INTO t_p47619579_knowledge_management.knowledge_subsections (subsection_name, content) 
                                VALUES ({escape_sql_string(subsection_name)}, {escape_sql_string(content)})"""
                    cur.execute(query)
                
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
                    'body': json.dumps({'success': True})
                }
            
            else:
                title = body_data.get('title')
                description = body_data.get('description', '')
                content = body_data.get('content')
                category = body_data.get('category')
                difficulty = body_data.get('difficulty', 'medium')
                duration = body_data.get('duration', '')
                tags = body_data.get('tags', [])
                created_by = body_data.get('created_by', '')
                cover_image = body_data.get('cover_image', '')
                departments = body_data.get('departments', [])
                
                tags_array = "ARRAY[" + ",".join([escape_sql_string(t) for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
                departments_array = "ARRAY[" + ",".join([escape_sql_string(d) for d in departments]) + "]::text[]" if departments else "ARRAY[]::text[]"
                
                query = f"""INSERT INTO t_p47619579_knowledge_management.knowledge_materials 
                        (title, description, content, category, difficulty, duration, tags, created_by, cover_image, departments)
                        VALUES ({escape_sql_string(title)}, {escape_sql_string(description)}, {escape_sql_string(content)}, 
                                {escape_sql_string(category)}, {escape_sql_string(difficulty)}, {escape_sql_string(duration)}, 
                                {tags_array}, {escape_sql_string(created_by)}, {escape_sql_string(cover_image)}, 
                                {departments_array}) 
                        RETURNING id"""
                
                cur.execute(query)
                new_id = cur.fetchone()['id']
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': new_id, 'success': True})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            material_id = body_data.get('id')
            
            fields_to_update = []
            
            for field in ['title', 'description', 'content', 'category', 'difficulty', 'duration', 'cover_image']:
                if field in body_data:
                    fields_to_update.append(f"{field} = {escape_sql_string(body_data[field])}")
            
            if 'tags' in body_data:
                tags = body_data['tags']
                tags_array = "ARRAY[" + ",".join([escape_sql_string(t) for t in tags]) + "]::text[]" if tags else "ARRAY[]::text[]"
                fields_to_update.append(f"tags = {tags_array}")
            
            if 'departments' in body_data:
                departments = body_data['departments']
                departments_array = "ARRAY[" + ",".join([escape_sql_string(d) for d in departments]) + "]::text[]" if departments else "ARRAY[]::text[]"
                fields_to_update.append(f"departments = {departments_array}")
            
            if fields_to_update:
                fields_to_update.append("updated_at = CURRENT_TIMESTAMP")
                
                query = f"UPDATE t_p47619579_knowledge_management.knowledge_materials SET {', '.join(fields_to_update)} WHERE id = {material_id}"
                cur.execute(query)
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
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            material_id = body_data.get('id')
            
            query = f"DELETE FROM t_p47619579_knowledge_management.knowledge_materials WHERE id = {material_id}"
            cur.execute(query)
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
                'body': json.dumps({'success': True})
            }
            
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
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