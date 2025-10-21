-- ========================================
-- ЭКСПОРТ БАЗЫ ДАННЫХ PostgreSQL -> SQL Server
-- Дата: 2025-10-21
-- База: t_p47619579_knowledge_management
-- Версия: Упрощённая (без схемы)
-- ========================================

-- ========================================
-- 1. ТАБЛИЦА: employees (Сотрудники)
-- ========================================
IF OBJECT_ID('employees', 'U') IS NOT NULL
    DROP TABLE employees;
GO

CREATE TABLE employees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    department NVARCHAR(100) NULL,
    position NVARCHAR(100) NULL,
    role NVARCHAR(20) NULL DEFAULT 'employee',
    hire_date DATE NULL,
    is_active BIT NULL DEFAULT 1,
    avatar_url NVARCHAR(MAX) NULL,
    theme NVARCHAR(20) NULL DEFAULT 'light',
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    last_password_reset DATETIME NULL
);
GO

SET IDENTITY_INSERT employees ON;
INSERT INTO employees 
(id, email, password_hash, full_name, phone, department, position, role, hire_date, is_active, avatar_url, theme, created_at, updated_at, last_password_reset)
VALUES 
(1, 'admin@company.com', 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', N'Баженов Николай Владимирович', '+7 (938) 523-17-81', 'IT', N'Главный администратор', 'admin', '2023-01-01', 1, NULL, 'light', '2025-09-24T08:14:45.565', '2025-10-17T11:14:11.570', NULL),
(2, 'teacher@company.com', 'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', N'Преподаватель Баженов', '', N'Партнерка', N'Разработчик', 'teacher', '2023-02-01', 1, NULL, 'light', '2025-09-24T08:14:45.565', '2025-10-14T10:31:12.684', NULL),
(37, 'newemployee@company.com', 'e472b65aedc9ed50541e814476f96046:4ec243d0fd3211cc76f9ed23af506d683703b6e8c51aea9be2fa9b8ec363d6cd', N'Новый Сотрудник', '+7 (999) 555-12-34', 'IT', N'Junior разработчик', 'employee', '2025-09-26', 1, NULL, 'light', '2025-10-14T12:14:05.991', '2025-10-14T12:14:05.991', NULL);
SET IDENTITY_INSERT employees OFF;
GO

-- ========================================
-- 2. ТАБЛИЦА: courses (Курсы)
-- ========================================
IF OBJECT_ID('courses', 'U') IS NOT NULL
    DROP TABLE courses;
GO

CREATE TABLE courses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    instructor_id INT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    duration_hours INT NULL,
    max_participants INT NULL,
    status NVARCHAR(20) NULL DEFAULT 'active',
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_courses_instructor FOREIGN KEY (instructor_id) 
        REFERENCES employees(id)
);
GO

SET IDENTITY_INSERT courses ON;
INSERT INTO courses 
(id, title, description, instructor_id, start_date, end_date, duration_hours, max_participants, status, created_at, updated_at)
VALUES 
(1, N'Основы React и TypeScript', N'Изучение современных подходов к фронтенд разработке', 2, '2024-01-15', '2024-03-15', 40, 20, 'active', '2025-09-24T08:14:45.582', '2025-09-24T08:14:45.582'),
(2, N'Информационная безопасность', N'Основы защиты корпоративной информации', 2, '2024-02-01', '2024-02-28', 16, 50, 'active', '2025-09-24T08:14:45.582', '2025-09-24T08:14:45.582');
SET IDENTITY_INSERT courses OFF;
GO

-- ========================================
-- 3. ТАБЛИЦА: tests (Тесты)
-- ========================================
IF OBJECT_ID('tests', 'U') IS NOT NULL
    DROP TABLE tests;
GO

