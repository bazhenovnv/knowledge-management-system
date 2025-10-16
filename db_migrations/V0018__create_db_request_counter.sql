-- Создание таблицы для счётчика обращений к базе данных
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.db_request_stats (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL, -- Формат: YYYY-MM
    request_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month_year)
);

-- Индекс для быстрого поиска по месяцу
CREATE INDEX IF NOT EXISTS idx_db_request_stats_month_year 
ON t_p47619579_knowledge_management.db_request_stats(month_year);

-- Вставка записи для текущего месяца если её нет
INSERT INTO t_p47619579_knowledge_management.db_request_stats (month_year, request_count)
VALUES (TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 0)
ON CONFLICT (month_year) DO NOTHING;

COMMENT ON TABLE t_p47619579_knowledge_management.db_request_stats IS 'Статистика обращений к базе данных по месяцам';
COMMENT ON COLUMN t_p47619579_knowledge_management.db_request_stats.month_year IS 'Месяц и год в формате YYYY-MM';
COMMENT ON COLUMN t_p47619579_knowledge_management.db_request_stats.request_count IS 'Количество обращений к БД за месяц';