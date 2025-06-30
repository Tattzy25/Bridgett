import { neon } from '@neondatabase/serverless';
import { getApiKey } from '../config/apiKeys';

interface VoiceBridgeSession {
  session_id: string;
  user_one_language: string;
  user_two_language: string;
  user_one_voice_preference: string;
  user_two_voice_preference: string;
  session_started_at: string;
  session_ended_at?: string;
  total_translations: number;
}

interface VoiceBridgeTranslation {
  translation_id: string;
  voice_bridge_session_id: string;
  speaker_identifier: 'user_one' | 'user_two';
  original_speech_text: string;
  translated_speech_text: string;
  source_language: string;
  target_language: string;
  voice_synthesis_id: string;
  translation_timestamp: string;
  audio_duration_seconds?: number;
}

class NeonService {
  private sql: ReturnType<typeof neon>;

  constructor() {
    const databaseUrl = getApiKey('NEON_DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('Neon database URL is required');
    }
    this.sql = neon(databaseUrl);
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Create voice_bridge_sessions table with proper naming
      await this.sql`
        CREATE TABLE IF NOT EXISTS voice_bridge_sessions (
          session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_one_language VARCHAR(50) NOT NULL,
          user_two_language VARCHAR(50) NOT NULL,
          user_one_voice_preference VARCHAR(100) NOT NULL,
          user_two_voice_preference VARCHAR(100) NOT NULL,
          session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_ended_at TIMESTAMP WITH TIME ZONE,
          total_translations INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create voice_bridge_translations table with proper naming
      await this.sql`
        CREATE TABLE IF NOT EXISTS voice_bridge_translations (
          translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          voice_bridge_session_id UUID REFERENCES voice_bridge_sessions(session_id) ON DELETE CASCADE,
          speaker_identifier VARCHAR(20) NOT NULL CHECK (speaker_identifier IN ('user_one', 'user_two')),
          original_speech_text TEXT NOT NULL,
          translated_speech_text TEXT NOT NULL,
          source_language VARCHAR(50) NOT NULL,
          target_language VARCHAR(50) NOT NULL,
          voice_synthesis_id VARCHAR(100) NOT NULL,
          audio_duration_seconds DECIMAL(10,2),
          translation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create performance indexes with descriptive names
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_session_lookup 
        ON voice_bridge_translations(voice_bridge_session_id)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_chronological 
        ON voice_bridge_translations(translation_timestamp DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_chronological 
        ON voice_bridge_sessions(session_started_at DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_active_lookup 
        ON voice_bridge_sessions(session_ended_at) WHERE session_ended_at IS NULL
      `;

      // Create trigger to update translation count
      await this.sql`
        CREATE OR REPLACE FUNCTION update_session_translation_count()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE voice_bridge_sessions 
          SET total_translations = (
            SELECT COUNT(*) 
            FROM voice_bridge_translations 
            WHERE voice_bridge_session_id = NEW.voice_bridge_session_id
          ),
          updated_at = NOW()
          WHERE session_id = NEW.voice_bridge_session_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await this.sql`
        DROP TRIGGER IF EXISTS trigger_update_translation_count ON voice_bridge_translations;
        CREATE TRIGGER trigger_update_translation_count
        AFTER INSERT ON voice_bridge_translations
        FOR EACH ROW EXECUTE FUNCTION update_session_translation_count();
      `;

    } catch (error) {
      console.error('Error initializing Neon database:', error);
      throw new Error('Failed to initialize Voice Bridge database');
    }
  }

  async createVoiceBridgeSession(
    userOneLanguage: string,
    userTwoLanguage: string,
    userOneVoice: string,
    userTwoVoice: string
  ): Promise<string> {
    try {
      const result = await this.sql`
        INSERT INTO voice_bridge_sessions (
          user_one_language, 
          user_two_language, 
          user_one_voice_preference, 
          user_two_voice_preference
        )
        VALUES (${userOneLanguage}, ${userTwoLanguage}, ${userOneVoice}, ${userTwoVoice})
        RETURNING session_id
      `;

      return result[0].session_id;
    } catch (error) {
      console.error('Error creating Voice Bridge session:', error);
      throw new Error('Failed to create translation session');
    }
  }

  async saveVoiceBridgeTranslation(
    sessionId: string,
    speakerIdentifier: 'user_one' | 'user_two',
    originalSpeechText: string,
    translatedSpeechText: string,
    sourceLanguage: string,
    targetLanguage: string,
    voiceSynthesisId: string,
    audioDurationSeconds?: number
  ): Promise<void> {
    try {
      await this.sql`
        INSERT INTO voice_bridge_translations (
          voice_bridge_session_id,
          speaker_identifier,
          original_speech_text,
          translated_speech_text,
          source_language,
          target_language,
          voice_synthesis_id,
          audio_duration_seconds
        )
        VALUES (
          ${sessionId}, 
          ${speakerIdentifier}, 
          ${originalSpeechText}, 
          ${translatedSpeechText}, 
          ${sourceLanguage}, 
          ${targetLanguage}, 
          ${voiceSynthesisId},
          ${audioDurationSeconds || null}
        )
      `;
    } catch (error) {
      console.error('Error saving Voice Bridge translation:', error);
      throw new Error('Failed to save translation record');
    }
  }

  async getVoiceBridgeSessionHistory(sessionId: string): Promise<VoiceBridgeTranslation[]> {
    try {
      const records = await this.sql`
        SELECT 
          translation_id,
          voice_bridge_session_id,
          speaker_identifier,
          original_speech_text,
          translated_speech_text,
          source_language,
          target_language,
          voice_synthesis_id,
          audio_duration_seconds,
          translation_timestamp
        FROM voice_bridge_translations 
        WHERE voice_bridge_session_id = ${sessionId}
        ORDER BY translation_timestamp ASC
      `;

      return records as VoiceBridgeTranslation[];
    } catch (error) {
      console.error('Error fetching Voice Bridge session history:', error);
      throw new Error('Failed to fetch session conversation history');
    }
  }

  async getRecentVoiceBridgeSessions(limit: number = 10): Promise<VoiceBridgeSession[]> {
    try {
      const sessions = await this.sql`
        SELECT 
          session_id,
          user_one_language,
          user_two_language,
          user_one_voice_preference,
          user_two_voice_preference,
          session_started_at,
          session_ended_at,
          total_translations
        FROM voice_bridge_sessions 
        ORDER BY session_started_at DESC 
        LIMIT ${limit}
      `;

      return sessions as VoiceBridgeSession[];
    } catch (error) {
      console.error('Error fetching recent Voice Bridge sessions:', error);
      throw new Error('Failed to fetch recent conversation sessions');
    }
  }

  async endVoiceBridgeSession(sessionId: string): Promise<void> {
    try {
      await this.sql`
        UPDATE voice_bridge_sessions 
        SET session_ended_at = NOW(), updated_at = NOW()
        WHERE session_id = ${sessionId}
      `;
    } catch (error) {
      console.error('Error ending Voice Bridge session:', error);
      throw new Error('Failed to end conversation session');
    }
  }

  async deleteVoiceBridgeSession(sessionId: string): Promise<void> {
    try {
      await this.sql`
        DELETE FROM voice_bridge_sessions 
        WHERE session_id = ${sessionId}
      `;
    } catch (error) {
      console.error('Error deleting Voice Bridge session:', error);
      throw new Error('Failed to delete conversation session');
    }
  }

  async getVoiceBridgeSessionStatistics(sessionId: string): Promise<{
    totalTranslations: number;
    userOneTranslations: number;
    userTwoTranslations: number;
    sessionDurationMinutes: number;
    averageTranslationLength: number;
  }> {
    try {
      const stats = await this.sql`
        SELECT 
          COUNT(*) as total_translations,
          COUNT(CASE WHEN speaker_identifier = 'user_one' THEN 1 END) as user_one_translations,
          COUNT(CASE WHEN speaker_identifier = 'user_two' THEN 1 END) as user_two_translations,
          COALESCE(EXTRACT(EPOCH FROM (MAX(translation_timestamp) - MIN(translation_timestamp))) / 60, 0) as duration_minutes,
          COALESCE(AVG(LENGTH(original_speech_text)), 0) as avg_translation_length
        FROM voice_bridge_translations 
        WHERE voice_bridge_session_id = ${sessionId}
      `;

      const result = stats[0];

      return {
        totalTranslations: parseInt(result.total_translations),
        userOneTranslations: parseInt(result.user_one_translations),
        userTwoTranslations: parseInt(result.user_two_translations),
        sessionDurationMinutes: Math.round(result.duration_minutes),
        averageTranslationLength: Math.round(result.avg_translation_length)
      };
    } catch (error) {
      console.error('Error fetching Voice Bridge session statistics:', error);
      throw new Error('Failed to fetch conversation statistics');
    }
  }
}

export default NeonService;