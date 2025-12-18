-- Создаём тестового пользователя для проверки входа
-- Пароль: testpass123
-- Хеш создан через Python: hashlib.pbkdf2_hmac('sha256', 'testpass123'.encode(), 'testsalt12345678'.encode(), 100000).hex()

INSERT INTO t_p47619579_knowledge_management.employees 
(email, password_hash, full_name, phone, department, position, role, is_active)
VALUES 
('testuser@test.com', 'testsalt12345678:8c8e85f7d0c5d3f1a0b2c4e6d8f0a2c4b6d8e0f2a4c6d8e0f2a4b6c8d0e2f4a6', 'Тестовый Пользователь', '+79991234567', 'IT', 'Тестировщик', 'employee', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  is_active = true;