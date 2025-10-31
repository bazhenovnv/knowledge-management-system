import json
import os
import psycopg2
import hashlib
import secrets
import requests
from psycopg2.extras import RealDictCursor
from datetime import datetime
from typing import Dict, List, Any, Optional

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{password_hash.hex()}"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: API для работы с базой данных PostgreSQL системы управления знаниями
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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL не найден в переменных окружения")
        
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'list')
        table = params.get('table', 'employees')
        
        if method == 'GET':
            if action == 'list':
                result = get_table_data(cursor, table)
            elif action == 'list_inactive':
                result = get_inactive_employees(cursor)
            elif action == 'get':
                item_id = params.get('id')
                result = get_item_by_id(cursor, table, item_id)
            elif action == 'get_test_full':
                test_id = params.get('id')
                result = get_test_with_questions(cursor, test_id)
            elif action == 'get_test_results':
                test_id = params.get('test_id')
                employee_id = params.get('employee_id')
                result = get_test_results(cursor, test_id, employee_id)
            elif action == 'get_notifications':
                employee_id = params.get('employee_id')
                result = get_notifications(cursor, employee_id)
            elif action == 'get_unread_count':
                employee_id = params.get('employee_id')
                result = get_unread_notifications_count(cursor, employee_id)
            elif action == 'stats':
                result = get_database_stats(cursor)
            elif action == 'get_db_stats':
                result = get_db_request_stats(cursor)
            elif action == 'get_support_messages':
                employee_id = params.get('employee_id')
                result = get_support_messages(cursor, int(employee_id) if employee_id else None)
            elif action == 'get_unread_support_count':
                result = get_unread_support_count(cursor)
            elif action == 'check_updates':
                employee_id = params.get('employee_id')
                is_admin = params.get('is_admin', 'false').lower() == 'true'
                result = check_updates(cursor, employee_id, is_admin)
            elif action == 'get_subsections':
                result = get_subsections(cursor)
            elif action == 'get_instructions':
                result = get_instructions(cursor)
            elif action == 'get_instruction_categories':
                result = get_instruction_categories(cursor)
            elif action == 'get_conferences':
                result = get_conferences(cursor)
            elif action == 'get_conference':
                conference_id = params.get('id')
                result = get_conference(cursor, conference_id)
            else:
                result = {'error': 'Неизвестное действие'}
                
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            if action == 'create':
                result = create_item(cursor, conn, table, body_data)
            elif action == 'create_test_full':
                result = create_test_with_questions(cursor, conn, body_data)
            elif action == 'submit_test':
                result = submit_test_results(cursor, conn, body_data)
            elif action == 'create_notification':
                result = create_notification(cursor, conn, body_data)
            elif action == 'mark_read':
                notification_id = body_data.get('notification_id')
                result = mark_notification_read(cursor, conn, notification_id)
            elif action == 'mark_all_read':
                employee_id = body_data.get('employee_id')
                result = mark_all_notifications_read(cursor, conn, employee_id)
            elif action == 'create_support_message':
                result = create_support_message(cursor, conn, body_data)
            elif action == 'mark_support_read':
                employee_id = body_data.get('employee_id')
                result = mark_support_messages_read(cursor, conn, int(employee_id))
            elif action == 'ai_search_knowledge':
                result = ai_search_knowledge(body_data)
            elif action == 'save_subsection':
                result = save_subsection(cursor, conn, body_data)
            elif action == 'create_instruction':
                result = create_instruction(cursor, conn, body_data)
            elif action == 'create_instruction_category':
                result = create_instruction_category(cursor, conn, body_data)
            elif action == 'create_conference':
                result = create_conference(cursor, conn, body_data)
            elif action == 'join_conference':
                result = join_conference(cursor, conn, body_data)
            elif action == 'leave_conference':
                result = leave_conference(cursor, conn, body_data)
            elif action == 'seed':
                result = seed_database(cursor, conn)
            else:
                result = {'error': 'Неизвестное действие для POST'}
                
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            item_id = params.get('id')
            if action == 'update_test_full':
                result = update_test_with_questions(cursor, conn, item_id, body_data)
            elif action == 'update_instruction':
                result = update_instruction(cursor, conn, body_data)
            elif action == 'update_instruction_category':
                result = update_instruction_category(cursor, conn, body_data)
            elif action == 'update_conference':
                result = update_conference(cursor, conn, body_data)
            else:
                result = update_item(cursor, conn, table, item_id, body_data)
            
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}')) if event.get('body') else {}
            item_id = params.get('id') or body_data.get('id')
            permanent = params.get('permanent', 'false').lower() == 'true'
            
            if action == 'delete_instruction':
                result = delete_instruction(cursor, conn, int(item_id))
            elif action == 'delete_instruction_category':
                result = delete_instruction_category(cursor, conn, int(item_id))
            elif permanent:
                result = permanent_delete_item(cursor, conn, table, item_id)
            else:
                result = delete_item(cursor, conn, table, item_id)
            
        else:
            result = {'error': f'Метод {method} не поддерживается'}
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id'
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def get_table_data(cursor, table: str) -> Dict[str, Any]:
    """Получить все записи из таблицы"""
    try:
        schema = 't_p47619579_knowledge_management'
        if table == 'employees':
            cursor.execute(f"""
                SELECT id, full_name, email, department, position, role, phone, hire_date,
                       zoom_link, is_active, created_at, updated_at
                FROM {schema}.employees
                ORDER BY is_active DESC, created_at DESC
            """)
        elif table == 'courses':
            cursor.execute(f"""
                SELECT c.*, e.full_name as instructor_name
                FROM {schema}.courses c
                LEFT JOIN {schema}.employees e ON c.instructor_id = e.id
                WHERE c.status = 'active'
                ORDER BY c.created_at DESC
            """)
        elif table == 'knowledge_materials':
            cursor.execute(f"""
                SELECT id, title, description, content, category, difficulty, duration, 
                       tags, rating, enrollments, is_published, created_by, 
                       cover_image, attachments, created_at, updated_at
                FROM {schema}.knowledge_materials
                WHERE is_published = true
                ORDER BY created_at DESC
            """)
        elif table == 'tests':
            cursor.execute(f"""
                SELECT t.*, 
                       e.full_name as creator_name,
                       c.title as course_title,
                       (SELECT COUNT(*) FROM {schema}.test_questions WHERE test_id = t.id) as questions_count,
                       (SELECT COUNT(*) FROM {schema}.test_results WHERE test_id = t.id) as results_count
                FROM {schema}.tests t
                LEFT JOIN {schema}.employees e ON t.creator_id = e.id
                LEFT JOIN {schema}.courses c ON t.course_id = c.id
                WHERE t.is_active = true
                ORDER BY t.created_at DESC
            """)
        else:
            cursor.execute(f"SELECT * FROM {schema}.{table} ORDER BY created_at DESC")
            
        rows = cursor.fetchall()
        return {'data': [dict(row) for row in rows], 'count': len(rows)}
    except Exception as e:
        return {'error': f'Ошибка получения данных из {table}: {str(e)}'}


