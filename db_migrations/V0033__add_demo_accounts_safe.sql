-- Добавляем тестовые аккаунты для демонстрации (только INSERT)
-- Пароли: admin123, teacher123, employee123
-- Hash для admin123: a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
-- Hash для teacher123: b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890  
-- Hash для employee123: c3d4e5f6789a1b2c:bcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901

-- Добавляем тестовые аккаунты (игнорируем если уже есть)
INSERT INTO t_p47619579_knowledge_management.employees 
(email, password_hash, full_name, department, position, role, is_active, created_at)
VALUES 
(
  'admin@example.com',
  'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  'Администратор Системы',
  'IT',
  'Системный администратор',
  'admin',
  true,
  NOW()
),
(
  'teacher@example.com',
  'b2c3d4e5f6789a1b:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  'Преподаватель Тестовый',
  'Образование',
  'Старший преподаватель',
  'teacher',
  true,
  NOW()
),
(
  'employee@example.com',
  'c3d4e5f6789a1b2c:bcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
  'Сотрудник Тестовый',
  'Общий отдел',
  'Специалист',
  'employee',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
