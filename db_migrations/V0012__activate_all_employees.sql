-- Активируем всех неактивных сотрудников
UPDATE employees 
SET is_active = true, 
    updated_at = CURRENT_TIMESTAMP
WHERE is_active = false;