-- Create domains table for managing custom domains
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ssl_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_domains_domain_name ON t_p47619579_knowledge_management.domains(domain_name);

-- Insert initial domain
INSERT INTO t_p47619579_knowledge_management.domains (domain_name, ssl_enabled) 
VALUES ('ab-education.ru', TRUE)
ON CONFLICT (domain_name) DO NOTHING;
