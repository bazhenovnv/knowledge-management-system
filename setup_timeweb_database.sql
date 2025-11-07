-- ========================================
-- СОЗДАНИЕ СХЕМЫ И ТАБЛИЦ ДЛЯ TIMEWEB CLOUD
-- База: default_db
-- Схема: t_p47619579_knowledge_management
-- ========================================

-- Создание схемы
CREATE SCHEMA IF NOT EXISTS t_p47619579_knowledge_management;

-- ========================================
-- 1. ТАБЛИЦА: employees (Сотрудники)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.employees (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(20) DEFAULT 'employee',
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    theme VARCHAR(20) DEFAULT 'light',
    zoom_meeting_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_password_reset TIMESTAMP
);

-- Добавление тестовых сотрудников
INSERT INTO t_p47619579_knowledge_management.employees 
(email, password_hash, full_name, phone, department, position, role, hire_date, is_active)
VALUES 
('admin@company.com', 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'Баженов Николай Владимирович', '+7 (938) 523-17-81', 'IT', 'Главный администратор', 'admin', '2023-01-01', true),
('teacher@company.com', 'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 'Преподаватель Баженов', '', 'Партнерка', 'Разработчик', 'teacher', '2023-02-01', true),
('newemployee@company.com', 'e472b65aedc9ed50541e814476f96046:4ec243d0fd3211cc76f9ed23af506d683703b6e8c51aea9be2fa9b8ec363d6cd', 'Новый Сотрудник', '+7 (999) 555-12-34', 'IT', 'Junior разработчик', 'employee', '2025-09-26', true)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 2. ТАБЛИЦА: auth_sessions (Сессии авторизации)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.auth_sessions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON t_p47619579_knowledge_management.auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_employee ON t_p47619579_knowledge_management.auth_sessions(employee_id);

-- ========================================
-- 3. ТАБЛИЦА: courses (Курсы)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    start_date DATE,
    end_date DATE,
    duration_hours INTEGER,
    max_participants INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p47619579_knowledge_management.courses 
(title, description, instructor_id, start_date, end_date, duration_hours, max_participants, status)
VALUES 
('Основы React и TypeScript', 'Изучение современных подходов к фронтенд разработке', 2, '2024-01-15', '2024-03-15', 40, 20, 'active'),
('Информационная безопасность', 'Основы защиты корпоративной информации', 2, '2024-02-01', '2024-02-28', 16, 50, 'active')
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. ТАБЛИЦА: tests (Тесты)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INTEGER REFERENCES t_p47619579_knowledge_management.courses(id),
    creator_id BIGINT REFERENCES t_p47619579_knowledge_management.employees(id),
    time_limit INTEGER,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p47619579_knowledge_management.tests 
(title, description, creator_id, time_limit, passing_score, max_attempts, is_active)
VALUES 
('Основы информационной безопасности', 'Тест на знание базовых принципов информационной безопасности в компании', 1, 30, 70, 3, true),
('JavaScript: основы', 'Проверка знаний основ языка JavaScript для разработчиков', 1, 45, 80, 2, true),
('Корпоративная этика', 'Тест на знание правил корпоративной этики и делового общения', 1, 20, 75, 1, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. ТАБЛИЦА: test_questions (Вопросы тестов)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'single_choice',
    points INTEGER DEFAULT 1,
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. ТАБЛИЦА: test_answers (Ответы на вопросы)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. ТАБЛИЦА: test_results (Результаты тестов)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.tests(id),
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    time_spent INTEGER,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 8. ТАБЛИЦА: test_user_answers (Ответы пользователей)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_user_answers (
    id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_results(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_questions(id),
    answer_id INTEGER REFERENCES t_p47619579_knowledge_management.test_answers(id),
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 9. ТАБЛИЦА: knowledge_materials (База знаний)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.knowledge_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    author_id INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    is_public BOOLEAN DEFAULT true,
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    departments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 10. ТАБЛИЦА: knowledge_subsections (Подразделы базы знаний)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.knowledge_subsections (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.knowledge_materials(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 11. ТАБЛИЦА: instructions (Инструкции)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.instructions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    author_id INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 12. ТАБЛИЦА: instruction_categories (Категории инструкций)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.instruction_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p47619579_knowledge_management.instruction_categories (name, description, icon, color, order_num)
VALUES 
('Технические', 'Технические инструкции и руководства', 'Cpu', 'blue', 1),
('Кадровые', 'Инструкции по работе с персоналом', 'Users', 'green', 2),
('Безопасность', 'Правила безопасности и охраны труда', 'Shield', 'red', 3),
('Финансовые', 'Финансовые процедуры и отчетность', 'DollarSign', 'yellow', 4),
('Общие', 'Общие корпоративные инструкции', 'FileText', 'gray', 5)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 13. ТАБЛИЦА: notifications (Уведомления)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.notifications (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_employee ON t_p47619579_knowledge_management.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON t_p47619579_knowledge_management.notifications(employee_id, is_read);

-- ========================================
-- 14. ТАБЛИЦА: scheduled_notifications (Запланированные уведомления)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.scheduled_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'reminder',
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER,
    department VARCHAR(100),
    send_date TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- ========================================
-- 15. ТАБЛИЦА: password_reset_codes (Коды сброса пароля)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.password_reset_codes (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    reset_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_code ON t_p47619579_knowledge_management.password_reset_codes(reset_code, is_used);

-- ========================================
-- 16. ТАБЛИЦА: support_messages (Сообщения поддержки)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.support_messages (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ========================================
-- 17. ТАБЛИЦА: db_request_stats (Статистика запросов к БД)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.db_request_stats (
    id SERIAL PRIMARY KEY,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(request_date)
);

-- ========================================
-- 18. ТАБЛИЦА: function_call_stats (Статистика вызовов функций)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.function_call_stats (
    id SERIAL PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    call_count INTEGER DEFAULT 0,
    last_called_at TIMESTAMP,
    stats_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(function_name, stats_date)
);

-- ========================================
-- 19. ТАБЛИЦА: function_calls_detailed (Детальная статистика вызовов)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.function_calls_detailed (
    id SERIAL PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    called_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_function_calls_detailed_date ON t_p47619579_knowledge_management.function_calls_detailed(called_at);
CREATE INDEX IF NOT EXISTS idx_function_calls_detailed_function ON t_p47619579_knowledge_management.function_calls_detailed(function_name);

-- ========================================
-- 20. ТАБЛИЦА: video_conferences (Видеоконференции)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.video_conferences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    host_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    meeting_link TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    max_participants INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 21. ТАБЛИЦА: video_conference_participants (Участники видеоконференций)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.video_conference_participants (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.video_conferences(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'invited',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conference_id, employee_id)
);

-- ========================================
-- 22. ТАБЛИЦА: domains (Домены)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.domains (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    ssl_configured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 23. ТАБЛИЦА: lessons (Уроки)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    order_num INTEGER,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 24. ТАБЛИЦА: course_enrollments (Записи на курсы)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.course_enrollments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.courses(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    UNIQUE(course_id, employee_id)
);

-- ========================================
-- 25. ТАБЛИЦА: attendance (Посещаемость)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.attendance (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES t_p47619579_knowledge_management.lessons(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- ========================================
-- 26. ТАБЛИЦА: user_sessions (Пользовательские сессии)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.user_sessions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON t_p47619579_knowledge_management.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_employee ON t_p47619579_knowledge_management.user_sessions(employee_id);

-- ========================================
-- 27. ТАБЛИЦА: deadline_reminders (Напоминания о дедлайнах)
-- ========================================
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.deadline_reminders (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline_date TIMESTAMP NOT NULL,
    remind_before_minutes INTEGER DEFAULT 60,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- Завершено создание схемы и таблиц
