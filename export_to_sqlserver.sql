-- ========================================
-- ЭКСПОРТ БАЗЫ ДАННЫХ PostgreSQL -> SQL Server
-- Дата: 2025-10-21
-- База: t_p47619579_knowledge_management
-- ========================================

-- Создание схемы
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 't_p47619579_knowledge_management')
BEGIN
    EXEC('CREATE SCHEMA t_p47619579_knowledge_management')
END
GO

-- ========================================
-- 1. ТАБЛИЦА: employees (Сотрудники)
-- ========================================
IF OBJECT_ID('t_p47619579_knowledge_management.employees', 'U') IS NOT NULL
    DROP TABLE t_p47619579_knowledge_management.employees;
GO

CREATE TABLE t_p47619579_knowledge_management.employees (
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

SET IDENTITY_INSERT t_p47619579_knowledge_management.employees ON;
INSERT INTO t_p47619579_knowledge_management.employees 
(id, email, password_hash, full_name, phone, department, position, role, hire_date, is_active, avatar_url, theme, created_at, updated_at, last_password_reset)
VALUES 
(1, 'admin@company.com', 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', N'Баженов Николай Владимирович', '+7 (938) 523-17-81', 'IT', N'Главный администратор', 'admin', '2023-01-01', 1, NULL, 'light', '2025-09-24T08:14:45.565', '2025-10-17T11:14:11.570', NULL),
(2, 'teacher@company.com', 'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', N'Преподаватель Баженов', '', N'Партнерка', N'Разработчик', 'teacher', '2023-02-01', 1, NULL, 'light', '2025-09-24T08:14:45.565', '2025-10-14T10:31:12.684', NULL),
(37, 'newemployee@company.com', 'e472b65aedc9ed50541e814476f96046:4ec243d0fd3211cc76f9ed23af506d683703b6e8c51aea9be2fa9b8ec363d6cd', N'Новый Сотрудник', '+7 (999) 555-12-34', 'IT', N'Junior разработчик', 'employee', '2025-09-26', 1, NULL, 'light', '2025-10-14T12:14:05.991', '2025-10-14T12:14:05.991', NULL);
SET IDENTITY_INSERT t_p47619579_knowledge_management.employees OFF;
GO

-- ========================================
-- 2. ТАБЛИЦА: courses (Курсы)
-- ========================================
IF OBJECT_ID('t_p47619579_knowledge_management.courses', 'U') IS NOT NULL
    DROP TABLE t_p47619579_knowledge_management.courses;
GO

CREATE TABLE t_p47619579_knowledge_management.courses (
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
        REFERENCES t_p47619579_knowledge_management.employees(id)
);
GO

SET IDENTITY_INSERT t_p47619579_knowledge_management.courses ON;
INSERT INTO t_p47619579_knowledge_management.courses 
(id, title, description, instructor_id, start_date, end_date, duration_hours, max_participants, status, created_at, updated_at)
VALUES 
(1, N'Основы React и TypeScript', N'Изучение современных подходов к фронтенд разработке', 2, '2024-01-15', '2024-03-15', 40, 20, 'active', '2025-09-24T08:14:45.582', '2025-09-24T08:14:45.582'),
(2, N'Информационная безопасность', N'Основы защиты корпоративной информации', 2, '2024-02-01', '2024-02-28', 16, 50, 'active', '2025-09-24T08:14:45.582', '2025-09-24T08:14:45.582');
SET IDENTITY_INSERT t_p47619579_knowledge_management.courses OFF;
GO

-- ========================================
-- 3. ТАБЛИЦА: tests (Тесты)
-- ========================================
IF OBJECT_ID('t_p47619579_knowledge_management.tests', 'U') IS NOT NULL
    DROP TABLE t_p47619579_knowledge_management.tests;
GO

CREATE TABLE t_p47619579_knowledge_management.tests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    course_id INT NULL,
    creator_id BIGINT NULL,
    time_limit INT NULL,
    passing_score INT NULL DEFAULT 70,
    max_attempts INT NULL DEFAULT 1,
    is_active BIT NULL DEFAULT 1,
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_tests_course FOREIGN KEY (course_id) 
        REFERENCES t_p47619579_knowledge_management.courses(id),
    CONSTRAINT FK_tests_creator FOREIGN KEY (creator_id) 
        REFERENCES t_p47619579_knowledge_management.employees(id)
);
GO

SET IDENTITY_INSERT t_p47619579_knowledge_management.tests ON;
INSERT INTO t_p47619579_knowledge_management.tests 
(id, title, description, course_id, creator_id, time_limit, passing_score, max_attempts, is_active, created_at, updated_at)
VALUES 
(1, N'Основы информационной безопасности', N'Тест на знание базовых принципов информационной безопасности в компании', NULL, 1, 30, 70, 3, 1, '2025-10-13T14:29:16.821', '2025-10-13T14:29:16.821'),
(2, N'JavaScript: основы', N'Проверка знаний основ языка JavaScript для разработчиков', NULL, 1, 45, 80, 2, 0, '2025-10-13T14:29:16.821', '2025-10-14T11:54:05.860'),
(3, N'Корпоративная этика', N'Тест на знание правил корпоративной этики и делового общения', NULL, 1, 20, 75, 1, 0, '2025-10-13T14:29:16.821', '2025-10-13T14:54:10.292'),
(7, N'яваияукпй3 ы5кпй5пмц45ып111111111111111111111111111111111', N'ц45нй4и5ипц45пмы5нпц5ц', NULL, 1, NULL, 70, 3, 0, '2025-10-14T07:07:24.347', '2025-10-14T07:59:49.389'),
(11, N'уекпй4ерицекы цмерп4ц рп', N'45црпц5ерпц4ерпцепцц', NULL, 1, NULL, 70, 3, 0, '2025-10-14T07:08:09.671', '2025-10-14T07:08:27.596');
SET IDENTITY_INSERT t_p47619579_knowledge_management.tests OFF;
GO

-- ========================================
-- 4. ТАБЛИЦА: test_questions (Вопросы тестов)
-- ========================================
IF OBJECT_ID('t_p47619579_knowledge_management.test_questions', 'U') IS NOT NULL
    DROP TABLE t_p47619579_knowledge_management.test_questions;
GO

CREATE TABLE t_p47619579_knowledge_management.test_questions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    test_id INT NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type NVARCHAR(50) NULL DEFAULT 'single_choice',
    points INT NULL DEFAULT 1,
    order_num INT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_test_questions_test FOREIGN KEY (test_id) 
        REFERENCES t_p47619579_knowledge_management.tests(id)
);
GO