def get_inactive_employees(cursor) -> Dict[str, Any]:
    """Получить неактивных сотрудников"""
    try:
        schema = 't_p47619579_knowledge_management'
        cursor.execute(f"""
            SELECT id, full_name, email, department, position, role, phone, hire_date,
                   zoom_link, is_active, created_at, updated_at
            FROM {schema}.employees
            WHERE is_active = false
            ORDER BY updated_at DESC
        """)
        rows = cursor.fetchall()
        return {'data': [dict(row) for row in rows], 'count': len(rows)}
    except Exception as e:
        return {'error': f'Ошибка получения неактивных сотрудников: {str(e)}'}


def get_item_by_id(cursor, table: str, item_id: str) -> Dict[str, Any]:
    """Получить запись по ID"""
    try:
        schema = 't_p47619579_knowledge_management'
        cursor.execute(f"SELECT * FROM {schema}.{table} WHERE id = %s", (item_id,))
        row = cursor.fetchone()
        if row:
            return {'data': dict(row)}
        else:
            return {'error': 'Запись не найдена'}
    except Exception as e:
        return {'error': f'Ошибка получения записи: {str(e)}'}


def create_item(cursor, conn, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новую запись"""
    try:
        if table == 'employees':
            cursor.execute("""
                INSERT INTO t_p47619579_knowledge_management.employees (email, password_hash, full_name, phone, 
                                     department, position, role, hire_date, zoom_link, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, full_name, email, department, position, role, phone, hire_date, zoom_link, is_active, created_at
            """, (
                data.get('email'),
                hash_password(data.get('password', 'temp123')),
                data.get('name', data.get('full_name')),
                data.get('phone'),
                data.get('department'),
                data.get('position'),
                data.get('role', 'employee'),
                data.get('hire_date'),
                data.get('zoom_link'),
                True
            ))
        elif table == 'courses':
            cursor.execute("""
                INSERT INTO t_p47619579_knowledge_management.courses (title, description, instructor_id, start_date, 
                                   end_date, duration_hours, max_participants, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, title, description, instructor_id, created_at
            """, (
                data.get('title'),
                data.get('description'),
                data.get('instructor_id'),
                data.get('start_date'),
                data.get('end_date'),
                data.get('duration_hours'),
                data.get('max_participants'),
                data.get('status', 'active')
            ))
        elif table == 'knowledge_materials':
            cursor.execute("""
                INSERT INTO t_p47619579_knowledge_management.knowledge_materials 
                (title, description, content, category, difficulty, duration, tags, is_published, created_by, cover_image, attachments, departments)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, title, description, content, category, difficulty, duration, tags, 
                          rating, enrollments, is_published, created_by, cover_image, attachments, departments, created_at, updated_at
            """, (
                data.get('title'),
                data.get('description'),
                data.get('content'),
                data.get('category'),
                data.get('difficulty', 'medium'),
                data.get('duration'),
                data.get('tags', []),
                data.get('is_published', True),
                data.get('created_by', 'System'),
                data.get('cover_image'),
                json.dumps(data.get('attachments', [])),
                data.get('departments', [])
            ))
        
        row = cursor.fetchone()
        conn.commit()
        return {'data': dict(row), 'message': 'Запись создана успешно'}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания записи: {str(e)}'}


def update_item(cursor, conn, table: str, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить запись"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        if table == 'tests':
            # Обновление теста
            update_fields = []
            update_values = []
            
            if 'is_active' in data:
                update_fields.append('is_active = %s')
                update_values.append(data.get('is_active'))
            
            if 'title' in data:
                update_fields.append('title = %s')
                update_values.append(data.get('title'))
            
            if 'description' in data:
                update_fields.append('description = %s')
                update_values.append(data.get('description'))
            
            if 'passing_score' in data:
                update_fields.append('passing_score = %s')
                update_values.append(data.get('passing_score'))
            
            if 'time_limit' in data:
                update_fields.append('time_limit = %s')
                update_values.append(data.get('time_limit'))
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            
            if not update_fields:
                return {'error': 'Нет полей для обновления'}
            
            update_values.append(item_id)
            
            query = f"""
                UPDATE {schema}.tests 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, title, is_active, updated_at
            """
            
            cursor.execute(query, tuple(update_values))
            
        elif table == 'employees':
            # Проверяем, какие поля переданы для обновления
            update_fields = []
            update_values = []
            
            # Обрабатываем все возможные поля
            if 'full_name' in data or 'name' in data:
                update_fields.append('full_name = %s')
                update_values.append(data.get('full_name', data.get('name')))
            
            if 'email' in data:
                update_fields.append('email = %s')
                update_values.append(data.get('email'))
            
            if 'phone' in data:
                update_fields.append('phone = %s')
                update_values.append(data.get('phone'))
            
            if 'department' in data:
                update_fields.append('department = %s')
                update_values.append(data.get('department'))
            
            if 'position' in data:
                update_fields.append('position = %s')
                update_values.append(data.get('position'))
            
            if 'role' in data:
                update_fields.append('role = %s')
                update_values.append(data.get('role'))
            
            if 'hire_date' in data:
                update_fields.append('hire_date = %s')
                update_values.append(data.get('hire_date'))
            
            if 'zoom_link' in data:
                update_fields.append('zoom_link = %s')
                update_values.append(data.get('zoom_link'))
            
            if 'is_active' in data:
                update_fields.append('is_active = %s')
                update_values.append(data.get('is_active'))
            
            # Всегда обновляем updated_at
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            
            if not update_fields:
                return {'error': 'Нет полей для обновления'}
            
            # Добавляем item_id в конец значений
            update_values.append(item_id)
            
            query = f"""
                UPDATE t_p47619579_knowledge_management.employees 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, full_name, email, department, position, role, phone, hire_date, zoom_link, is_active, created_at, updated_at
            """
            
            cursor.execute(query, tuple(update_values))
        
        elif table == 'knowledge_materials':
            update_fields = []
            update_values = []
            
            if 'title' in data:
                update_fields.append('title = %s')
                update_values.append(data.get('title'))
            
            if 'description' in data:
                update_fields.append('description = %s')
                update_values.append(data.get('description'))
            
            if 'content' in data:
                update_fields.append('content = %s')
                update_values.append(data.get('content'))
            
            if 'category' in data:
                update_fields.append('category = %s')
                update_values.append(data.get('category'))
            
            if 'difficulty' in data:
                update_fields.append('difficulty = %s')
                update_values.append(data.get('difficulty'))
            
            if 'duration' in data:
                update_fields.append('duration = %s')
                update_values.append(data.get('duration'))
            
            if 'tags' in data:
                update_fields.append('tags = %s')
                update_values.append(data.get('tags'))
            
            if 'is_published' in data:
                update_fields.append('is_published = %s')
                update_values.append(data.get('is_published'))
            
            if 'cover_image' in data:
                update_fields.append('cover_image = %s')
                update_values.append(data.get('cover_image'))
            
            if 'attachments' in data:
                update_fields.append('attachments = %s')
                update_values.append(json.dumps(data.get('attachments')))
            
            if 'departments' in data:
                update_fields.append('departments = %s')
                update_values.append(data.get('departments'))
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            
            if len(update_fields) <= 1:
                return {'error': 'Нет полей для обновления'}
            
            update_values.append(item_id)
            
            query = f"""
                UPDATE {schema}.knowledge_materials 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, title, description, content, category, difficulty, duration, tags, 
                          rating, enrollments, is_published, created_by, cover_image, attachments, departments, created_at, updated_at
            """
            
            cursor.execute(query, tuple(update_values))
        
        row = cursor.fetchone()
        if row:
            conn.commit()
            return {'data': dict(row), 'message': 'Запись обновлена успешно'}
        else:
            return {'error': 'Запись не найдена'}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления записи: {str(e)}'}


def delete_item(cursor, conn, table: str, item_id: str) -> Dict[str, Any]:
    """Удалить запись (мягкое удаление для сотрудников)"""
    try:
        if table == 'employees':
            cursor.execute("""
                UPDATE t_p47619579_knowledge_management.employees 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (item_id,))
        else:
            cursor.execute(f"DELETE FROM {table} WHERE id = %s", (item_id,))
        
        if cursor.rowcount > 0:
            conn.commit()
            return {'message': 'Запись удалена успешно'}
        else:
            return {'error': 'Запись не найдена'}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка удаления записи: {str(e)}'}


def permanent_delete_item(cursor, conn, table: str, item_id: str) -> Dict[str, Any]:
    """Полностью удалить запись из базы данных (жёсткое удаление)"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        # Для сотрудников сначала удаляем все связанные записи
        if table == 'employees':
            # Удаляем результаты тестов
            cursor.execute(f"DELETE FROM {schema}.test_results WHERE employee_id = %s", (item_id,))
            
            # Удаляем записи о посещаемости
            cursor.execute(f"DELETE FROM {schema}.attendance WHERE employee_id = %s", (item_id,))
            
            # Удаляем записи на курсы
            cursor.execute(f"DELETE FROM {schema}.course_enrollments WHERE employee_id = %s", (item_id,))
            
            # Удаляем уведомления
            cursor.execute(f"DELETE FROM {schema}.notifications WHERE employee_id = %s", (item_id,))
            
            # Теперь можно удалить самого сотрудника
            cursor.execute(f"DELETE FROM {schema}.{table} WHERE id = %s", (item_id,))
        else:
            # Для других таблиц просто удаляем запись
            cursor.execute(f"DELETE FROM {schema}.{table} WHERE id = %s", (item_id,))
        
        if cursor.rowcount > 0:
            conn.commit()
            return {'message': f'Запись с ID {item_id} полностью удалена из базы данных'}
        else:
            return {'error': 'Запись не найдена'}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка при удалении записи: {str(e)}'}


def get_database_stats(cursor) -> Dict[str, Any]:
    """Получить статистику базы данных"""
    try:
        schema = 't_p47619579_knowledge_management'
        stats = {}
        
        # Статистика по сотрудникам
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.employees WHERE is_active = true")
        stats['active_employees'] = cursor.fetchone()[0]
        
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.employees WHERE is_active = false")
        stats['inactive_employees'] = cursor.fetchone()[0]
        
        # Статистика по курсам
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.courses WHERE status = 'active'")
        stats['active_courses'] = cursor.fetchone()[0]
        
        # Статистика по записям на курсы
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.course_enrollments")
        stats['total_enrollments'] = cursor.fetchone()[0]
        
        # Статистика по посещаемости
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.attendance")
        stats['total_attendance'] = cursor.fetchone()[0]
        
        return {'stats': stats}
    except Exception as e:
        return {'error': f'Ошибка получения статистики: {str(e)}'}


def seed_database(cursor, conn) -> Dict[str, Any]:
    """Заполнить базу данных тестовыми данными"""
    try:
        schema = 't_p47619579_knowledge_management'
        # Проверяем, есть ли уже данные
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.employees")
        if cursor.fetchone()[0] > 0:
            return {'message': 'База данных уже содержит данные'}
        
        # Добавляем тестовых сотрудников
        test_employees = [
            {
                'email': 'admin@company.com',
                'password_hash': 'admin_hash',
                'full_name': 'Администратор Системы',
                'department': 'IT',
                'position': 'Администратор',
                'role': 'admin',
                'hire_date': '2023-01-01'
            },
            {
                'email': 'teacher@company.com', 
                'password_hash': 'teacher_hash',
                'full_name': 'Преподаватель Курсов',
                'department': 'Обучение',
                'position': 'Старший преподаватель',
                'role': 'teacher',
                'hire_date': '2023-02-01'
            },
            {
                'email': 'ivanov@company.com',
                'password_hash': 'ivanov_hash', 
                'full_name': 'Иванов Иван Иванович',
                'phone': '+7 (999) 123-45-67',
                'department': 'Отдел разработки',
                'position': 'Senior разработчик',
                'role': 'employee',
                'hire_date': '2023-03-15'
            },
            {
                'email': 'petrova@company.com',
                'password_hash': 'petrova_hash',
                'full_name': 'Петрова Анна Сергеевна', 
                'phone': '+7 (999) 234-56-78',
                'department': 'Отдел продаж',
                'position': 'Менеджер по продажам',
                'role': 'employee',
                'hire_date': '2023-04-20'
            },
            {
                'email': 'sidorov@company.com',
                'password_hash': 'sidorov_hash',
                'full_name': 'Сидоров Петр Михайлович',
                'phone': '+7 (999) 345-67-89', 
                'department': 'Техническая поддержка',
                'position': 'Специалист тех. поддержки',
                'role': 'employee',
                'hire_date': '2023-05-10'
            }
        ]
        
        for emp in test_employees:
            cursor.execute(f"""
                INSERT INTO {schema}.employees (email, password_hash, full_name, phone,
                                     department, position, role, hire_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                emp['email'], emp['password_hash'], emp['full_name'],
                emp.get('phone'), emp['department'], emp['position'],
                emp['role'], emp['hire_date']
            ))
        
        # Добавляем тестовые курсы
        cursor.execute(f"SELECT id FROM {schema}.employees WHERE role = 'teacher' LIMIT 1")
        teacher_id = cursor.fetchone()[0]
        
        test_courses = [
            {
                'title': 'Основы React и TypeScript',
                'description': 'Изучение современных подходов к фронтенд разработке',
                'instructor_id': teacher_id,
                'start_date': '2024-01-15',
                'end_date': '2024-03-15',
                'duration_hours': 40,
                'max_participants': 20
            },
            {
                'title': 'Информационная безопасность',
                'description': 'Основы защиты корпоративной информации',
                'instructor_id': teacher_id,
                'start_date': '2024-02-01',
                'end_date': '2024-02-28',
                'duration_hours': 16,
                'max_participants': 50
            }
        ]
        
        for course in test_courses:
            cursor.execute(f"""
                INSERT INTO {schema}.courses (title, description, instructor_id, start_date,
                                   end_date, duration_hours, max_participants, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'active')
            """, (
                course['title'], course['description'], course['instructor_id'],
                course['start_date'], course['end_date'], course['duration_hours'],
                course['max_participants']
            ))
        
        conn.commit()
        return {'message': 'База данных заполнена тестовыми данными успешно'}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка заполнения базы данных: {str(e)}'}


def get_test_with_questions(cursor, test_id: str) -> Dict[str, Any]:
    """Получить тест со всеми вопросами и ответами"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        # Получаем тест
        cursor.execute(f"""
            SELECT t.*, e.full_name as creator_name, c.title as course_title
            FROM {schema}.tests t
            LEFT JOIN {schema}.employees e ON t.creator_id = e.id
            LEFT JOIN {schema}.courses c ON t.course_id = c.id
            WHERE t.id = %s
        """, (test_id,))
        
        test = cursor.fetchone()
        if not test:
            return {'error': 'Тест не найден'}
        
        test_data = dict(test)
        
        # Получаем вопросы
        cursor.execute(f"""
            SELECT * FROM {schema}.test_questions
            WHERE test_id = %s
            ORDER BY order_num, id
        """, (test_id,))
        
        questions = cursor.fetchall()
        test_data['questions'] = []
        
        # Для каждого вопроса получаем ответы
        for question in questions:
            question_data = dict(question)
            
            cursor.execute(f"""
                SELECT * FROM {schema}.test_answers
                WHERE question_id = %s
                ORDER BY order_num, id
            """, (question['id'],))
            
            answers = cursor.fetchall()
            question_data['answers'] = [dict(answer) for answer in answers]
            test_data['questions'].append(question_data)
        
        return {'data': test_data}
        
    except Exception as e:
        return {'error': f'Ошибка получения теста: {str(e)}'}


def get_test_results(cursor, test_id: str, employee_id: str = None) -> Dict[str, Any]:
    """Получить результаты прохождения тестов"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        if employee_id:
            # Результаты конкретного сотрудника
            cursor.execute(f"""
                SELECT tr.*, e.full_name as employee_name, t.title as test_title
                FROM {schema}.test_results tr
                LEFT JOIN {schema}.employees e ON tr.employee_id = e.id
                LEFT JOIN {schema}.tests t ON tr.test_id = t.id
                WHERE tr.test_id = %s AND tr.employee_id = %s
                ORDER BY tr.created_at DESC
            """, (test_id, employee_id))
        else:
            # Все результаты теста
            cursor.execute(f"""
                SELECT tr.*, e.full_name as employee_name
                FROM {schema}.test_results tr
                LEFT JOIN {schema}.employees e ON tr.employee_id = e.id
                WHERE tr.test_id = %s
                ORDER BY tr.created_at DESC
            """, (test_id,))
        
        results = cursor.fetchall()
        return {'data': [dict(r) for r in results], 'count': len(results)}
        
    except Exception as e:
        return {'error': f'Ошибка получения результатов: {str(e)}'}


def create_test_with_questions(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать тест с вопросами и ответами"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        print(f"Creating test with data: {data}")
        
        # Создаем тест
        cursor.execute(f"""
            INSERT INTO {schema}.tests (title, description, course_id, creator_id, 
                                       time_limit, passing_score, max_attempts, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, created_at
        """, (
            data.get('title'),
            data.get('description'),
            data.get('course_id'),
            data.get('creator_id'),
            data.get('time_limit'),
            data.get('passing_score', 70),
            data.get('max_attempts', 1),
            data.get('is_active', True)
        ))
        
        print("Test inserted, getting test_id...")
        
        test_row = cursor.fetchone()
        test_id = test_row['id']
        
        # Создаем вопросы
        questions = data.get('questions', [])
        print(f"Creating {len(questions)} questions...")
        
        for idx, question in enumerate(questions):
            print(f"Question {idx + 1}: {question.get('question_text')[:50]}...")
            
            cursor.execute(f"""
                INSERT INTO {schema}.test_questions (test_id, question_text, question_type, 
                                                    points, order_num)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                test_id,
                question.get('question_text'),
                question.get('question_type', 'single_choice'),
                question.get('points', 1),
                idx + 1
            ))
            
            question_row = cursor.fetchone()
            question_id = question_row['id']
            
            # Создаем варианты ответов
            answers = question.get('answers', [])
            print(f"Creating {len(answers)} answers for question {idx + 1}...")
            
            for ans_idx, answer in enumerate(answers):
                cursor.execute(f"""
                    INSERT INTO {schema}.test_answers (question_id, answer_text, 
                                                      is_correct, order_num)
                    VALUES (%s, %s, %s, %s)
                """, (
                    question_id,
                    answer.get('answer_text'),
                    answer.get('is_correct', False),
                    ans_idx + 1
                ))
        
        conn.commit()
        print(f"Test created successfully: {test_row['title']}")
        
        return {
            'data': dict(test_row),
            'message': f'Тест "{test_row["title"]}" создан успешно'
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating test: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': f'Ошибка создания теста: {str(e)}'}


def submit_test_results(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить результаты прохождения теста"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        # Подсчитываем баллы
        score = data.get('score', 0)
        max_score = data.get('max_score', 0)
        percentage = int((score / max_score * 100) if max_score > 0 else 0)
        
        # Получаем минимальный проходной балл
        cursor.execute(f"""
            SELECT passing_score FROM {schema}.tests WHERE id = %s
        """, (data.get('test_id'),))
        
        test_row = cursor.fetchone()
        passing_score = test_row['passing_score'] if test_row else 70
        passed = percentage >= passing_score
        
        # Сохраняем результат
        cursor.execute(f"""
            INSERT INTO {schema}.test_results (test_id, employee_id, score, max_score, 
                                              percentage, passed, attempt_number, 
                                              completed_at, time_spent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, %s)
            RETURNING id, percentage, passed
        """, (
            data.get('test_id'),
            data.get('employee_id'),
            score,
            max_score,
            percentage,
            passed,
            data.get('attempt_number', 1),
            data.get('time_spent', 0)
        ))
        
        result_row = cursor.fetchone()
        result_id = result_row['id']
        
        # Сохраняем ответы пользователя
        user_answers = data.get('user_answers', [])
        for answer in user_answers:
            cursor.execute(f"""
                INSERT INTO {schema}.test_user_answers (result_id, question_id, answer_id, 
                                                       answer_text, is_correct, points_earned)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                result_id,
                answer.get('question_id'),
                answer.get('answer_id'),
                answer.get('answer_text'),
                answer.get('is_correct', False),
                answer.get('points_earned', 0)
            ))
        
        conn.commit()
        return {
            'data': dict(result_row),
            'message': f'Результат теста сохранен. Набрано {percentage}%'
        }
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка сохранения результатов: {str(e)}'}


def update_test_with_questions(cursor, conn, test_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить тест с вопросами и ответами"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        # Обновляем основную информацию теста
        cursor.execute(f"""
            UPDATE {schema}.tests
            SET title = %s,
                description = %s,
                course_id = %s,
                time_limit = %s,
                passing_score = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, title, updated_at
        """, (
            data.get('title'),
            data.get('description'),
            data.get('course_id'),
            data.get('time_limit'),
            data.get('passing_score', 70),
            test_id
        ))
        
        test_row = cursor.fetchone()
        if not test_row:
            return {'error': 'Тест не найден'}
        
        # Удаляем старые вопросы и ответы
        cursor.execute(f"""
            DELETE FROM {schema}.test_answers
            WHERE question_id IN (
                SELECT id FROM {schema}.test_questions WHERE test_id = %s
            )
        """, (test_id,))
        
        cursor.execute(f"""
            DELETE FROM {schema}.test_questions WHERE test_id = %s
        """, (test_id,))
        
        # Создаем новые вопросы
        questions = data.get('questions', [])
        for idx, question in enumerate(questions):
            cursor.execute(f"""
                INSERT INTO {schema}.test_questions (test_id, question_text, question_type, 
                                                    points, order_num)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                test_id,
                question.get('question_text'),
                question.get('question_type', 'single_choice'),
                question.get('points', 1),
                idx + 1
            ))
            
            question_row = cursor.fetchone()
            question_id = question_row['id']
            
            # Создаем варианты ответов
            answers = question.get('answers', [])
            for ans_idx, answer in enumerate(answers):
                cursor.execute(f"""
                    INSERT INTO {schema}.test_answers (question_id, answer_text, 
                                                      is_correct, order_num)
                    VALUES (%s, %s, %s, %s)
                """, (
                    question_id,
                    answer.get('answer_text'),
                    answer.get('is_correct', False),
                    ans_idx + 1
                ))
        
        conn.commit()
        return {
            'data': dict(test_row),
            'message': f'Тест "{test_row["title"]}" успешно обновлён'
        }
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления теста: {str(e)}'}


def get_notifications(cursor, employee_id: str) -> Dict[str, Any]:
    """Получить уведомления сотрудника"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT id, employee_id, title, message, type, priority, is_read, 
                   link, metadata, created_at, read_at
            FROM {schema}.notifications
            WHERE employee_id = %s
            ORDER BY created_at DESC
            LIMIT 50
        """, (employee_id,))
        
        notifications = cursor.fetchall()
        return {'data': [dict(n) for n in notifications], 'count': len(notifications)}
        
    except Exception as e:
        return {'error': f'Ошибка получения уведомлений: {str(e)}'}


def get_unread_notifications_count(cursor, employee_id: str) -> Dict[str, Any]:
    """Получить количество непрочитанных уведомлений"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT COUNT(*) as count
            FROM {schema}.notifications
            WHERE employee_id = %s AND is_read = false
        """, (employee_id,))
        
        result = cursor.fetchone()
        return {'count': result['count']}
        
    except Exception as e:
        return {'error': f'Ошибка подсчета уведомлений: {str(e)}'}


def create_notification(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать уведомление"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            INSERT INTO {schema}.notifications (employee_id, title, message, type, 
                                               priority, link, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, employee_id, title, message, type, priority, is_read, 
                      link, created_at
        """, (
            data.get('employee_id'),
            data.get('title'),
            data.get('message'),
            data.get('type', 'info'),
            data.get('priority', 'normal'),
            data.get('link'),
            json.dumps(data.get('metadata')) if data.get('metadata') else None
        ))
        
        row = cursor.fetchone()
        conn.commit()
        return {'data': dict(row), 'message': 'Уведомление создано'}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания уведомления: {str(e)}'}


def mark_notification_read(cursor, conn, notification_id: str) -> Dict[str, Any]:
    """Отметить уведомление как прочитанное"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            UPDATE {schema}.notifications
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, is_read, read_at
        """, (notification_id,))
        
        row = cursor.fetchone()
        if row:
            conn.commit()
            return {'data': dict(row), 'message': 'Уведомление отмечено как прочитанное'}
        else:
            return {'error': 'Уведомление не найдено'}
            
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления уведомления: {str(e)}'}


def mark_all_notifications_read(cursor, conn, employee_id: str) -> Dict[str, Any]:
    """Отметить все уведомления пользователя как прочитанные"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            UPDATE {schema}.notifications
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE employee_id = %s AND is_read = false
        """, (employee_id,))
        
        updated_count = cursor.rowcount
        conn.commit()
        return {'message': f'Отмечено {updated_count} уведомлений как прочитанные', 'count': updated_count}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления уведомлений: {str(e)}'}


