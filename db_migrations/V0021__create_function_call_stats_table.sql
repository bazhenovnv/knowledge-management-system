-- Таблица для статистики вызовов cloud функций
CREATE TABLE IF NOT EXISTS function_call_stats (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    call_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month_year)
);

CREATE INDEX IF NOT EXISTS idx_function_call_stats_month ON function_call_stats(month_year DESC);

-- Добавляем начальные данные для текущего месяца
INSERT INTO function_call_stats (month_year, call_count) 
VALUES (TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 0)
ON CONFLICT (month_year) DO NOTHING;