SET IDENTITY_INSERT t_p47619579_knowledge_management.test_questions ON;
INSERT INTO t_p47619579_knowledge_management.test_questions 
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
SET IDENTITY_INSERT t_p47619579_knowledge_management.test_questions OFF;
GO

-- ========================================
-- 5. ТАБЛИЦА: test_answers (Ответы на вопросы)
-- ========================================
IF OBJECT_ID('t_p47619579_knowledge_management.test_answers', 'U') IS NOT NULL
    DROP TABLE t_p47619579_knowledge_management.test_answers;
GO

CREATE TABLE t_p47619579_knowledge_management.test_answers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NULL DEFAULT 0,
    order_num INT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_test_answers_question FOREIGN KEY (question_id) 
        REFERENCES t_p47619579_knowledge_management.test_questions(id)
);
GO

SET IDENTITY_INSERT t_p47619579_knowledge_management.test_answers ON;
INSERT INTO t_p47619579_knowledge_management.test_answers 
(id, question_id, answer_text, is_correct, order_num)
VALUES 
(1, 1, N'Вид мошенничества для получения конфиденциальных данных', 1, 1),
(2, 1, N'Способ шифрования данных', 0, 2),
(3, 1, N'Метод резервного копирования', 0, 3),
(4, 1, N'Антивирусная программа', 0, 4),
(5, 2, N'Персональные данные клиентов', 1, 1),
(6, 2, N'Финансовая отчетность компании', 1, 2),
(7, 2, N'Контактные данные сотрудников', 1, 3),
(8, 2, N'Публичная информация на сайте', 0, 4),
(9, 3, N'Каждые 3-6 месяцев', 1, 1),
(10, 3, N'Каждую неделю', 0, 2),
(11, 3, N'Один раз в год', 0, 3),
(12, 3, N'Никогда', 0, 4),
(13, 4, N'Немедленно сообщить в IT-отдел', 1, 1),
(14, 4, N'Игнорировать', 0, 2),
(15, 4, N'Перезагрузить компьютер', 0, 3),
(16, 4, N'Рассказать коллегам', 0, 4),
(17, 5, N'Integer', 1, 1),
(18, 5, N'String', 0, 2),
(19, 5, N'Boolean', 0, 3),
(20, 5, N'Object', 0, 4),
(21, 6, N'object', 1, 1),
(22, 6, N'null', 0, 2),
(23, 6, N'undefined', 0, 3),
(24, 6, N'number', 0, 4),
(25, 7, N'map()', 1, 1),
(26, 7, N'filter()', 1, 2),
(27, 7, N'reduce()', 1, 3),
(28, 7, N'split()', 0, 4),
(29, 8, N'Уважение к коллегам и профессионализм', 1, 1),
(30, 8, N'Личные интересы превыше всего', 0, 2),
(31, 8, N'Конкуренция любой ценой', 0, 3),
(32, 8, N'Игнорирование правил', 0, 4),
(33, 9, N'Быть пунктуальным и подготовленным', 1, 1),
(34, 9, N'Опаздывать это нормально', 0, 2),
(35, 9, N'Перебивать собеседника', 0, 3),
(36, 9, N'Проверять телефон во время встречи', 0, 4),
(37, 10, N'Дискриминация', 1, 1),
(38, 10, N'Грубость и неуважение', 1, 2),
(39, 10, N'Сплетни о коллегах', 1, 3),
(40, 10, N'Вежливое общение', 0, 4),
(42, 12, N'цекпцекпцп', 1, 1),
(43, 13, N'ц45еиц45у4в111111111111111111111111', 1, 1),
(44, 13, N'енроу5енроуенроунровн', 0, 2);
SET IDENTITY_INSERT t_p47619579_knowledge_management.test_answers OFF;
GO