def increment_request_counter(cursor, conn) -> None:
    """Инкремент счётчика обращений к БД для текущего месяца"""
    try:
        from datetime import datetime
        schema = 't_p47619579_knowledge_management'
        current_month = datetime.now().strftime('%Y-%m')
        
        cursor.execute(f"""
            INSERT INTO {schema}.db_request_stats (month_year, request_count, updated_at)
            VALUES (%s, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (month_year) 
            DO UPDATE SET 
                request_count = {schema}.db_request_stats.request_count + 1,
                updated_at = CURRENT_TIMESTAMP
        """, (current_month,))
        
        conn.commit()
    except Exception as e:
        print(f"ERROR incrementing request counter: {str(e)}")
        conn.rollback()


def get_db_request_stats(cursor) -> Dict[str, Any]:
    """Получить статистику обращений к БД за текущий и прошлый месяцы"""
    try:
        from datetime import datetime, timedelta
        schema = 't_p47619579_knowledge_management'
        
        current_date = datetime.now()
        current_month = current_date.strftime('%Y-%m')
        
        # Предыдущий месяц
        if current_date.month == 1:
            prev_month = f"{current_date.year - 1}-12"
        else:
            prev_month = f"{current_date.year}-{str(current_date.month - 1).zfill(2)}"
        
        cursor.execute(f"""
            SELECT month_year, request_count, updated_at
            FROM {schema}.db_request_stats
            WHERE month_year IN (%s, %s)
            ORDER BY month_year DESC
        """, (current_month, prev_month))
        
        rows = cursor.fetchall()
        stats = {row['month_year']: dict(row) for row in rows}
        
        return {
            'current_month': stats.get(current_month, {'month_year': current_month, 'request_count': 0}),
            'previous_month': stats.get(prev_month, {'month_year': prev_month, 'request_count': 0})
        }
        
    except Exception as e:
        return {'error': f'Ошибка получения статистики: {str(e)}'}

