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

      // Drop and recreate trigger safely
      try {
        await this.sql`
          DROP TRIGGER IF EXISTS trigger_update_translation_count ON voice_bridge_translations
        `;
      } catch (dropError: any) {
        // Ignore drop errors as trigger might not exist
        console.log('Trigger drop info:', dropError.message);
      }
      
      try {
        await this.sql`
          CREATE TRIGGER trigger_update_translation_count
          AFTER INSERT ON voice_bridge_translations
          FOR EACH ROW EXECUTE FUNCTION update_session_translation_count()
        `;
      } catch (createError: any) {
        // Check if trigger already exists, if so, continue
        if (!createError.message.includes('already exists')) {
          throw createError;
        }
        console.log('Trigger already exists, continuing...');
      }

      // Create user_language_preferences table with full production constraints
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_language_preferences (
          preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_identifier VARCHAR(100) NOT NULL,
          from_language VARCHAR(10) NOT NULL CHECK (length(from_language) >= 2),
          to_language VARCHAR(10) NOT NULL CHECK (length(to_language) >= 2),
          voice_preference VARCHAR(100) NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_user_lang_pair UNIQUE(user_identifier, from_language, to_language),
          CONSTRAINT different_languages CHECK (from_language != to_language)
        )
      `;

      // Create optimized indexes for real-world performance
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_user_language_preferences_user_lookup 
        ON user_language_preferences(user_identifier)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_user_language_preferences_default 
        ON user_language_preferences(user_identifier, is_default) WHERE is_default = true
      `;

      // Create trigger to ensure only one default per user
      await this.sql`
        CREATE OR REPLACE FUNCTION ensure_single_default_preference()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.is_default = true THEN
            UPDATE user_language_preferences 
            SET is_default = false, updated_at = NOW()
            WHERE user_identifier = NEW.user_identifier 
              AND preference_id != NEW.preference_id
              AND is_default = true;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await this.sql`
        DROP TRIGGER IF EXISTS trigger_ensure_single_default ON user_language_preferences
      `;

      await this.sql`
        CREATE TRIGGER trigger_ensure_single_default
        BEFORE INSERT OR UPDATE ON user_language_preferences
        FOR EACH ROW EXECUTE FUNCTION ensure_single_default_preference()
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

      return (result as any[])[0].session_id;
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

      const result = (stats as any[])[0];

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

  async saveUserLanguagePreference(
    userIdentifier: string,
    fromLanguage: string,
    toLanguage: string,
    voicePreference: string,
    isDefault: boolean = false
  ): Promise<string> {
    // Input validation
    if (!userIdentifier?.trim()) {
      throw new Error('User identifier is required');
    }
    if (!fromLanguage?.trim() || fromLanguage.length < 2) {
      throw new Error('Valid from language code is required (min 2 characters)');
    }
    if (!toLanguage?.trim() || toLanguage.length < 2) {
      throw new Error('Valid to language code is required (min 2 characters)');
    }
    if (fromLanguage === toLanguage) {
      throw new Error('From and to languages must be different');
    }
    if (!voicePreference?.trim()) {
      throw new Error('Voice preference is required');
    }

    try {
      const result = await this.sql`
        INSERT INTO user_language_preferences (
          user_identifier,
          from_language,
          to_language,
          voice_preference,
          is_default
        )
        VALUES (
          ${userIdentifier.trim()},
          ${fromLanguage.toUpperCase().trim()},
          ${toLanguage.toUpperCase().trim()},
          ${voicePreference.trim()},
          ${isDefault}
        )
        ON CONFLICT (user_identifier, from_language, to_language)
        DO UPDATE SET
          voice_preference = EXCLUDED.voice_preference,
          is_default = EXCLUDED.is_default,
          updated_at = NOW()
        RETURNING preference_id
      `;

      return (result as any[])[0].preference_id;
    } catch (error) {
      console.error('Error saving user language preference:', error);
      throw new Error(`Failed to save language preference: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }

  async getUserLanguagePreferences(userIdentifier: string): Promise<UserLanguagePreference[]> {
    if (!userIdentifier?.trim()) {
      throw new Error('User identifier is required');
    }

    try {
      const preferences = await this.sql`
        SELECT 
          preference_id,
          user_identifier,
          from_language,
          to_language,
          voice_preference,
          is_default,
          created_at,
          updated_at
        FROM user_language_preferences 
        WHERE user_identifier = ${userIdentifier.trim()}
        ORDER BY is_default DESC, updated_at DESC
      `;

      return preferences as UserLanguagePreference[];
    } catch (error) {
      console.error('Error fetching user language preferences:', error);
      throw new Error(`Failed to fetch language preferences: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }

  // Around line 474, fix the type casting:
  async getDefaultLanguagePreference(userIdentifier: string): Promise<UserLanguagePreference | null> {
    if (!userIdentifier?.trim()) {
      throw new Error('User identifier is required');
    }

    try {
      const result = await this.sql`
        SELECT 
          preference_id,
          user_identifier,
          from_language,
          to_language,
          voice_preference,
          is_default,
          created_at,
          updated_at
        FROM user_language_preferences 
        WHERE user_identifier = ${userIdentifier.trim()} AND is_default = true
        LIMIT 1
      `;
  
      // Fix the type casting and array access
      const preferences = result as UserLanguagePreference[];
      return preferences.length > 0 ? preferences[0] : null;
    } catch (error) {
      console.error('Error fetching default language preference:', error);
      throw new Error(`Failed to fetch default language preference: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }

  // Fix the deleteUserLanguagePreference method around line 495
  async deleteUserLanguagePreference(preferenceId: string): Promise<void> {
    if (!preferenceId?.trim()) {
      throw new Error('Preference ID is required');
    }

    try {
      const result = await this.sql`
        DELETE FROM user_language_preferences 
        WHERE preference_id = ${preferenceId.trim()}
      `;

      // Fix the count property access
      const deleteResult = result as any;
      if (deleteResult.count === 0) {
        throw new Error('Language preference not found');
      }
    } catch (error) {
      console.error('Error deleting user language preference:', error);
      throw new Error(`Failed to delete language preference: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }
}

export default NeonService;

// Add missing interface
interface UserLanguagePreference {
  preference_id: string;
  user_identifier: string;
  from_language: string;
  to_language: string;
  voice_preference: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}