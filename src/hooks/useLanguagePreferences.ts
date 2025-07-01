import { useState, useEffect, useCallback, useRef } from 'react';
import NeonService from '../services/neonService';

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

interface UseLanguagePreferencesReturn {
  preferences: UserLanguagePreference[];
  defaultPreference: UserLanguagePreference | null;
  savePreference: (fromLang: string, toLang: string, voice: string, isDefault?: boolean) => Promise<string>;
  deletePreference: (preferenceId: string) => Promise<void>;
  loadPreferences: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLanguagePreferences = (userIdentifier?: string): UseLanguagePreferencesReturn => {
  const [preferences, setPreferences] = useState<UserLanguagePreference[]>([]);
  const [defaultPreference, setDefaultPreference] = useState<UserLanguagePreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const neonServiceRef = useRef<NeonService | null>(null);
  const mountedRef = useRef(true);

  // Generate a unique user identifier if none provided
  const finalUserIdentifier = userIdentifier || (() => {
    const stored = localStorage.getItem('bridgit_user_id');
    if (stored) return stored;
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bridgit_user_id', newId);
    return newId;
  })();

  // Initialize Neon service
  const getNeonService = useCallback(() => {
    if (!neonServiceRef.current) {
      try {
        neonServiceRef.current = new NeonService();
      } catch (err) {
        const errorMessage = `Failed to initialize database service: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
    return neonServiceRef.current;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadPreferences = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const service = getNeonService();
      const [userPrefs, defaultPref] = await Promise.all([
        service.getUserLanguagePreferences(finalUserIdentifier),
        service.getDefaultLanguagePreference(finalUserIdentifier)
      ]);
      
      if (mountedRef.current) {
        setPreferences(userPrefs);
        setDefaultPreference(defaultPref);
      }
    } catch (err) {
      const errorMessage = `Failed to load language preferences: ${err instanceof Error ? err.message : 'Unknown error'}`;
      if (mountedRef.current) {
        setError(errorMessage);
      }
      console.error(errorMessage, err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [finalUserIdentifier, getNeonService]);

  const savePreference = useCallback(async (
    fromLang: string, 
    toLang: string, 
    voice: string, 
    isDefault: boolean = false
  ): Promise<string> => {
    setError(null);
    
    // Validation
    if (!fromLang?.trim()) {
      throw new Error('From language is required');
    }
    if (!toLang?.trim()) {
      throw new Error('To language is required');
    }
    if (!voice?.trim()) {
      throw new Error('Voice preference is required');
    }
    if (fromLang === toLang) {
      throw new Error('From and to languages must be different');
    }

    try {
      const service = getNeonService();
      const preferenceId = await service.saveUserLanguagePreference(
        finalUserIdentifier,
        fromLang.trim(),
        toLang.trim(),
        voice.trim(),
        isDefault
      );
      
      // Reload preferences to get updated data
      await loadPreferences();
      
      return preferenceId;
    } catch (err) {
      const errorMessage = `Failed to save language preference: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  }, [finalUserIdentifier, getNeonService, loadPreferences]);

  const deletePreference = useCallback(async (preferenceId: string): Promise<void> => {
    if (!preferenceId?.trim()) {
      throw new Error('Preference ID is required');
    }

    setError(null);
    
    try {
      const service = getNeonService();
      await service.deleteUserLanguagePreference(preferenceId.trim());
      
      // Reload preferences to get updated data
      await loadPreferences();
    } catch (err) {
      const errorMessage = `Failed to delete language preference: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  }, [getNeonService, loadPreferences]);

  // Load preferences on mount and when user identifier changes
  useEffect(() => {
    mountedRef.current = true;
    loadPreferences();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadPreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    preferences,
    defaultPreference,
    savePreference,
    deletePreference,
    loadPreferences,
    isLoading,
    error,
    clearError
  };
};