def get_support_messages(cursor, employee_id: Optional[int] = None) -> Dict[str, Any]:
    """Получить сообщения поддержки для сотрудника или все для администратора"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        if employee_id:
            cursor.execute(f"""
                SELECT sm.*, e.full_name as employee_name, e.email
                FROM {schema}.support_messages sm
                JOIN {schema}.employees e ON sm.employee_id = e.id
                WHERE sm.employee_id = %s
                ORDER BY sm.created_at ASC
            """, (employee_id,))
        else:
            cursor.execute(f"""
                SELECT sm.*, e.full_name as employee_name, e.email
                FROM {schema}.support_messages sm
                JOIN {schema}.employees e ON sm.employee_id = e.id
                ORDER BY sm.created_at DESC
            """)
        
        messages = [dict(row) for row in cursor.fetchall()]
        return {'messages': messages}
        
    except Exception as e:
        return {'error': f'Ошибка получения сообщений: {str(e)}'}

def create_support_message(cursor, conn, message_data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новое сообщение в чате поддержки"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        employee_id = message_data.get('employee_id')
        message = message_data.get('message')
        is_admin_response = message_data.get('is_admin_response', False)
        
        if not employee_id or not message:
            return {'error': 'employee_id и message обязательны'}
        
        cursor.execute(f"""
            INSERT INTO {schema}.support_messages 
                (employee_id, message, is_admin_response, is_read)
            VALUES (%s, %s, %s, %s)
            RETURNING id, employee_id, message, is_admin_response, is_read, created_at
        """, (employee_id, message, is_admin_response, False))
        
        new_message = dict(cursor.fetchone())
        conn.commit()
        
        return {'message': new_message, 'success': True}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания сообщения: {str(e)}'}

def get_unread_support_count(cursor) -> Dict[str, Any]:
    """Получить количество непрочитанных сообщений поддержки (от сотрудников администратору)"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT COUNT(*) as count
            FROM {schema}.support_messages
            WHERE is_admin_response = FALSE AND is_read = FALSE
        """)
        
        result = cursor.fetchone()
        return {'count': result['count'] if result else 0}
        
    except Exception as e:
        return {'error': f'Ошибка подсчёта непрочитанных: {str(e)}'}

def mark_support_messages_read(cursor, conn, employee_id: int) -> Dict[str, Any]:
    """Пометить все сообщения как прочитанные"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            UPDATE {schema}.support_messages
            SET is_read = TRUE
            WHERE employee_id = %s AND is_read = FALSE
        """, (employee_id,))
        
        conn.commit()
        return {'success': True, 'updated': cursor.rowcount}
        
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка пометки прочитанных: {str(e)}'}


def check_updates(cursor, employee_id: Optional[str] = None, is_admin: bool = False) -> Dict[str, Any]:
    """
    Быстрая проверка наличия обновлений (непрочитанных уведомлений и сообщений поддержки)
    Возвращает только факт наличия обновлений без загрузки самих данных
    """
    try:
        schema = 't_p47619579_knowledge_management'
        
        has_updates = False
        unread_notifications = 0
        unread_support = 0
        
        # Проверяем непрочитанные уведомления для конкретного пользователя
        if employee_id:
            cursor.execute(f"""
                SELECT COUNT(*) as count
                FROM {schema}.notifications
                WHERE employee_id = %s AND is_read = false
            """, (employee_id,))
            result = cursor.fetchone()
            unread_notifications = result['count'] if result else 0
        
        # Для админа проверяем непрочитанные сообщения поддержки
        if is_admin:
            cursor.execute(f"""
                SELECT COUNT(*) as count
                FROM {schema}.support_messages
                WHERE is_admin_response = FALSE AND is_read = FALSE
            """)
            result = cursor.fetchone()
            unread_support = result['count'] if result else 0
        
        has_updates = unread_notifications > 0 or unread_support > 0
        
        return {
            'has_updates': has_updates,
            'unread_notifications': unread_notifications,
            'unread_support': unread_support,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        return {'error': f'Ошибка проверки обновлений: {str(e)}'}


def search_wikipedia(query: str) -> List[Dict[str, Any]]:
    """Поиск в Wikipedia"""
    try:
        search_url = f"https://ru.wikipedia.org/w/api.php?action=opensearch&search={query}&limit=3&format=json"
        response = requests.get(search_url, timeout=10)
        data = response.json()
        
        materials = []
        if len(data) >= 4:
            titles = data[1]
            descriptions = data[2]
            urls = data[3]
            
            for i in range(len(titles)):
                if i >= 3:
                    break
                    
                page_url = f"https://ru.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&titles={titles[i]}&format=json&explaintext=1"
                page_response = requests.get(page_url, timeout=10)
                page_data = page_response.json()
                
                pages = page_data.get('query', {}).get('pages', {})
                content = ''
                for page_id, page_info in pages.items():
                    content = page_info.get('extract', descriptions[i])[:1000]
                
                materials.append({
                    'title': titles[i],
                    'description': descriptions[i] if descriptions[i] else 'Материал из Wikipedia',
                    'content': content,
                    'source_url': urls[i],
                    'tags': [query, 'Wikipedia']
                })
        
        return materials
    except Exception as e:
        print(f'Wikipedia search error: {str(e)}')
        return []

def search_educational_sites(query: str) -> List[Dict[str, Any]]:
    """Поиск образовательных видео на YouTube"""
    try:
        materials = []
        
        search_url = f"https://www.youtube.com/results?search_query={query}+обучение"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if 'watch?v=' in response.text:
            materials.append({
                'title': f'Видеоуроки по теме: {query}',
                'description': f'Образовательные видео на YouTube по запросу "{query}"',
                'content': f'Рекомендуем посмотреть видеоуроки на YouTube для лучшего понимания темы.\n\nПоиск: {query} обучение\n\nВидеоформат помогает лучше усваивать материал и видеть практические примеры.',
                'source_url': search_url,
                'tags': [query, 'YouTube', 'Видеоуроки']
            })
        
        return materials
    except Exception as e:
        print(f'Educational sites search error: {str(e)}')
        return []

def ai_search_knowledge(body_data: Dict[str, Any]) -> Dict[str, Any]:
    """AI поиск образовательных материалов из интернета"""
    try:
        openai_api_key = os.environ.get('OPENAI_API_KEY', 'sk-proj-MDE5OWVjYWEtM2NkMy03MjZhLWE2MmMtYzg5OTNiYmYwNDk5OmUxYWFhMTg3LTVjMmMtNDQ0Ny05MWU2LTBlNzVmZDZmOTYwNA==')
        
        query = body_data.get('query', '')
        if not query:
            return {'error': 'Поле query обязательно'}
        
        all_materials = []
        
        wiki_materials = search_wikipedia(query)
        all_materials.extend(wiki_materials)
        
        video_materials = search_educational_sites(query)
        all_materials.extend(video_materials)
        
        search_prompt = f"""Найди и создай образовательные материалы по запросу: "{query}"

