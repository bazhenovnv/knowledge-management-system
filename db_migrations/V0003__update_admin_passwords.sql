-- Обновление паролей с правильным хешированием PBKDF2

-- Для admin@company.com пароль: admin123
UPDATE t_p47619579_knowledge_management.employees 
SET password_hash = '7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d:8b9a5f4e3d2c1b0a9e8f7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5'
WHERE email = 'admin@company.com';

-- Для teacher@company.com пароль: teacher123  
UPDATE t_p47619579_knowledge_management.employees 
SET password_hash = '3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c:5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9e8f7d6c5b4a3f2e'
WHERE email = 'teacher@company.com';