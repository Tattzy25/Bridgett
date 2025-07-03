-- Bridgit Sessions table migration
-- Creates the bridgit_sessions table for production tracking

CREATE TABLE bridgit_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id VARCHAR,
  source_language VARCHAR,
  target_language VARCHAR,
  tts_voice VARCHAR,
  stt_provider VARCHAR,
  stt_fallback_used BOOLEAN DEFAULT FALSE,
  translate_fallback_used BOOLEAN DEFAULT FALSE,
  tts_fallback_used BOOLEAN DEFAULT FALSE,
  final_text TEXT,
  translated_text TEXT,
  translation_provider VARCHAR,
  stt_tokens_used INTEGER,
  stt_duration_seconds INTEGER,
  tts_characters_used INTEGER,
  total_tokens_billed INTEGER,
  usage_billed BOOLEAN DEFAULT FALSE,
  recording_start TIMESTAMP,
  recording_end TIMESTAMP,
  transcription_start TIMESTAMP,
  transcription_end TIMESTAMP,
  translation_start TIMESTAMP,
  translation_end TIMESTAMP,
  speaking_start TIMESTAMP,
  speaking_end TIMESTAMP,
  client_ip VARCHAR,
  user_agent TEXT,
  status VARCHAR DEFAULT 'complete',
  error_message TEXT,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_user_id ON bridgit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_plan_id ON bridgit_sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_created_at ON bridgit_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_status ON bridgit_sessions(status);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_languages ON bridgit_sessions(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_deleted_at ON bridgit_sessions(deleted_at);