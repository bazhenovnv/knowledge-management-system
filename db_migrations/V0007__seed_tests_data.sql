-- Создание тестовых тестов
INSERT INTO t_p47619579_knowledge_management.tests (title, description, creator_id, time_limit, passing_score, max_attempts, is_active)
VALUES 
('Основы информационной безопасности', 'Тест на знание базовых принципов информационной безопасности в компании', 1, 30, 70, 3, true),
('JavaScript: основы', 'Проверка знаний основ языка JavaScript для разработчиков', 1, 45, 80, 2, true),
('Корпоративная этика', 'Тест на знание правил корпоративной этики и делового общения', 1, 20, 75, 1, true);

-- Вопросы для теста "Основы информационной безопасности"
INSERT INTO t_p47619579_knowledge_management.test_questions (test_id, question_text, question_type, points, order_num)
VALUES 
(1, 'Что такое фишинг?', 'single_choice', 1, 1),
(1, 'Какие данные считаются конфиденциальными?', 'multiple_choice', 2, 2),
(1, 'Как часто следует менять пароль?', 'single_choice', 1, 3),
(1, 'Что делать при обнаружении подозрительной активности?', 'single_choice', 1, 4);

-- Ответы для вопроса 1 (Что такое фишинг?)
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(1, 'Вид мошенничества для получения конфиденциальных данных', true, 1),
(1, 'Способ шифрования данных', false, 2),
(1, 'Метод резервного копирования', false, 3),
(1, 'Антивирусная программа', false, 4);

-- Ответы для вопроса 2 (Какие данные конфиденциальны?)
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(2, 'Персональные данные клиентов', true, 1),
(2, 'Финансовая отчетность компании', true, 2),
(2, 'Контактные данные сотрудников', true, 3),
(2, 'Публичная информация на сайте', false, 4);

-- Ответы для вопроса 3 (Как часто менять пароль?)
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(3, 'Каждые 3-6 месяцев', true, 1),
(3, 'Каждую неделю', false, 2),
(3, 'Один раз в год', false, 3),
(3, 'Никогда', false, 4);

-- Ответы для вопроса 4 (Что делать при подозрительной активности?)
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(4, 'Немедленно сообщить в IT-отдел', true, 1),
(4, 'Игнорировать', false, 2),
(4, 'Перезагрузить компьютер', false, 3),
(4, 'Рассказать коллегам', false, 4);

-- Вопросы для теста "JavaScript: основы"
INSERT INTO t_p47619579_knowledge_management.test_questions (test_id, question_text, question_type, points, order_num)
VALUES 
(2, 'Какой тип данных не существует в JavaScript?', 'single_choice', 1, 1),
(2, 'Что выведет console.log(typeof null)?', 'single_choice', 2, 2),
(2, 'Какие методы используются для работы с массивами?', 'multiple_choice', 2, 3);

-- Ответы для теста JavaScript
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(5, 'Integer', true, 1),
(5, 'String', false, 2),
(5, 'Boolean', false, 3),
(5, 'Object', false, 4),
(6, 'object', true, 1),
(6, 'null', false, 2),
(6, 'undefined', false, 3),
(6, 'number', false, 4),
(7, 'map()', true, 1),
(7, 'filter()', true, 2),
(7, 'reduce()', true, 3),
(7, 'split()', false, 4);

-- Вопросы для теста "Корпоративная этика"
INSERT INTO t_p47619579_knowledge_management.test_questions (test_id, question_text, question_type, points, order_num)
VALUES 
(3, 'Что является основой корпоративной этики?', 'single_choice', 1, 1),
(3, 'Как следует вести себя на деловых переговорах?', 'single_choice', 1, 2),
(3, 'Что недопустимо в рабочей обстановке?', 'multiple_choice', 2, 3);

-- Ответы для теста Корпоративная этика
INSERT INTO t_p47619579_knowledge_management.test_answers (question_id, answer_text, is_correct, order_num)
VALUES 
(8, 'Уважение к коллегам и профессионализм', true, 1),
(8, 'Личные интересы превыше всего', false, 2),
(8, 'Конкуренция любой ценой', false, 3),
(8, 'Игнорирование правил', false, 4),
(9, 'Быть пунктуальным и подготовленным', true, 1),
(9, 'Опаздывать это нормально', false, 2),
(9, 'Перебивать собеседника', false, 3),
(9, 'Проверять телефон во время встречи', false, 4),
(10, 'Дискриминация', true, 1),
(10, 'Грубость и неуважение', true, 2),
(10, 'Сплетни о коллегах', true, 3),
(10, 'Вежливое общение', false, 4);