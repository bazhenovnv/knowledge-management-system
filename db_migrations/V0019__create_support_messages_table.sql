-- Создание таблицы сообщений технической поддержки
CREATE TABLE IF NOT EXISTS support_messages (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой выборки
CREATE INDEX idx_support_messages_employee_id ON support_messages(employee_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX idx_support_messages_is_read ON support_messages(is_read) WHERE is_admin_response = FALSE;

-- Комментарии
COMMENT ON TABLE support_messages IS 'Сообщения чата технической поддержки';
COMMENT ON COLUMN support_messages.employee_id IS 'ID сотрудника';
COMMENT ON COLUMN support_messages.message IS 'Текст сообщения';
COMMENT ON COLUMN support_messages.is_admin_response IS 'Ответ администратора (true) или сообщение сотрудника (false)';
COMMENT ON COLUMN support_messages.is_read IS 'Прочитано ли сообщение';
COMMENT ON COLUMN support_messages.created_at IS 'Время отправки сообщения';