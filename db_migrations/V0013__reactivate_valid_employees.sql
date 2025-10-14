-- Активируем всех сотрудников с валидными данными
UPDATE employees 
SET is_active = true, 
    updated_at = CURRENT_TIMESTAMP
WHERE is_active = false 
  AND full_name IS NOT NULL 
  AND full_name != '';