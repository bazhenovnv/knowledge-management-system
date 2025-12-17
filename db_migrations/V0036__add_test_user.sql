INSERT INTO t_p47619579_knowledge_management.employees 
(email, password_hash, full_name, role, department, position, phone, hire_date, is_active) 
SELECT 
  'test@ab-education.ru',
  'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  'Тестовый Администратор',
  'admin',
  'IT',
  'Администратор',
  '+7 (999) 123-45-67',
  NOW(),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM t_p47619579_knowledge_management.employees WHERE email = 'test@ab-education.ru'
);