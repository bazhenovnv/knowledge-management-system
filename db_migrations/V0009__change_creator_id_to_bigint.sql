-- Изменяем тип creator_id с integer на bigint для поддержки больших значений
ALTER TABLE t_p47619579_knowledge_management.tests 
ALTER COLUMN creator_id TYPE BIGINT;