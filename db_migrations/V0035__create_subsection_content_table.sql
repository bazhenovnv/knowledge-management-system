-- Create subsection_content table for storing editable subsection content
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.subsection_content (
  id SERIAL PRIMARY KEY,
  subsection_key VARCHAR(100) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default content for "О компании"
INSERT INTO t_p47619579_knowledge_management.subsection_content (subsection_key, content)
VALUES 
  ('О компании', 'AB-Онлайн Касса — ведущий поставщик кассового оборудования и решений для автоматизации торговли в Краснодаре и Краснодарском крае. Компания специализируется на продаже, настройке и обслуживании онлайн-касс, фискальных регистраторов и сопутствующего оборудования.')
ON CONFLICT (subsection_key) DO NOTHING;