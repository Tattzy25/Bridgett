import { neon } from '@neondatabase/serverless';
import { getApiKey } from '../config/apiKeys';

interface User {
  user_id: string;
  email: string;
  display_name: string;
  preferred_language: string;
  preferred_voice: string;
  account_type: 'free' | 'premium' | 'enterprise';
  created_at: string;
  last_login_at?: string;
  is_active: boolean;
}

interface VoiceBridgeSession {
  session_id: string;
  user_id?: string;
  session_name: string;
  user_one_language: string;
  user_two_language: string;
  user_one_voice_preference: string;
  user_two_voice_preference: string;
  session_started_at: string;
  session_ended_at?: string;
  total_translations: number;
  session_duration_minutes?: number;
  is_public: boolean;
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
  confidence_score?: number;
}

interface UserPreference {
  preference_id: string;
  user_id: string;
  preference_category: 'voice' | 'language' | 'ui' | 'privacy';
  preference_key: string;
  preference_value: string;
  updated_at: string;
}

interface TranslationHistory {
  history_id: string;
  user_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  translation_service: 'deepl' | 'gemini' | 'elevenlabs';
  created_at: string;
  is_favorite: boolean;
}

interface UserSession {
  user_session_id: string;
  user_id: string;
  session_token: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

interface ApiUsageLog {
  usage_log_id: string;
  user_id?: string;
  service_name: 'elevenlabs' | 'deepl' | 'gemini';
  operation_type: 'transcription' | 'translation' | 'synthesis';
  characters_processed: number;
  api_response_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
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
      console.log('🚀 Initializing Brigitte AI database schema...');

      // Step 1: Create users table
      await this.sql`
        CREATE TABLE IF NOT EXISTS users (
          user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          preferred_language VARCHAR(10) DEFAULT 'EN',
          preferred_voice VARCHAR(100) DEFAULT 'EXAVITQu4vr4xnSDxMaL',
          account_type VARCHAR(20) DEFAULT 'free' CHECK (account_type IN ('free', 'premium', 'enterprise')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Step 2: Create user_sessions table for authentication
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_sessions (
          user_session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          device_info TEXT,
          ip_address INET,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_active BOOLEAN DEFAULT true
        )
      `;

