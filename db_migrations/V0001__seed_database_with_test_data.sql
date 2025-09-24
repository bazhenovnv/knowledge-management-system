-- Заполнение базы данных тестовыми данными
-- Добавление тестовых сотрудников

INSERT INTO employees (email, password_hash, full_name, phone, department, position, role, hire_date) VALUES 
('admin@company.com', 'admin_hash', 'Администратор Системы', NULL, 'IT', 'Администратор', 'admin', '2023-01-01'),
('teacher@company.com', 'teacher_hash', 'Преподаватель Курсов', NULL, 'Обучение', 'Старший преподаватель', 'teacher', '2023-02-01'),
('ivanov@company.com', 'ivanov_hash', 'Иванов Иван Иванович', '+7 (999) 123-45-67', 'Отдел разработки', 'Senior разработчик', 'employee', '2023-03-15'),
('petrova@company.com', 'petrova_hash', 'Петрова Анна Сергеевна', '+7 (999) 234-56-78', 'Отдел продаж', 'Менеджер по продажам', 'employee', '2023-04-20'),
('sidorov@company.com', 'sidorov_hash', 'Сидоров Петр Михайлович', '+7 (999) 345-67-89', 'Техническая поддержка', 'Специалист тех. поддержки', 'employee', '2023-05-10');

-- Добавление тестовых курсов 
INSERT INTO courses (title, description, instructor_id, start_date, end_date, duration_hours, max_participants, status) VALUES 
('Основы React и TypeScript', 'Изучение современных подходов к фронтенд разработке', 2, '2024-01-15', '2024-03-15', 40, 20, 'active'),
('Информационная безопасность', 'Основы защиты корпоративной информации', 2, '2024-02-01', '2024-02-28', 16, 50, 'active');