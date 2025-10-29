-- Create video_conferences table
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.video_conferences (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled',
    room_id TEXT NOT NULL UNIQUE,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create video_conference_participants table
CREATE TABLE IF NOT EXISTS t_p47619579_knowledge_management.video_conference_participants (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.video_conferences(id),
    employee_id INTEGER NOT NULL REFERENCES t_p47619579_knowledge_management.employees(id),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT false,
    UNIQUE(conference_id, employee_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conferences_status ON t_p47619579_knowledge_management.video_conferences(status);
CREATE INDEX IF NOT EXISTS idx_conferences_room_id ON t_p47619579_knowledge_management.video_conferences(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_conference ON t_p47619579_knowledge_management.video_conference_participants(conference_id);
CREATE INDEX IF NOT EXISTS idx_participants_employee ON t_p47619579_knowledge_management.video_conference_participants(employee_id);