CREATE TABLE tests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    course_id INT NULL,
    creator_id INT NULL,
    time_limit INT NULL,
    passing_score INT NULL DEFAULT 70,
    max_attempts INT NULL DEFAULT 1,
    is_active BIT NULL DEFAULT 1,
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_tests_course FOREIGN KEY (course_id) 
        REFERENCES courses(id),
    CONSTRAINT FK_tests_creator FOREIGN KEY (creator_id) 
        REFERENCES employees(id)
);
GO

SET IDENTITY_INSERT tests ON;
INSERT INTO tests 
(id, title, description, course_id, creator_id, time_limit, passing_score, max_attempts, is_active, created_at, updated_at)
VALUES 
(1, N'Основы информационной безопасности', N'Тест на знание базовых принципов информационной безопасности в компании', NULL, 1, 30, 70, 3, 1, '2025-10-13T14:29:16.821', '2025-10-13T14:29:16.821'),
(2, N'JavaScript: основы', N'Проверка знаний основ языка JavaScript для разработчиков', NULL, 1, 45, 80, 2, 0, '2025-10-13T14:29:16.821', '2025-10-14T11:54:05.860'),
(3, N'Корпоративная этика', N'Тест на знание правил корпоративной этики и делового общения', NULL, 1, 20, 75, 1, 0, '2025-10-13T14:29:16.821', '2025-10-13T14:54:10.292'),
(7, N'яваияукпй3 ы5кпй5пмц45ып111111111111111111111111111111111', N'ц45нй4и5ипц45пмы5нпц5ц', NULL, 1, NULL, 70, 3, 0, '2025-10-14T07:07:24.347', '2025-10-14T07:59:49.389'),
(11, N'уекпй4ерицекы цмерп4ц рп', N'45црпц5ерпц4ерпцепцц', NULL, 1, NULL, 70, 3, 0, '2025-10-14T07:08:09.671', '2025-10-14T07:08:27.596');
SET IDENTITY_INSERT tests OFF;
GO

-- ========================================
-- 4. ТАБЛИЦА: test_questions (Вопросы тестов)
-- ========================================
IF OBJECT_ID('test_questions', 'U') IS NOT NULL
    DROP TABLE test_questions;
GO

CREATE TABLE test_questions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    test_id INT NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type NVARCHAR(50) NULL DEFAULT 'single_choice',
    points INT NULL DEFAULT 1,
    order_num INT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_test_questions_test FOREIGN KEY (test_id) 
        REFERENCES tests(id)
);
GO

SET IDENTITY_INSERT test_questions ON;
INSERT INTO test_questions 
(id, test_id, question_text, question_type, points, order_num, created_at)
VALUES 
(1, 1, N'Что такое фишинг?', 'single_choice', 1, 1, '2025-10-13T14:29:16.840'),
(2, 1, N'Какие данные считаются конфиденциальными?', 'multiple_choice', 2, 2, '2025-10-13T14:29:16.840'),
(3, 1, N'Как часто следует менять пароль?', 'single_choice', 1, 3, '2025-10-13T14:29:16.840'),
(4, 1, N'Что делать при обнаружении подозрительной активности?', 'single_choice', 1, 4, '2025-10-13T14:29:16.840'),
(5, 2, N'Какой тип данных не существует в JavaScript?', 'single_choice', 1, 1, '2025-10-13T14:29:16.932'),
(6, 2, N'Что выведет console.log(typeof null)?', 'single_choice', 2, 2, '2025-10-13T14:29:16.932'),
(7, 2, N'Какие методы используются для работы с массивами?', 'multiple_choice', 2, 3, '2025-10-13T14:29:16.932'),
(8, 3, N'Что является основой корпоративной этики?', 'single_choice', 1, 1, '2025-10-13T14:29:16.964'),
(9, 3, N'Как следует вести себя на деловых переговорах?', 'single_choice', 1, 2, '2025-10-13T14:29:16.964'),
(10, 3, N'Что недопустимо в рабочей обстановке?', 'multiple_choice', 2, 3, '2025-10-13T14:29:16.964'),
(12, 11, N'укпцкупекпцпцкепцекпцкп', 'single_choice', 1, 1, '2025-10-14T07:08:09.698'),
(13, 7, N'ц45нйц5имц45иц4', 'single_choice', 1, 1, '2025-10-14T07:08:57.592');
SET IDENTITY_INSERT test_questions OFF;
GO

