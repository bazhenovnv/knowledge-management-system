-- Create instruction_categories table
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.instruction_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon_name TEXT NOT NULL DEFAULT 'Folder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO t_p47619579_knowledge_management.instruction_categories (name, icon_name) 
VALUES 
    ('Онлайн кассы', 'CreditCard'),
    ('Торговые весы', 'Scale'),
    ('Сканеры ШК', 'ScanLine'),
    ('Принтеры этикеток', 'Printer'),
    ('1С программы', 'Database'),
    ('POS-терминалы', 'Monitor'),
    ('ТСД', 'Smartphone'),
    ('Мониторы покупателя', 'Tv')
ON CONFLICT (name) DO NOTHING;