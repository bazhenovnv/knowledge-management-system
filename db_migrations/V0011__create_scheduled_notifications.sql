-- Create scheduled_notifications table for delayed notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    notification_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    scheduled_for TIMESTAMP NOT NULL,
    channels TEXT[] DEFAULT ARRAY['database'],
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX idx_scheduled_notifications_employee ON scheduled_notifications(employee_id);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);

-- Create deadline_reminders table for automatic deadline notifications
CREATE TABLE IF NOT EXISTS deadline_reminders (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('test', 'course', 'task')),
    entity_id INTEGER NOT NULL,
    deadline TIMESTAMP NOT NULL,
    reminder_intervals INTEGER[] DEFAULT ARRAY[86400, 3600, 0],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_deadline_reminders_entity ON deadline_reminders(entity_type, entity_id);
CREATE INDEX idx_deadline_reminders_deadline ON deadline_reminders(deadline);
CREATE INDEX idx_deadline_reminders_active ON deadline_reminders(is_active);

COMMENT ON TABLE scheduled_notifications IS 'Отложенные уведомления для отправки в будущем';
COMMENT ON TABLE deadline_reminders IS 'Настройки напоминаний о дедлайнах';
COMMENT ON COLUMN deadline_reminders.reminder_intervals IS 'Интервалы в секундах до дедлайна для отправки напоминаний (например: [86400, 3600, 0] = за сутки, за час, в момент дедлайна)';