-- ========================================
-- 5. ТАБЛИЦА: test_answers (Ответы на вопросы)
-- ========================================
IF OBJECT_ID('test_answers', 'U') IS NOT NULL
    DROP TABLE test_answers;
GO

CREATE TABLE test_answers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NULL DEFAULT 0,
    order_num INT NULL,
    CONSTRAINT FK_test_answers_question FOREIGN KEY (question_id) 
        REFERENCES test_questions(id)
);
GO

SET IDENTITY_INSERT test_answers ON;
INSERT INTO test_answers 
(id, question_id, answer_text, is_correct, order_num)
VALUES 
(1, 1, N'Метод социальной инженерии для кражи данных', 1, 1),
(2, 1, N'Вид спорта', 0, 2),
(3, 1, N'Способ шифрования', 0, 3),
(4, 2, N'Личные данные клиентов', 1, 1),
(5, 2, N'Финансовая информация', 1, 2),
(6, 2, N'Публичные новости компании', 0, 3),
(7, 3, N'Каждые 90 дней', 1, 1),
(8, 3, N'Раз в 5 лет', 0, 2),
(9, 3, N'Никогда', 0, 3),
(10, 4, N'Немедленно сообщить в службу безопасности', 1, 1),
(11, 4, N'Проигнорировать', 0, 2),
(12, 5, N'integer', 0, 1),
(13, 5, N'float', 1, 2),
(14, 5, N'string', 0, 3),
(15, 6, N'"object"', 1, 1),
(16, 6, N'"null"', 0, 2),
(17, 7, N'map()', 1, 1),
(18, 7, N'filter()', 1, 2),
(19, 7, N'compile()', 0, 3),
(20, 8, N'Честность и уважение', 1, 1),
(21, 8, N'Агрессивное поведение', 0, 2),
(22, 9, N'Профессионально и вежливо', 1, 1),
(23, 9, N'Грубо и напористо', 0, 2),
(24, 10, N'Дискриминация', 1, 1),
(25, 10, N'Уважение коллег', 0, 2),
(26, 12, N'цукпцкупцке', 0, 1),
(27, 13, N'й4ц5йц45йц4', 0, 1);
SET IDENTITY_INSERT test_answers OFF;
GO

-- ========================================
-- 6. ТАБЛИЦА: course_enrollments (Записи на курсы)
-- ========================================
IF OBJECT_ID('course_enrollments', 'U') IS NOT NULL
    DROP TABLE course_enrollments;
GO

CREATE TABLE course_enrollments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    employee_id INT NOT NULL,
    enrolled_at DATETIME NULL DEFAULT GETDATE(),
    completed_at DATETIME NULL,
    status NVARCHAR(20) NULL DEFAULT 'active',
    progress INT NULL DEFAULT 0,
    CONSTRAINT FK_enrollments_course FOREIGN KEY (course_id) 
        REFERENCES courses(id),
    CONSTRAINT FK_enrollments_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
GO

SET IDENTITY_INSERT course_enrollments ON;
INSERT INTO course_enrollments 
(id, course_id, employee_id, enrolled_at, completed_at, status, progress)
VALUES 
(1, 1, 1, '2024-01-15T10:00:00', NULL, 'active', 45),
(2, 2, 1, '2024-02-01T09:30:00', '2024-02-28T16:00:00', 'completed', 100),
(3, 1, 2, '2024-01-16T14:20:00', NULL, 'active', 30);
SET IDENTITY_INSERT course_enrollments OFF;
GO

