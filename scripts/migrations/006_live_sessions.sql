-- Add live session support to bridgit_sessions table
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS session_code VARCHAR(8);
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS channel_name VARCHAR(255);
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS session_type VARCHAR(20) DEFAULT 'single';
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS host_client_id VARCHAR(255);
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS guest_client_id VARCHAR(255);
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS guest_joined_at TIMESTAMP;
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE bridgit_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;

-- Create indexes for live session queries
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_session_code ON bridgit_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_expires_at ON bridgit_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_session_type ON bridgit_sessions(session_type);

-- Create unique constraint for active session codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_bridgit_sessions_active_code 
ON bridgit_sessions(session_code) 
WHERE status = 'active' AND expires_at > NOW();