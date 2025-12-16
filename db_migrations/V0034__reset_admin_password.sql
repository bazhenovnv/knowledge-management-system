-- Reset admin password to default demo hash (password: admin123)
UPDATE t_p47619579_knowledge_management.employees 
SET password_hash = 'a1b2c3d4e5f6789a:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
WHERE email = 'admin@company.com';