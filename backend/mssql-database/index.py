import json
import os
import pymssql
from typing import Dict, List, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: API для работы с MS SQL Server базой данных через XTunnel
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: JSON ответ с данными из БД
    """
    method = event.get('httpMethod', 'GET')
    
    # Обработка CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Подключение к MS SQL Server через XTunnel
        conn = pymssql.connect(
            server='xtunnel.ru',
            port=19379,
            user='cloud_user',
            password='YourStrongPassword123!',
            database='master',
            tds_version='7.0',
            timeout=10
        )
        cursor = conn.cursor(as_dict=True)
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'list')
        table = params.get('table', 'employees')
        
        if method == 'GET':
            if action == 'list':
                result = get_table_data(cursor, table)
            elif action == 'get':
                item_id = params.get('id')
                result = get_item_by_id(cursor, table, item_id)
            elif action == 'stats':
                result = get_database_stats(cursor)
            else:
                result = {'error': 'Неизвестное действие'}
                
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            if action == 'create':
                result = create_item(cursor, conn, table, body_data)
            else:
                result = {'error': 'Неизвестное действие для POST'}
                
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            item_id = params.get('id')
            result = update_item(cursor, conn, table, item_id, body_data)
            
        elif method == 'DELETE':
            item_id = params.get('id')
            result = delete_item(cursor, conn, table, item_id)
            
        else:
            result = {'error': f'Метод {method} не поддерживается'}
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        print(f"ERROR in handler: {str(e)}")
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def get_table_data(cursor, table: str) -> Dict[str, Any]:
    """Получить все записи из таблицы"""
    try:
        if table == 'employees':
            cursor.execute("""
                SELECT id, full_name, email, department, position, role, phone, hire_date,
                       is_active, created_at, updated_at
                FROM dbo.employees
                WHERE is_active = 1
                ORDER BY created_at DESC
            """)
        elif table == 'courses':
            cursor.execute("""
                SELECT c.*, e.full_name as instructor_name
                FROM dbo.courses c
                LEFT JOIN dbo.employees e ON c.instructor_id = e.id
                WHERE c.status = 'active'
                ORDER BY c.created_at DESC
            """)
        elif table == 'knowledge_materials':
            cursor.execute("""
                SELECT id, title, description, content, category, difficulty, duration, 
                       tags, rating, enrollments, is_published, created_by, 
                       cover_image, attachments, created_at, updated_at
                FROM dbo.knowledge_materials
                WHERE is_published = 1
                ORDER BY created_at DESC
            """)
        else:
            return {'error': f'Таблица {table} не поддерживается'}
        
        rows = cursor.fetchall()
        
        return {'data': rows, 'count': len(rows)}
        
    except Exception as e:
        return {'error': f'Ошибка получения данных: {str(e)}'}


def get_item_by_id(cursor, table: str, item_id: str) -> Dict[str, Any]:
    """Получить запись по ID"""
    try:
        if not item_id:
            return {'error': 'ID не указан'}
        
        cursor.execute(f"SELECT * FROM dbo.{table} WHERE id = %s", (item_id,))
        row = cursor.fetchone()
        
        if not row:
            return {'error': 'Запись не найдена'}
        
        return {'data': row}
        
    except Exception as e:
        return {'error': f'Ошибка получения записи: {str(e)}'}


def create_item(cursor, conn, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новую запись"""
    try:
        if table == 'employees':
            cursor.execute("""
                INSERT INTO dbo.employees (full_name, email, department, position, role, phone, hire_date, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 1);
                SELECT SCOPE_IDENTITY() AS id;
            """, (
                data.get('full_name'),
                data.get('email'),
                data.get('department'),
                data.get('position'),
                data.get('role', 'employee'),
                data.get('phone'),
                data.get('hire_date')
            ))
            new_id = cursor.fetchone()['id']
        elif table == 'knowledge_materials':
            cursor.execute("""
                INSERT INTO dbo.knowledge_materials 
                (title, description, content, category, difficulty, duration, tags, rating, 
                 enrollments, is_published, created_by, cover_image, attachments)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                SELECT SCOPE_IDENTITY() AS id;
            """, (
                data.get('title'),
                data.get('description'),
                data.get('content'),
                data.get('category'),
                data.get('difficulty', 'medium'),
                data.get('duration'),
                json.dumps(data.get('tags', [])),
                data.get('rating', 0),
                data.get('enrollments', 0),
                data.get('is_published', True),
                data.get('created_by'),
                data.get('cover_image'),
                json.dumps(data.get('attachments', []))
            ))
            new_id = cursor.fetchone()['id']
        else:
            return {'error': f'Создание для таблицы {table} не поддерживается'}
        
        conn.commit()
        
        return {'data': {'id': new_id}, 'message': 'Запись создана успешно'}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания записи: {str(e)}'}


def update_item(cursor, conn, table: str, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить запись"""
    try:
        if not item_id:
            return {'error': 'ID не указан'}
        
        if table == 'employees':
            cursor.execute("""
                UPDATE dbo.employees 
                SET full_name = %s, email = %s, department = %s, position = %s, 
                    role = %s, phone = %s, hire_date = %s, updated_at = GETDATE()
                WHERE id = %s
            """, (
                data.get('full_name'),
                data.get('email'),
                data.get('department'),
                data.get('position'),
                data.get('role'),
                data.get('phone'),
                data.get('hire_date'),
                item_id
            ))
        else:
            return {'error': f'Обновление для таблицы {table} не поддерживается'}
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {'error': 'Запись не найдена'}
        
        return {'message': 'Запись обновлена успешно'}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления записи: {str(e)}'}


def delete_item(cursor, conn, table: str, item_id: str) -> Dict[str, Any]:
    """Удалить запись (мягкое удаление)"""
    try:
        if not item_id:
            return {'error': 'ID не указан'}
        
        cursor.execute(f"""
            UPDATE dbo.{table} 
            SET is_active = 0, updated_at = GETDATE()
            WHERE id = %s
        """, (item_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {'error': 'Запись не найдена'}
        
        return {'message': 'Запись удалена успешно'}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка удаления записи: {str(e)}'}


def get_database_stats(cursor) -> Dict[str, Any]:
    """Получить статистику базы данных"""
    try:
        stats = {}
        
        # Количество сотрудников
        cursor.execute("SELECT COUNT(*) FROM dbo.employees WHERE is_active = 1")
        stats['employees_count'] = cursor.fetchone()[0]
        
        # Количество курсов
        cursor.execute("SELECT COUNT(*) FROM dbo.courses WHERE status = 'active'")
        stats['courses_count'] = cursor.fetchone()[0]
        
        # Количество материалов
        cursor.execute("SELECT COUNT(*) FROM dbo.knowledge_materials WHERE is_published = 1")
        stats['materials_count'] = cursor.fetchone()[0]
        
        return {'stats': stats}
        
    except Exception as e:
        return {'error': f'Ошибка получения статистики: {str(e)}'}