-- ========================================
-- 7. ТАБЛИЦА: user_sessions (Сессии пользователей)
-- ========================================
IF OBJECT_ID('user_sessions', 'U') IS NOT NULL
    DROP TABLE user_sessions;
GO

CREATE TABLE user_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NOT NULL,
    token NVARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    user_agent NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(45) NULL,
    CONSTRAINT FK_user_sessions_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
GO

-- ========================================
-- 8. ТАБЛИЦА: scheduled_notifications (Запланированные уведомления)
-- ========================================
IF OBJECT_ID('scheduled_notifications', 'U') IS NOT NULL
    DROP TABLE scheduled_notifications;
GO

CREATE TABLE scheduled_notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NOT NULL,
    notification_type NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    related_entity_type NVARCHAR(50) NULL,
    related_entity_id INT NULL,
    scheduled_for DATETIME NOT NULL,
    channels NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NULL DEFAULT 'pending',
    retry_count INT NULL DEFAULT 0,
    error_message NVARCHAR(MAX) NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    sent_at DATETIME NULL,
    CONSTRAINT FK_scheduled_notifications_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
GO

-- ========================================
-- 9. ТАБЛИЦА: test_results (Результаты тестов)
-- ========================================
IF OBJECT_ID('test_results', 'U') IS NOT NULL
    DROP TABLE test_results;
GO

CREATE TABLE test_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    test_id INT NOT NULL,
    employee_id INT NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    passed BIT NOT NULL,
    attempt_number INT NULL DEFAULT 1,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    time_spent INT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_test_results_test FOREIGN KEY (test_id) 
        REFERENCES tests(id),
    CONSTRAINT FK_test_results_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
GO

SET IDENTITY_INSERT test_results ON;
INSERT INTO test_results 
(id, test_id, employee_id, score, max_score, percentage, passed, attempt_number, started_at, completed_at, time_spent, created_at)
VALUES 
(1, 1, 1, 4, 5, 80.00, 1, 1, '2025-10-13T15:00:00', '2025-10-13T15:25:00', 1500, '2025-10-13T15:25:00'),
(2, 2, 1, 6, 8, 75.00, 0, 1, '2025-10-13T16:00:00', '2025-10-13T16:40:00', 2400, '2025-10-13T16:40:00');
SET IDENTITY_INSERT test_results OFF;
GO

-- ========================================
-- 10. ТАБЛИЦА: deadline_reminders (Напоминания о дедлайнах)
-- ========================================
IF OBJECT_ID('deadline_reminders', 'U') IS NOT NULL
    DROP TABLE deadline_reminders;
GO

CREATE TABLE deadline_reminders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    deadline DATETIME NOT NULL,
    reminder_intervals NVARCHAR(MAX) NULL,
    is_active BIT NULL DEFAULT 1,
    created_at DATETIME NULL DEFAULT GETDATE()
);
GO

-- ========================================
-- 11. ТАБЛИЦА: db_request_stats (Статистика запросов к БД)
-- ========================================
IF OBJECT_ID('db_request_stats', 'U') IS NOT NULL
    DROP TABLE db_request_stats;
GO

CREATE TABLE db_request_stats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    month_year NVARCHAR(7) NOT NULL,
    request_count INT NULL DEFAULT 0,
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE()
);
GO

-- ========================================
-- 12. ТАБЛИЦА: function_call_stats (Статистика вызовов функций)
-- ========================================
IF OBJECT_ID('function_call_stats', 'U') IS NOT NULL
    DROP TABLE function_call_stats;
GO

CREATE TABLE function_call_stats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    month_year NVARCHAR(7) NOT NULL,
    call_count INT NULL DEFAULT 0,
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE()
);
GO

-- ========================================
-- ЗАВЕРШЕНО
-- ========================================
PRINT 'База данных успешно создана и заполнена данными!';
PRINT 'Всего таблиц: 12';
