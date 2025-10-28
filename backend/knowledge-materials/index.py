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

def get_db_connection():
    '''Создает подключение к базе данных'''
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            
            if action == 'subsection':
                subsection_name = params.get('name', '')
                cur.execute(
                    "SELECT content FROM t_p47619579_knowledge_management.knowledge_subsections WHERE subsection_name = %s",
                    (subsection_name,)
                )
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
                    query += f" AND category = '{category}'"
                
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
                
                cur.execute(
                    "SELECT id FROM t_p47619579_knowledge_management.knowledge_subsections WHERE subsection_name = %s",
                    (subsection_name,)
                )
                existing = cur.fetchone()
                
                if existing:
                    cur.execute(
                        "UPDATE t_p47619579_knowledge_management.knowledge_subsections SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE subsection_name = %s",
                        (content, subsection_name)
                    )
                else:
                    cur.execute(
                        "INSERT INTO t_p47619579_knowledge_management.knowledge_subsections (subsection_name, content) VALUES (%s, %s)",
                        (subsection_name, content)
                    )
                
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
                
                cur.execute(
                    """INSERT INTO t_p47619579_knowledge_management.knowledge_materials 
                    (title, description, content, category, difficulty, duration, tags, created_by, cover_image, departments)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                    (title, description, content, category, difficulty, duration, tags, created_by, cover_image, departments)
                )
                
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
            values = []
            
            for field in ['title', 'description', 'content', 'category', 'difficulty', 'duration', 'cover_image']:
                if field in body_data:
                    fields_to_update.append(f"{field} = %s")
                    values.append(body_data[field])
            
            for field in ['tags', 'departments']:
                if field in body_data:
                    fields_to_update.append(f"{field} = %s")
                    values.append(body_data[field])
            
            if fields_to_update:
                fields_to_update.append("updated_at = CURRENT_TIMESTAMP")
                values.append(material_id)
                
                query = f"UPDATE t_p47619579_knowledge_management.knowledge_materials SET {', '.join(fields_to_update)} WHERE id = %s"
                cur.execute(query, values)
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
            
            cur.execute(
                "DELETE FROM t_p47619579_knowledge_management.knowledge_materials WHERE id = %s",
                (material_id,)
            )
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