      // Step 3: Create user_preferences table
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_preferences (
          preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
          preference_category VARCHAR(50) NOT NULL CHECK (preference_category IN ('voice', 'language', 'ui', 'privacy')),
          preference_key VARCHAR(100) NOT NULL,
          preference_value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, preference_category, preference_key)
        )
      `;

      // Step 4: Create enhanced voice_bridge_sessions table
      await this.sql`
        CREATE TABLE IF NOT EXISTS voice_bridge_sessions (
          session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
          session_name VARCHAR(200) DEFAULT 'Untitled Conversation',
          user_one_language VARCHAR(50) NOT NULL,
          user_two_language VARCHAR(50) NOT NULL,
          user_one_voice_preference VARCHAR(100) NOT NULL,
          user_two_voice_preference VARCHAR(100) NOT NULL,
          session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_ended_at TIMESTAMP WITH TIME ZONE,
          total_translations INTEGER DEFAULT 0,
          session_duration_minutes INTEGER,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Step 5: Create enhanced voice_bridge_translations table
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
          confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
          translation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Step 6: Create translation_history table for individual user translations
      await this.sql`
        CREATE TABLE IF NOT EXISTS translation_history (
          history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
          original_text TEXT NOT NULL,
          translated_text TEXT NOT NULL,
          source_language VARCHAR(50) NOT NULL,
          target_language VARCHAR(50) NOT NULL,
          translation_service VARCHAR(20) DEFAULT 'gemini' CHECK (translation_service IN ('deepl', 'gemini', 'elevenlabs')),
          is_favorite BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Step 7: Create api_usage_logs table for monitoring
      await this.sql`
        CREATE TABLE IF NOT EXISTS api_usage_logs (
          usage_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
          service_name VARCHAR(20) NOT NULL CHECK (service_name IN ('elevenlabs', 'deepl', 'gemini')),
          operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('transcription', 'translation', 'synthesis')),
          characters_processed INTEGER DEFAULT 0,
          api_response_time_ms INTEGER,
          success BOOLEAN NOT NULL,
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Step 8: Create performance indexes
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_users_email_lookup 
        ON users(email) WHERE is_active = true
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_token_lookup 
        ON user_sessions(session_token) WHERE is_active = true
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_expiry_cleanup 
        ON user_sessions(expires_at) WHERE is_active = true
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_user_preferences_lookup 
        ON user_preferences(user_id, preference_category)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_user_lookup 
        ON voice_bridge_sessions(user_id) WHERE session_ended_at IS NULL
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_sessions_chronological 
        ON voice_bridge_sessions(session_started_at DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_session_lookup 
        ON voice_bridge_translations(voice_bridge_session_id)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_voice_bridge_translations_chronological 
        ON voice_bridge_translations(translation_timestamp DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_translation_history_user_lookup 
        ON translation_history(user_id, created_at DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_translation_history_favorites 
        ON translation_history(user_id) WHERE is_favorite = true
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_api_usage_logs_monitoring 
        ON api_usage_logs(service_name, created_at DESC)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_analytics 
        ON api_usage_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL
      `;

      // Step 9: Create database functions
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
        $$ LANGUAGE plpgsql
      `;

      await this.sql`
        CREATE OR REPLACE FUNCTION update_session_duration()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.session_ended_at IS NOT NULL AND OLD.session_ended_at IS NULL THEN
            NEW.session_duration_minutes = EXTRACT(EPOCH FROM (NEW.session_ended_at - NEW.session_started_at)) / 60;
          END IF;
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;

      await this.sql`
        CREATE OR REPLACE FUNCTION update_user_last_login()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE users 
          SET last_login_at = NOW() 
          WHERE user_id = NEW.user_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;

      await this.sql`
        CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
        RETURNS INTEGER AS $$
        DECLARE
          deleted_count INTEGER;
        BEGIN
          UPDATE user_sessions 
          SET is_active = false 
          WHERE expires_at < NOW() AND is_active = true;
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Step 10: Create triggers
      await this.sql`
        DROP TRIGGER IF EXISTS trigger_update_translation_count ON voice_bridge_translations
      `;

      await this.sql`
        CREATE TRIGGER trigger_update_translation_count
        AFTER INSERT ON voice_bridge_translations
        FOR EACH ROW EXECUTE FUNCTION update_session_translation_count()
      `;

      await this.sql`
        DROP TRIGGER IF EXISTS trigger_update_session_duration ON voice_bridge_sessions
      `;

      await this.sql`
        CREATE TRIGGER trigger_update_session_duration
        BEFORE UPDATE ON voice_bridge_sessions
        FOR EACH ROW EXECUTE FUNCTION update_session_duration()
      `;

      await this.sql`
        DROP TRIGGER IF EXISTS trigger_update_user_last_login ON user_sessions
      `;

      await this.sql`
        CREATE TRIGGER trigger_update_user_last_login
        AFTER INSERT ON user_sessions
        FOR EACH ROW EXECUTE FUNCTION update_user_last_login()
      `;

      console.log('✅ Database schema initialized successfully!');
      console.log('📊 Created tables: users, user_sessions, user_preferences, voice_bridge_sessions, voice_bridge_translations, translation_history, api_usage_logs');
      console.log('🔍 Created indexes for optimal performance');
      console.log('⚡ Created triggers and functions for automation');

    } catch (error) {
      console.error('❌ Error initializing Brigitte AI database:', error);
      throw new Error('Failed to initialize comprehensive database schema');
    }
  }

  // User Management Methods
  async createUser(email: string, displayName: string, preferredLanguage: string = 'EN'): Promise<string> {
    try {
      const result = await this.sql`
        INSERT INTO users (email, display_name, preferred_language)
        VALUES (${email}, ${displayName}, ${preferredLanguage})
        RETURNING user_id
      `;
      return result[0].user_id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user account');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.sql`
        SELECT * FROM users 
        WHERE email = ${email} AND is_active = true
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async createUserSession(userId: string, sessionToken: string, deviceInfo: string, ipAddress: string): Promise<string> {
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      const result = await this.sql`
        INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, expires_at)
        VALUES (${userId}, ${sessionToken}, ${deviceInfo}, ${ipAddress}, ${expiresAt})
        RETURNING user_session_id
      `;
      return result[0].user_session_id;
    } catch (error) {
      console.error('Error creating user session:', error);
      throw new Error('Failed to create user session');
    }
  }

  // User Preferences Methods
  async saveUserPreference(userId: string, category: string, key: string, value: string): Promise<void> {
    try {
      await this.sql`
        INSERT INTO user_preferences (user_id, preference_category, preference_key, preference_value)
        VALUES (${userId}, ${category}, ${key}, ${value})
        ON CONFLICT (user_id, preference_category, preference_key)
        DO UPDATE SET preference_value = ${value}, updated_at = NOW()
      `;
    } catch (error) {
      console.error('Error saving user preference:', error);
      throw new Error('Failed to save user preference');
    }
  }

  async getUserPreferences(userId: string, category?: string): Promise<UserPreference[]> {
    try {
      const result = category 
        ? await this.sql`
            SELECT * FROM user_preferences 
            WHERE user_id = ${userId} AND preference_category = ${category}
            ORDER BY preference_key
          `
        : await this.sql`
            SELECT * FROM user_preferences 
            WHERE user_id = ${userId}
            ORDER BY preference_category, preference_key
          `;
      return result as UserPreference[];
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw new Error('Failed to fetch user preferences');
    }
  }

  // Enhanced Voice Bridge Session Methods
  async createVoiceBridgeSession(
    userOneLanguage: string,
    userTwoLanguage: string,
    userOneVoice: string,
    userTwoVoice: string,
    userId?: string,
    sessionName?: string
  ): Promise<string> {
    try {
      const result = await this.sql`
        INSERT INTO voice_bridge_sessions (
          user_id,
          session_name,
          user_one_language, 
          user_two_language, 
          user_one_voice_preference, 
          user_two_voice_preference
        )
        VALUES (
          ${userId || null}, 
          ${sessionName || 'Untitled Conversation'}, 
          ${userOneLanguage}, 
          ${userTwoLanguage}, 
          ${userOneVoice}, 
          ${userTwoVoice}
        )
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
    audioDurationSeconds?: number,
    confidenceScore?: number
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
          audio_duration_seconds,
          confidence_score
        )
        VALUES (
          ${sessionId}, 
          ${speakerIdentifier}, 
          ${originalSpeechText}, 
          ${translatedSpeechText}, 
          ${sourceLanguage}, 
          ${targetLanguage}, 
          ${voiceSynthesisId},
          ${audioDurationSeconds || null},
          ${confidenceScore || null}
        )
      `;
    } catch (error) {
      console.error('Error saving Voice Bridge translation:', error);
      throw new Error('Failed to save translation record');
    }
  }

  // Translation History Methods
  async saveTranslationHistory(
    userId: string,
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string,
    translationService: string = 'gemini'
  ): Promise<string> {
    try {
      const result = await this.sql`
        INSERT INTO translation_history (
          user_id, original_text, translated_text, 
          source_language, target_language, translation_service
        )
        VALUES (${userId}, ${originalText}, ${translatedText}, ${sourceLanguage}, ${targetLanguage}, ${translationService})
        RETURNING history_id
      `;
      return result[0].history_id;
    } catch (error) {
      console.error('Error saving translation history:', error);
      throw new Error('Failed to save translation history');
    }
  }

  async getUserTranslationHistory(userId: string, limit: number = 50): Promise<TranslationHistory[]> {
    try {
      const result = await this.sql`
        SELECT * FROM translation_history 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
      return result as TranslationHistory[];
    } catch (error) {
      console.error('Error fetching translation history:', error);
      throw new Error('Failed to fetch translation history');
    }
  }

  // API Usage Logging Methods
  async logApiUsage(
    serviceName: string,
    operationType: string,
    charactersProcessed: number,
    responseTimeMs: number,
    success: boolean,
    userId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.sql`
        INSERT INTO api_usage_logs (
          user_id, service_name, operation_type, 
          characters_processed, api_response_time_ms, 
          success, error_message
        )
        VALUES (
          ${userId || null}, ${serviceName}, ${operationType}, 
          ${charactersProcessed}, ${responseTimeMs}, 
          ${success}, ${errorMessage || null}
        )
      `;
    } catch (error) {
      console.error('Error logging API usage:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  // Existing methods (keeping for backward compatibility)
  async getVoiceBridgeSessionHistory(sessionId: string): Promise<VoiceBridgeTranslation[]> {
    try {
      const records = await this.sql`
        SELECT * FROM voice_bridge_translations 
        WHERE voice_bridge_session_id = ${sessionId}
        ORDER BY translation_timestamp ASC
      `;
      return records as VoiceBridgeTranslation[];
    } catch (error) {
      console.error('Error fetching Voice Bridge session history:', error);
      throw new Error('Failed to fetch session conversation history');
    }
  }

  async getRecentVoiceBridgeSessions(limit: number = 10, userId?: string): Promise<VoiceBridgeSession[]> {
    try {
      const sessions = userId 
        ? await this.sql`
            SELECT * FROM voice_bridge_sessions 
            WHERE user_id = ${userId}
            ORDER BY session_started_at DESC 
            LIMIT ${limit}
          `
        : await this.sql`
            SELECT * FROM voice_bridge_sessions 
            WHERE is_public = true OR user_id IS NULL
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
        SET session_ended_at = NOW()
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

  // Maintenance Methods
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.sql`SELECT cleanup_expired_sessions()`;
      return result[0].cleanup_expired_sessions;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
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