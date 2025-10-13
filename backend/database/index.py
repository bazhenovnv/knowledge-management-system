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
            elif action == 'get_test_full':
                test_id = params.get('id')
                result = get_test_with_questions(cursor, test_id)
            elif action == 'get_test_results':
                test_id = params.get('test_id')
                employee_id = params.get('employee_id')
                result = get_test_results(cursor, test_id, employee_id)
            elif action == 'stats':
                result = get_database_stats(cursor)
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
            elif action == 'seed':
                result = seed_database(cursor, conn)
            else:
                result = {'error': 'Неизвестное действие для POST'}
                
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            item_id = params.get('id')
            if action == 'update_test_full':
                result = update_test_with_questions(cursor, conn, item_id, body_data)
            else:
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
                RETURNING id, full_name, email, department, position, role, phone, hire_date, is_active, created_at, updated_at
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
        
        test_row = cursor.fetchone()
        test_id = test_row['id']
        
        # Создаем вопросы
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
            'message': f'Тест "{test_row["title"]}" создан успешно'
        }
        
    except Exception as e:
        conn.rollback()
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