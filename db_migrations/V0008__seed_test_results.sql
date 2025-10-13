-- Добавляем тестовые результаты прохождения тестов
-- Результат 1: Сотрудник 1 прошел тест "Основы информационной безопасности"
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (1, 1, 5, 6, 83, true, 1, CURRENT_TIMESTAMP - INTERVAL '2 days', 1200);

-- Результат 2: Сотрудник 25 прошел тест "JavaScript: основы"
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (2, 25, 4, 5, 80, true, 1, CURRENT_TIMESTAMP - INTERVAL '1 day', 1800);

-- Результат 3: Сотрудник 26 не прошел тест "JavaScript: основы"
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (2, 26, 3, 5, 60, false, 1, CURRENT_TIMESTAMP - INTERVAL '1 day', 1500);

-- Результат 4: Сотрудник 27 прошел тест "Корпоративная этика"
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (3, 27, 4, 4, 100, true, 1, CURRENT_TIMESTAMP - INTERVAL '3 hours', 900);

-- Результат 5: Сотрудник 1 прошел тест "Корпоративная этика"
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (3, 1, 3, 4, 75, true, 1, CURRENT_TIMESTAMP - INTERVAL '5 hours', 850);

-- Результат 6: Сотрудник 25 не прошел тест "Основы информационной безопасности" (первая попытка)
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (1, 25, 3, 6, 50, false, 1, CURRENT_TIMESTAMP - INTERVAL '4 days', 1100);

-- Результат 7: Сотрудник 25 прошел тест "Основы информационной безопасности" (вторая попытка)
INSERT INTO t_p47619579_knowledge_management.test_results (test_id, employee_id, score, max_score, percentage, passed, attempt_number, completed_at, time_spent)
VALUES (1, 25, 5, 6, 83, true, 2, CURRENT_TIMESTAMP - INTERVAL '3 days', 1350);