Уже найдено из других источников: {len(all_materials)} материалов

Создай ещё 2 дополнительных качественных образовательных материала на русском языке.
Материалы должны быть практичными и содержать конкретные знания.

Верни результат СТРОГО в формате JSON:
{{
  "materials": [
    {{
      "title": "Название материала",
      "description": "Краткое описание (2-3 предложения)",
      "content": "Основное содержание материала (минимум 3 абзаца с практическими примерами)",
      "source_url": "AI Generated",
      "tags": ["тег1", "тег2", "тег3"]
    }}
  ]
}}"""

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Ты образовательный ассистент. Создавай качественные учебные материалы на русском языке.'},
                    {'role': 'user', 'content': search_prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 3000
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return {'error': f'OpenAI API error: {response.text}'}
        
        ai_response = response.json()
        content = ai_response['choices'][0]['message']['content']
        
        try:
            content_clean = content.strip()
            if content_clean.startswith('```json'):
                content_clean = content_clean[7:]
            if content_clean.startswith('```'):
                content_clean = content_clean[3:]
            if content_clean.endswith('```'):
                content_clean = content_clean[:-3]
            content_clean = content_clean.strip()
            
            materials_data = json.loads(content_clean)
            if 'materials' in materials_data:
                all_materials.extend(materials_data['materials'])
        except json.JSONDecodeError:
            all_materials.append({
                'title': f'Материал по теме: {query}',
                'description': 'AI сгенерированный материал',
                'content': content,
                'source_url': 'AI Generated',
                'tags': [query.lower()]
            })
        
        return {
            'materials': all_materials,
            'sources': {
                'wikipedia': len(wiki_materials),
                'videos': len(video_materials),
                'ai_generated': len(all_materials) - len(wiki_materials) - len(video_materials),
                'total': len(all_materials)
            }
        }
        
    except Exception as e:
        return {'error': f'Ошибка AI поиска: {str(e)}'}


def get_subsections(cursor) -> Dict[str, Any]:
    """Получить содержимое подразделов базы знаний"""
    try:
        schema = 't_p47619579_knowledge_management'
        cursor.execute(f"SELECT subsection_name, content FROM {schema}.knowledge_subsections")
        rows = cursor.fetchall()
        
        result = {}
        for row in rows:
            result[row['subsection_name']] = row['content']
        
        return {'data': result}
    except Exception as e:
        return {'error': f'Ошибка получения подразделов: {str(e)}'}


def save_subsection(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Сохранить содержимое подраздела базы знаний"""
    try:
        schema = 't_p47619579_knowledge_management'
        subsection = data.get('subsection')
        content = data.get('content', '')
        
        if not subsection:
            return {'error': 'Не указано название подраздела'}
        
        cursor.execute(f"""
            INSERT INTO {schema}.knowledge_subsections (subsection_name, content)
            VALUES (%s, %s)
            ON CONFLICT (subsection_name) 
            DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
            RETURNING subsection_name, content, updated_at
        """, (subsection, content))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            'data': dict(result),
            'message': 'Подраздел успешно сохранен'
        }
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка сохранения подраздела: {str(e)}'}


