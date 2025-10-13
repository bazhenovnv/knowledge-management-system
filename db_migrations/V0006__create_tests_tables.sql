-- Создание таблицы тестов
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INTEGER REFERENCES t_p47619579_knowledge_management.courses(id),
    creator_id INTEGER REFERENCES t_p47619579_knowledge_management.employees(id),
    time_limit INTEGER,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы вопросов
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.tests(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'single_choice',
    points INTEGER DEFAULT 1,
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы вариантов ответов
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_questions(id),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы результатов тестов
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.tests(id),
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    passed BOOLEAN DEFAULT false,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ответов пользователей
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.test_user_answers (
    id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_results(id),
    question_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.test_questions(id),
    answer_id INTEGER REFERENCES t_p47619579_knowledge_management.test_answers(id),
    answer_text TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON t_p47619579_knowledge_management.tests(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_creator_id ON t_p47619579_knowledge_management.tests(creator_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON t_p47619579_knowledge_management.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_question_id ON t_p47619579_knowledge_management.test_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON t_p47619579_knowledge_management.test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_employee_id ON t_p47619579_knowledge_management.test_results(employee_id);
CREATE INDEX IF NOT EXISTS idx_test_user_answers_result_id ON t_p47619579_knowledge_management.test_user_answers(result_id);