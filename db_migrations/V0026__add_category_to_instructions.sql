-- Добавляем поле категории к таблице инструкций
ALTER TABLE instructions 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Прочее';

-- Обновляем существующие инструкции, распределяя их по категориям
UPDATE instructions 
SET category = 'Онлайн кассы'
WHERE title LIKE '%касс%' OR title LIKE '%ККТ%' OR title LIKE '%фискал%';

UPDATE instructions 
SET category = '1С программы'
WHERE title LIKE '%1С%' OR title LIKE '%1C%';

UPDATE instructions 
SET category = 'Торговое оборудование'
WHERE category = 'Прочее' AND (
    title LIKE '%сканер%' 
    OR title LIKE '%весы%' 
    OR title LIKE '%принтер%'
    OR title LIKE '%POS%'
    OR title LIKE '%терминал%'
    OR title LIKE '%оборудован%'
);