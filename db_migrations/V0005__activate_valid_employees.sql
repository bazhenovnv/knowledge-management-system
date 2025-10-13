-- Активация корректных сотрудников и удаление некорректных
-- Активируем сотрудников с правильными данными
UPDATE t_p47619579_knowledge_management.employees 
SET is_active = true 
WHERE id IN (1, 2, 6, 15, 19) 
  AND full_name IS NOT NULL 
  AND full_name != '' 
  AND LENGTH(TRIM(full_name)) >= 3;

-- Деактивируем сотрудников с пустыми именами
UPDATE t_p47619579_knowledge_management.employees 
SET is_active = false 
WHERE full_name IS NULL OR full_name = '' OR LENGTH(TRIM(full_name)) < 3;