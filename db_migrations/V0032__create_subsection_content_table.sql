-- Create subsection_content table for storing knowledge section content
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.subsection_content (
    id SERIAL PRIMARY KEY,
    subsection_key VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on subsection_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_subsection_key ON t_p47619579_knowledge_management.subsection_content(subsection_key);

-- Add some default content for common subsections
INSERT INTO t_p47619579_knowledge_management.subsection_content (subsection_key, content) 
VALUES 
    ('about-company', '<h2>О компании</h2><p>AB-Онлайн Касса — ведущий поставщик кассового оборудования и решений для автоматизации торговли в Краснодаре и Краснодарском крае.</p>'),
    ('sales-dept', '<h2>Отдел продаж</h2><p>Консультирование клиентов, подбор оборудования, оформление договоров.</p>'),
    ('tech-dept', '<h2>Технический отдел</h2><p>Настройка, подключение и техническая поддержка оборудования.</p>'),
    ('support-dept', '<h2>Поддержка</h2><p>Решение вопросов клиентов, консультации по эксплуатации.</p>')
ON CONFLICT (subsection_key) DO NOTHING;