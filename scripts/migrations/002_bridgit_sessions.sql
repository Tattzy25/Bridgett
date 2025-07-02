-- Bridgit AI Sessions Migration
-- Creates the bridgit_sessions table for production tracking

CREATE TABLE IF NOT EXISTS bridgit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    final_text TEXT,
    translated_text TEXT,
    tts_voice VARCHAR(100),
    recording_start TIMESTAMP,
    recording_end TIMESTAMP,
    translation_start TIMESTAMP,
    translation_end TIMESTAMP,
    speaking_start TIMESTAMP,
    speaking_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_created_at ON bridgit_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_languages ON bridgit_sessions(source_language, target_language);