-- Создание таблицы для материалов базы знаний
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.knowledge_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    duration VARCHAR(50),
    tags TEXT[],
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    enrollments INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_knowledge_materials_category ON t_p47619579_knowledge_management.knowledge_materials(category);
CREATE INDEX idx_knowledge_materials_difficulty ON t_p47619579_knowledge_management.knowledge_materials(difficulty);
CREATE INDEX idx_knowledge_materials_is_published ON t_p47619579_knowledge_management.knowledge_materials(is_published);
CREATE INDEX idx_knowledge_materials_title ON t_p47619579_knowledge_management.knowledge_materials USING gin(to_tsvector('russian', title));

-- Добавляем тестовые материалы
INSERT INTO t_p47619579_knowledge_management.knowledge_materials (title, description, content, category, difficulty, duration, tags, rating, enrollments, created_by)
VALUES 
(
    'Основы React и TypeScript',
    'Комплексное введение в разработку современных веб-приложений с использованием React и TypeScript',
    E'# Основы React и TypeScript\n\n## Введение\nReact — это популярная JavaScript библиотека для создания пользовательских интерфейсов.\n\n## Компоненты\nКомпоненты — это строительные блоки React приложений.\n\n## TypeScript\nTypeScript добавляет статическую типизацию в JavaScript.\n\n## Практика\n- Создание компонентов\n- Работа с props\n- Использование hooks\n- Типизация с TypeScript',
    'Программирование',
    'medium',
    '2 часа',
    ARRAY['React', 'TypeScript', 'Frontend', 'JavaScript'],
    4.8,
    156,
    'Администратор'
),
(
    'Информационная безопасность',
    'Основы защиты информации и кибербезопасности в корпоративной среде',
    E'# Информационная безопасность\n\n## Что такое ИБ?\nИнформационная безопасность — защита информации от несанкционированного доступа.\n\n## Основные угрозы\n- Фишинг\n- Вредоносное ПО\n- Социальная инженерия\n\n## Меры защиты\n1. Сильные пароли\n2. Двухфакторная аутентификация\n3. Регулярные обновления\n4. Резервное копирование',
    'Безопасность',
    'easy',
    '1.5 часа',
    ARRAY['Безопасность', 'Кибербезопасность', 'Защита данных'],
    4.9,
    203,
    'Администратор'
),
(
    'Управление проектами по Agile',
    'Гибкие методологии управления проектами: Scrum, Kanban, XP',
    E'# Agile методологии\n\n## Agile Manifesto\nЦенности и принципы гибкой разработки.\n\n## Scrum\n- Роли: Product Owner, Scrum Master, Team\n- Артефакты: Product Backlog, Sprint Backlog\n- События: Sprint Planning, Daily Standup, Review, Retrospective\n\n## Kanban\nВизуализация процессов и ограничение WIP.\n\n## Практические советы\nКак внедрить Agile в команде.',
    'Менеджмент',
    'medium',
    '3 часа',
    ARRAY['Agile', 'Scrum', 'Kanban', 'Управление проектами'],
    4.7,
    134,
    'Администратор'
);