ALTER TABLE t_p47619579_knowledge_management.knowledge_materials
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN t_p47619579_knowledge_management.knowledge_materials.cover_image IS 'URL обложки материала';
COMMENT ON COLUMN t_p47619579_knowledge_management.knowledge_materials.attachments IS 'Массив JSON с прикрепленными файлами [{name, url, type, size}]';
