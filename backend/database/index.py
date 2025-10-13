import json
import os
import psycopg2
import hashlib
import secrets
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
    Backend API для работы с базой данных системы управления знаниями
    Args: event с httpMethod, body, queryStringParameters
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
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL не найден в переменных окружения")
        
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        # Определяем операцию из URL path
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
            elif action == 'stats':
                result = get_database_stats(cursor)
            else:
                result = {'error': 'Неизвестное действие'}
                
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            if action == 'create':
                result = create_item(cursor, conn, table, body_data)
            elif action == 'seed':
                result = seed_database(cursor, conn)
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
        schema = 't_p47619579_knowledge_management'
        if table == 'employees':
            cursor.execute(f"""
                SELECT id, full_name, email, department, position, role, phone, hire_date,
                       is_active, created_at, updated_at
                FROM {schema}.employees
                WHERE is_active = true
                ORDER BY created_at DESC
            """)
        elif table == 'courses':
            cursor.execute(f"""
                SELECT c.*, e.full_name as instructor_name
                FROM {schema}.courses c
                LEFT JOIN {schema}.employees e ON c.instructor_id = e.id
                WHERE c.status = 'active'
                ORDER BY c.created_at DESC
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
                   is_active, created_at, updated_at
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
                                     department, position, role, hire_date, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, full_name, email, department, position, role, phone, hire_date, is_active, created_at
            """, (
                data.get('email'),
                hash_password(data.get('password', 'temp123')),
                data.get('name', data.get('full_name')),
                data.get('phone'),
                data.get('department'),
                data.get('position'),
                data.get('role', 'employee'),
                data.get('hire_date'),
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
        
        row = cursor.fetchone()
        conn.commit()
        return {'data': dict(row), 'message': 'Запись создана успешно'}
    except Exception as e:
        conn.rollback()
        return {'error': f'Ошибка создания записи: {str(e)}'}


def update_item(cursor, conn, table: str, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить запись"""
    try:
        if table == 'employees':
            cursor.execute("""
                UPDATE t_p47619579_knowledge_management.employees 
                SET full_name = %s, email = %s, phone = %s, department = %s, 
                    position = %s, role = %s, hire_date = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, full_name, email, department, position, role, phone, hire_date, is_active, created_at, updated_at
            """, (
                data.get('name', data.get('full_name')),
                data.get('email'),
                data.get('phone'),
                data.get('department'),
                data.get('position'),
                data.get('role'),
                data.get('hire_date'),
                item_id
            ))
        
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