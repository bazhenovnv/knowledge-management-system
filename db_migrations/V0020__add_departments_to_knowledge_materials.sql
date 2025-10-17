-- Добавляем поле departments в таблицу knowledge_materials
ALTER TABLE t_p47619579_knowledge_management.knowledge_materials 
ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- Добавляем комментарий к полю
COMMENT ON COLUMN t_p47619579_knowledge_management.knowledge_materials.departments 
IS 'Список отделов, которым доступен материал. Пустой массив = доступен всем';