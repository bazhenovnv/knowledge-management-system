-- Добавляем данные прошлого месяца для сравнения
INSERT INTO function_call_stats (month_year, call_count, created_at, updated_at) 
VALUES ('2025-09', 1250, '2025-09-15 10:00:00', '2025-09-30 23:59:59')
ON CONFLICT (month_year) DO NOTHING;
