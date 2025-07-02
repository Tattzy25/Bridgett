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

  // Add a singleton pattern or initialization lock to prevent concurrent updates
  private static initializationPromise: Promise<void> | null = null;
  
  async initializeDatabase(): Promise<void> {
    if (NeonService.initializationPromise) {
      return NeonService.initializationPromise;
    }
    
    NeonService.initializationPromise = this._initializeDatabase();
    return NeonService.initializationPromise;
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

  /**
   * Insert a comment into the database for testing connection
   * @param comment The comment text to insert
   * @returns Promise<string> The ID of the inserted comment
   */
  async insertComment(comment: string): Promise<string> {
    if (!comment?.trim()) {
      throw new Error('Comment text is required');
    }

    try {
      const result = await this.sql`
        INSERT INTO comments (comment)
        VALUES (${comment.trim()})
        RETURNING id
      `;

      return (result as any[])[0].id;
    } catch (error) {
      console.error('Error inserting comment:', error);
      throw new Error(`Failed to insert comment: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }

  /**
   * Get all comments from the database
   * @param limit Maximum number of comments to retrieve
   * @returns Promise<Comment[]> Array of comments
   */
  async getComments(limit: number = 10): Promise<Comment[]> {
    try {
      const comments = await this.sql`
        SELECT id, comment, created_at
        FROM comments
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return comments as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error(`Failed to fetch comments: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }
}

// Add Comment interface
interface Comment {
  id: string;
  comment: string;
  created_at: string;
}

export default NeonService;
export type { Comment };

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