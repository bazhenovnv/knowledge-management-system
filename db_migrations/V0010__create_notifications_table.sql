-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.notifications (
    id SERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT notifications_employee_fkey FOREIGN KEY (employee_id) REFERENCES t_p47619579_knowledge_management.employees(id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_notifications_employee_id ON t_p47619579_knowledge_management.notifications(employee_id);
CREATE INDEX idx_notifications_is_read ON t_p47619579_knowledge_management.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON t_p47619579_knowledge_management.notifications(created_at DESC);

-- Комментарии
COMMENT ON TABLE t_p47619579_knowledge_management.notifications IS 'Уведомления для сотрудников';
COMMENT ON COLUMN t_p47619579_knowledge_management.notifications.type IS 'Тип: info, success, warning, error, assignment';
COMMENT ON COLUMN t_p47619579_knowledge_management.notifications.priority IS 'Приоритет: low, normal, high, urgent';