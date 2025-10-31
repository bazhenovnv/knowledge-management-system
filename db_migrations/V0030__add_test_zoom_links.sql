-- Add test zoom links for some employees
UPDATE t_p47619579_knowledge_management.employees 
SET zoom_link = 'https://zoom.us/j/123456789' 
WHERE role = 'teacher' AND is_active = true 
AND id IN (SELECT id FROM t_p47619579_knowledge_management.employees WHERE role = 'teacher' AND is_active = true LIMIT 3);

UPDATE t_p47619579_knowledge_management.employees 
SET zoom_link = 'https://zoom.us/j/987654321' 
WHERE role = 'admin' AND is_active = true 
AND id IN (SELECT id FROM t_p47619579_knowledge_management.employees WHERE role = 'admin' AND is_active = true LIMIT 2);