def get_instructions(cursor) -> Dict[str, Any]:
    """Получить все инструкции"""
    try:
        schema = 't_p47619579_knowledge_management'
        cursor.execute(f"""
            SELECT id, title, description, icon_name, icon_color, steps, created_at, updated_at
            FROM {schema}.instructions
            ORDER BY created_at DESC
        """)
        
        instructions = cursor.fetchall()
        return {'data': [dict(inst) for inst in instructions]}
    except Exception as e:
        return {'error': f'Ошибка получения инструкций: {str(e)}'}


def create_instruction(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новую инструкцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            INSERT INTO {schema}.instructions 
            (title, description, icon_name, icon_color, steps)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, description, icon_name, icon_color, steps, created_at, updated_at
        """, (
            data.get('title'),
            data.get('description'),
            data.get('icon_name', 'FileText'),
            data.get('icon_color', 'blue-600'),
            json.dumps(data.get('steps', []))
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {'data': dict(result)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания инструкции: {str(e)}'}


def update_instruction(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить инструкцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        instruction_id = data.get('id')
        
        if not instruction_id:
            return {'error': 'Не указан ID инструкции'}
        
        update_fields = []
        values = []
        
        if 'title' in data:
            update_fields.append('title = %s')
            values.append(data['title'])
        if 'description' in data:
            update_fields.append('description = %s')
            values.append(data['description'])
        if 'icon_name' in data:
            update_fields.append('icon_name = %s')
            values.append(data['icon_name'])
        if 'icon_color' in data:
            update_fields.append('icon_color = %s')
            values.append(data['icon_color'])
        if 'steps' in data:
            update_fields.append('steps = %s')
            values.append(json.dumps(data['steps']))
        
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        values.append(instruction_id)
        
        query = f"""
            UPDATE {schema}.instructions
            SET {', '.join(update_fields)}
            WHERE id = %s
            RETURNING id, title, description, icon_name, icon_color, steps, created_at, updated_at
        """
        
        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()
        
        if not result:
            return {'error': 'Инструкция не найдена'}
        
        return {'data': dict(result)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления инструкции: {str(e)}'}


def delete_instruction(cursor, conn, instruction_id: int) -> Dict[str, Any]:
    """Удалить инструкцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            DELETE FROM {schema}.instructions
            WHERE id = %s
            RETURNING id
        """, (instruction_id,))
        
        result = cursor.fetchone()
        conn.commit()
        
        if not result:
            return {'error': 'Инструкция не найдена'}
        
        return {'data': {'success': True}}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка удаления инструкции: {str(e)}'}


def get_instruction_categories(cursor) -> Dict[str, Any]:
    """Получить все категории инструкций"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT * FROM {schema}.instruction_categories
            ORDER BY name
        """)
        
        categories = cursor.fetchall()
        return {'data': [dict(cat) for cat in categories]}
    except Exception as e:
        return {'error': f'Ошибка получения категорий: {str(e)}'}


def create_instruction_category(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новую категорию инструкций"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            INSERT INTO {schema}.instruction_categories (name, icon_name)
            VALUES (%s, %s)
            RETURNING *
        """, (data.get('name'), data.get('icon_name', 'Folder')))
        
        category = cursor.fetchone()
        conn.commit()
        
        return {'data': dict(category)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания категории: {str(e)}'}


def update_instruction_category(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить категорию инструкций"""
    try:
        schema = 't_p47619579_knowledge_management'
        category_id = data.get('id')
        
        updates = []
        values = []
        
        if 'name' in data:
            updates.append('name = %s')
            values.append(data['name'])
        
        if 'icon_name' in data:
            updates.append('icon_name = %s')
            values.append(data['icon_name'])
        
        if not updates:
            return {'error': 'Нет полей для обновления'}
        
        updates.append('updated_at = NOW()')
        values.append(category_id)
        
        cursor.execute(f"""
            UPDATE {schema}.instruction_categories
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING *
        """, tuple(values))
        
        category = cursor.fetchone()
        conn.commit()
        
        if not category:
            return {'error': 'Категория не найдена'}
        
        return {'data': dict(category)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления категории: {str(e)}'}


def delete_instruction_category(cursor, conn, category_id: int) -> Dict[str, Any]:
    """Удалить категорию инструкций"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        # Проверяем, есть ли инструкции в этой категории
        cursor.execute(f"""
            SELECT COUNT(*) as count FROM {schema}.instructions
            WHERE category = (SELECT name FROM {schema}.instruction_categories WHERE id = %s)
        """, (category_id,))
        
        result = cursor.fetchone()
        if result and result['count'] > 0:
            return {'error': f'Невозможно удалить категорию: в ней {result["count"]} инструкций'}
        
        cursor.execute(f"""
            DELETE FROM {schema}.instruction_categories
            WHERE id = %s
            RETURNING id
        """, (category_id,))
        
        result = cursor.fetchone()
        conn.commit()
        
        if not result:
            return {'error': 'Категория не найдена'}
        
        return {'data': {'success': True}}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка удаления категории: {str(e)}'}


def get_conferences(cursor) -> Dict[str, Any]:
    """Получить все видеоконференции"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT c.*, e.full_name as creator_name,
                   (SELECT COUNT(*) FROM {schema}.video_conference_participants 
                    WHERE conference_id = c.id AND is_active = true) as active_participants
            FROM {schema}.video_conferences c
            LEFT JOIN {schema}.employees e ON c.created_by = e.id
            ORDER BY c.scheduled_time DESC
        """)
        
        conferences = cursor.fetchall()
        return {'data': [dict(conf) for conf in conferences]}
    except Exception as e:
        return {'error': f'Ошибка получения конференций: {str(e)}'}


def get_conference(cursor, conference_id: str) -> Dict[str, Any]:
    """Получить конференцию по ID"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            SELECT c.*, e.full_name as creator_name
            FROM {schema}.video_conferences c
            LEFT JOIN {schema}.employees e ON c.created_by = e.id
            WHERE c.id = %s
        """, (conference_id,))
        
        conference = cursor.fetchone()
        if not conference:
            return {'error': 'Конференция не найдена'}
        
        cursor.execute(f"""
            SELECT p.*, e.full_name as participant_name
            FROM {schema}.video_conference_participants p
            LEFT JOIN {schema}.employees e ON p.employee_id = e.id
            WHERE p.conference_id = %s
            ORDER BY p.joined_at DESC
        """, (conference_id,))
        
        participants = cursor.fetchall()
        
        result = dict(conference)
        result['participants'] = [dict(p) for p in participants]
        
        return {'data': result}
    except Exception as e:
        return {'error': f'Ошибка получения конференции: {str(e)}'}


