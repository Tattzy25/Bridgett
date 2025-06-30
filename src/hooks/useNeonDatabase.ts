import { useState, useEffect, useCallback, useRef } from 'react';
import NeonService from '../services/neonService';

interface DatabaseError {
  message: string;
  timestamp: Date;
}

interface UseNeonDatabaseReturn {
  isConnected: boolean;
  currentSessionId: string | null;
  sessionId: string | null; // Alias for currentSessionId for backward compatibility
  error: DatabaseError | null;
  initializeDatabase: () => Promise<void>;
  startNewSession: (user1Lang: string, user2Lang: string, user1Voice: string, user2Voice: string) => Promise<string>;
  saveTranslation: (
    speaker: 'user_one' | 'user_two',
    originalText: string,
    translatedText: string,
    fromLang: string,
    toLang: string,
    voiceId: string
  ) => Promise<void>;
  endCurrentSession: () => Promise<void>;
  clearError: () => void;
}

export const useNeonDatabase = (): UseNeonDatabaseReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<DatabaseError | null>(null);

  const neonServiceRef = useRef<NeonService | null>(null);

  // Initialize Neon service
  const initializeService = useCallback(() => {
    try {
      if (!neonServiceRef.current) {
        neonServiceRef.current = new NeonService();
      }
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Database initialization failed: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }, []);

  const initializeDatabase = useCallback(async () => {
    try {
      setError(null);
      initializeService();

      if (!neonServiceRef.current) {
        throw new Error('Neon service not initialized');
      }

      await neonServiceRef.current.initializeDatabase();
      setIsConnected(true);
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date(),
      });
      setIsConnected(false);
    }
  }, [initializeService]);

  const startNewSession = useCallback(async (
    user1Lang: string,
    user2Lang: string,
    user1Voice: string,
    user2Voice: string
  ): Promise<string> => {
    try {
      setError(null);

      if (!neonServiceRef.current) {
        throw new Error('Neon service not initialized');
      }

      // End current session if exists
      if (currentSessionId) {
        await neonServiceRef.current.endVoiceBridgeSession(currentSessionId);
      }

      const sessionId = await neonServiceRef.current.createVoiceBridgeSession(
        user1Lang,
        user2Lang,
        user1Voice,
        user2Voice
      );

      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Session creation failed: ${error.message}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }, [currentSessionId]);

  const saveTranslation = useCallback(async (
    speaker: 'user_one' | 'user_two',
    originalText: string,
    translatedText: string,
    fromLang: string,
    toLang: string,
    voiceId: string
  ) => {
    try {
      setError(null);

      if (!neonServiceRef.current) {
        throw new Error('Neon service not initialized');
      }

      if (!currentSessionId) {
        throw new Error('No active Voice Bridge session');
      }

      await neonServiceRef.current.saveVoiceBridgeTranslation(
        currentSessionId,
        speaker,
        originalText,
        translatedText,
        fromLang,
        toLang,
        voiceId
      );
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Translation save failed: ${error.message}`,
        timestamp: new Date(),
      });
      // Don't throw here to avoid breaking the translation flow
      console.error('Failed to save translation to Voice Bridge database:', error);
    }
  }, [currentSessionId]);

  const endCurrentSession = useCallback(async () => {
    try {
      if (!neonServiceRef.current || !currentSessionId) {
        return;
      }

      await neonServiceRef.current.endVoiceBridgeSession(currentSessionId);
      setCurrentSessionId(null);
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Session end failed: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }, [currentSessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize database on mount
  useEffect(() => {
    const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;
    if (databaseUrl) {
      initializeDatabase();
    }
  }, [initializeDatabase]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (currentSessionId && neonServiceRef.current) {
        neonServiceRef.current.endVoiceBridgeSession(currentSessionId).catch(console.error);
      }
    };
  }, [currentSessionId]);

  return {
    isConnected,
    currentSessionId,
    sessionId: currentSessionId, // Alias for backward compatibility
    error,
    initializeDatabase,
    startNewSession,
    saveTranslation,
    endCurrentSession,
    clearError
  };
};