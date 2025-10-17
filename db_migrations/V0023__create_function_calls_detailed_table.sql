-- Таблица для детальной статистики по каждой функции
CREATE TABLE IF NOT EXISTS function_calls_detailed (
    id SERIAL PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    call_count INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(function_name, month_year)
);

CREATE INDEX IF NOT EXISTS idx_function_calls_detailed_month ON function_calls_detailed(month_year DESC);
CREATE INDEX IF NOT EXISTS idx_function_calls_detailed_function ON function_calls_detailed(function_name);

-- Добавляем тестовые данные для текущего месяца
INSERT INTO function_calls_detailed (function_name, month_year, call_count, avg_response_time, error_count) VALUES
    ('database', '2025-10', 45, 120, 2),
    ('auth', '2025-10', 23, 80, 0),
    ('track-function-call', '2025-10', 2, 45, 0)
ON CONFLICT (function_name, month_year) DO NOTHING;

-- Добавляем данные за прошлый месяц
INSERT INTO function_calls_detailed (function_name, month_year, call_count, avg_response_time, error_count) VALUES
    ('database', '2025-09', 780, 135, 15),
    ('auth', '2025-09', 340, 75, 3),
    ('email-notifications', '2025-09', 120, 200, 8),
    ('password-reset', '2025-09', 10, 150, 1)
ON CONFLICT (function_name, month_year) DO NOTHING;
