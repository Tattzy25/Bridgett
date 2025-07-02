-- Initial database schema for Bridgette AI
-- This migration creates the core tables for the voice bridge translator

-- Voice bridge sessions table
CREATE TABLE IF NOT EXISTS voice_bridge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    participant_count INTEGER DEFAULT 0,
    total_translations INTEGER DEFAULT 0
);

-- Voice bridge translations table
CREATE TABLE IF NOT EXISTS voice_bridge_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES voice_bridge_sessions(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translation_service VARCHAR(50) NOT NULL,
    audio_duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_id VARCHAR(255)
);

-- User language preferences table
CREATE TABLE IF NOT EXISTS user_language_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_active ON voice_bridge_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_created_at ON voice_bridge_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_session_id ON voice_bridge_translations(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_created_at ON voice_bridge_translations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_language_preferences_user_id ON user_language_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_language_preferences_default ON user_language_preferences(user_id, is_default);

-- Create triggers to update translation counts
CREATE OR REPLACE FUNCTION update_session_translation_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE voice_bridge_sessions 
        SET total_translations = total_translations + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.session_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE voice_bridge_sessions 
        SET total_translations = GREATEST(total_translations - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.session_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_translation_count
    AFTER INSERT OR DELETE ON voice_bridge_translations
    FOR EACH ROW EXECUTE FUNCTION update_session_translation_count();

-- Create trigger to ensure only one default language preference per user
CREATE OR REPLACE FUNCTION ensure_single_default_language()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE user_language_preferences 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_ensure_single_default
    BEFORE INSERT OR UPDATE ON user_language_preferences
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_language();