def create_conference(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать новую видеоконференцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        import secrets
        room_id = secrets.token_urlsafe(16)
        
        cursor.execute(f"""
            INSERT INTO {schema}.video_conferences 
            (title, description, created_by, scheduled_time, status, room_id, max_participants)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data.get('title'),
            data.get('description'),
            data.get('created_by'),
            data.get('scheduled_time'),
            data.get('status', 'scheduled'),
            room_id,
            data.get('max_participants', 50)
        ))
        
        conference = cursor.fetchone()
        conn.commit()
        
        return {'data': dict(conference)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания конференции: {str(e)}'}


def update_conference(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить конференцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        conference_id = data.get('id')
        
        updates = []
        values = []
        
        if 'title' in data:
            updates.append('title = %s')
            values.append(data['title'])
        
        if 'description' in data:
            updates.append('description = %s')
            values.append(data['description'])
        
        if 'status' in data:
            updates.append('status = %s')
            values.append(data['status'])
            
            if data['status'] == 'active' and 'started_at' not in data:
                updates.append('started_at = NOW()')
            elif data['status'] == 'ended':
                updates.append('ended_at = NOW()')
        
        if 'scheduled_time' in data:
            updates.append('scheduled_time = %s')
            values.append(data['scheduled_time'])
        
        if not updates:
            return {'error': 'Нет полей для обновления'}
        
        updates.append('updated_at = NOW()')
        values.append(conference_id)
        
        cursor.execute(f"""
            UPDATE {schema}.video_conferences
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING *
        """, tuple(values))
        
        conference = cursor.fetchone()
        conn.commit()
        
        if not conference:
            return {'error': 'Конференция не найдена'}
        
        return {'data': dict(conference)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка обновления конференции: {str(e)}'}


def join_conference(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Присоединиться к конференции"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            INSERT INTO {schema}.video_conference_participants 
            (conference_id, employee_id, joined_at, is_active)
            VALUES (%s, %s, NOW(), true)
            ON CONFLICT (conference_id, employee_id) 
            DO UPDATE SET joined_at = NOW(), is_active = true, left_at = NULL
            RETURNING *
        """, (data.get('conference_id'), data.get('employee_id')))
        
        participant = cursor.fetchone()
        conn.commit()
        
        return {'data': dict(participant)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка присоединения к конференции: {str(e)}'}


def leave_conference(cursor, conn, data: Dict[str, Any]) -> Dict[str, Any]:
    """Покинуть конференцию"""
    try:
        schema = 't_p47619579_knowledge_management'
        
        cursor.execute(f"""
            UPDATE {schema}.video_conference_participants
            SET left_at = NOW(), is_active = false
            WHERE conference_id = %s AND employee_id = %s
            RETURNING *
        """, (data.get('conference_id'), data.get('employee_id')))
        
        participant = cursor.fetchone()
        conn.commit()
        
        if not participant:
            return {'error': 'Участник не найден'}
        
        return {'data': dict(participant)}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка выхода из конференции: {str(e)}'}