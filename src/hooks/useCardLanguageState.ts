import { useState, useEffect, useCallback } from 'react';
import DeepLService from '../services/deepLService'; // Fixed: default import instead of named import
import { useLanguagePreferences } from './useLanguagePreferences';

interface UseCardLanguageStateReturn {
  fromLanguage: string;
  toLanguage: string;
  setFromLanguage: (language: string) => void;
  setToLanguage: (language: string) => void;
  swapLanguages: () => void;
}

export const useCardLanguageState = (cardId: string): UseCardLanguageStateReturn => {
  const [fromLanguage, setFromLanguageState] = useState('EN');
  const [toLanguage, setToLanguageState] = useState('ES');
  const deepLService = new DeepLService();
  const { defaultPreference, savePreference } = useLanguagePreferences(cardId);

  // Load default preferences on mount
  useEffect(() => {
    if (defaultPreference) {
      setFromLanguageState(defaultPreference.from_language);
      setToLanguageState(defaultPreference.to_language);
    }
  }, [defaultPreference]);

  const setFromLanguage = useCallback(async (language: string) => {
    setFromLanguageState(language);
    // Save to database
    try {
      await savePreference(language, toLanguage, 'default', true);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [toLanguage, savePreference]);

  const setToLanguage = useCallback(async (language: string) => {
    setToLanguageState(language);
    // Save to database
    try {
      await savePreference(fromLanguage, language, 'default', true);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [fromLanguage, savePreference]);

  const swapLanguages = useCallback(async () => {
    const newFromLang = toLanguage;
    const newToLang = fromLanguage;
    setFromLanguageState(newFromLang);
    setToLanguageState(newToLang);
    
    // Save swapped languages to database
    try {
      await savePreference(newFromLang, newToLang, 'default', true);
    } catch (error) {
      console.error('Failed to save swapped language preference:', error);
    }
  }, [fromLanguage, toLanguage, savePreference]);

  return {
    fromLanguage,
    toLanguage,
    setFromLanguage,
    setToLanguage,
    swapLanguages
  };
};