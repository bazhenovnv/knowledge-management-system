-- Заполняем пустые имена на основе email
UPDATE employees 
SET full_name = CASE 
    WHEN id = 20 THEN 'Оганисян Аркадий'
    WHEN id = 21 THEN 'Преподаватель'
    ELSE full_name
END,
updated_at = CURRENT_TIMESTAMP
WHERE full_name = '' OR full_name IS NULL;