-- ========================================
-- ДОПОЛНИТЕЛЬНЫЕ ТАБЛИЦЫ (без данных)
-- ========================================

-- attendance
CREATE TABLE t_p47619579_knowledge_management.attendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NULL,
    lesson_id INT NULL,
    attended BIT NULL DEFAULT 0,
    attendance_date DATE NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- course_enrollments
CREATE TABLE t_p47619579_knowledge_management.course_enrollments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NULL,
    employee_id INT NULL,
    enrollment_date DATE NULL,
    status NVARCHAR(20) NULL DEFAULT 'active',
    completion_date DATE NULL,
    certificate_url NVARCHAR(MAX) NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- lessons
CREATE TABLE t_p47619579_knowledge_management.lessons (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    content NVARCHAR(MAX) NULL,
    order_num INT NULL,
    duration_minutes INT NULL,
    lesson_date DATETIME NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- notifications
CREATE TABLE t_p47619579_knowledge_management.notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NULL,
    type NVARCHAR(50) NULL,
    is_read BIT NULL DEFAULT 0,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- password_reset_codes
CREATE TABLE t_p47619579_knowledge_management.password_reset_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NOT NULL,
    code NVARCHAR(6) NOT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    used BIT NULL DEFAULT 0
);

-- scheduled_notifications
CREATE TABLE t_p47619579_knowledge_management.scheduled_notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NULL,
    notification_type NVARCHAR(50) NULL,
    title NVARCHAR(255) NULL,
    message NVARCHAR(MAX) NULL,
    scheduled_time DATETIME NULL,
    sent BIT NULL DEFAULT 0,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- support_messages
CREATE TABLE t_p47619579_knowledge_management.support_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NULL,
    subject NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) NULL DEFAULT 'open',
    created_at DATETIME NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL DEFAULT GETDATE()
);

-- test_results
CREATE TABLE t_p47619579_knowledge_management.test_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    test_id INT NULL,
    employee_id INT NULL,
    score INT NULL,
    max_score INT NULL,
    percentage DECIMAL(5,2) NULL,
    passed BIT NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- test_user_answers
CREATE TABLE t_p47619579_knowledge_management.test_user_answers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    test_result_id INT NULL,
    question_id INT NULL,
    answer_id INT NULL,
    is_correct BIT NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- user_sessions
CREATE TABLE t_p47619579_knowledge_management.user_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    employee_id INT NOT NULL,
    session_token NVARCHAR(255) NOT NULL,
    created_at DATETIME NULL DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    is_active BIT NULL DEFAULT 1
);

PRINT 'Импорт завершён успешно!';
PRINT 'Импортировано:';
PRINT '  - 3 сотрудника (employees)';
PRINT '  - 2 курса (courses)';
PRINT '  - 5 тестов (tests)';
PRINT '  - 12 вопросов (test_questions)';
PRINT '  - 43 ответа (test_answers)';
GO
