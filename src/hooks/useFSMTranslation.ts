// FSM-based Translation Hook
// This hook provides a React interface to the FSM Orchestrator

import { useState, useEffect, useCallback } from 'react';
import FSMOrchestrator, { 
  TranslationState, 
  TranslationContext, 
  TranslationError 
} from '../services/fsmOrchestrator';
import { useNeonDatabase } from './useNeonDatabase';
import { getApiKey } from '../config/apiKeys';
import ElevenLabsService from '../services/elevenLabsService';
import DeepLService from '../services/deepLService';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  detectedLanguage?: string;
  timestamp: Date;
}

export interface UseFSMTranslationReturn {
  state: TranslationState;
  isRecording: boolean;
  isProcessing: boolean;
  error: TranslationError | null;
  originalText: string | null;
  translatedText: string | null;
  detectedLanguage: string | null;
  supportedLanguages: { code: string; name: string; flag: string }[];
  fromLanguage: string;
  toLanguage: string;
  voiceId: string | null;
  availableVoices: { voice_id: string; name: string }[];
  startRecording: () => Promise<void>;
  stopRecordingAndTranslate: () => Promise<void>;
  clearError: () => void;
  setFromLanguage: (language: string) => void;
  setToLanguage: (language: string) => void;
  setVoiceId: (voiceId: string) => void;
}

export const useFSMTranslation = (): UseFSMTranslationReturn => {
  // State
  const [orchestrator, setOrchestrator] = useState<FSMOrchestrator | null>(null);
  const [state, setState] = useState<TranslationState>(TranslationState.IDLE);
  const [context, setContext] = useState<TranslationContext | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<{ code: string; name: string; flag: string }[]>([]);
  const [availableVoices, setAvailableVoices] = useState<{ voice_id: string; name: string }[]>([]);
  const [fromLanguage, setFromLanguage] = useState<string>('en');
  const [toLanguage, setToLanguage] = useState<string>('es');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  
  // Database hook for saving translations
  const { 
    sessionId, 
    saveTranslation,
    isConnected: isDatabaseConnected 
  } = useNeonDatabase();

  // Initialize the orchestrator and services
  useEffect(() => {
    const defaultVoiceId = getApiKey('ELEVENLABS_VOICE_ID');
    const newOrchestrator = new FSMOrchestrator(fromLanguage, toLanguage, defaultVoiceId);
    
    // Listen for state changes
    const stateChangeListener = (newState: TranslationState, newContext: TranslationContext) => {
      setState(newState);
      setContext(newContext);
    };
    
    newOrchestrator.addStateChangeListener(stateChangeListener);
    setOrchestrator(newOrchestrator);
    setVoiceId(defaultVoiceId);
    
    // Initialize supported languages
    const initializeLanguages = async () => {
      try {
        // We'll use DeepL's language list for now
        const deepLService = new DeepLService();
        await deepLService.initializeLanguages();
        const languages = deepLService.getSupportedLanguages();
        setSupportedLanguages(languages);
      } catch (error) {
        console.error('Failed to initialize languages:', error);
      }
    };
    
    // Initialize available voices
    const initializeVoices = async () => {
      try {
        const elevenLabsService = new ElevenLabsService();
        const voices = await elevenLabsService.getVoices();
        setAvailableVoices(voices);
      } catch (error) {
        console.error('Failed to initialize voices:', error);
      }
    };
    
    initializeLanguages();
    initializeVoices();
    
    // Cleanup
    return () => {
      newOrchestrator.removeStateChangeListener(stateChangeListener);
      newOrchestrator.dispose();
    };
  }, []);
  
  // Update orchestrator when language or voice changes
  useEffect(() => {
    if (orchestrator) {
      orchestrator.updateLanguages(fromLanguage, toLanguage);
    }
  }, [orchestrator, fromLanguage, toLanguage]);
  
  useEffect(() => {
    if (orchestrator && voiceId) {
      orchestrator.updateVoice(voiceId);
    }
  }, [orchestrator, voiceId]);
  
  // Save successful translations to the database
  useEffect(() => {
    if (
      isDatabaseConnected &&
      sessionId &&
      state === TranslationState.IDLE &&
      context?.originalText &&
      context?.translatedText
    ) {
      const saveToDb = async () => {
        try {
          // Determine speaker based on context or default to user_one
          const speaker = context.speaker === 'user2' ? 'user_two' : 'user_one';
          
          if (sessionId) {
            await saveTranslation(
              speaker,
              context.originalText || '',
              context.translatedText || '',
              context.fromLanguage || '',
              context.toLanguage || '',
              context.voiceId || ''
            );
          } else {
            console.warn('Cannot save translation: No active session ID');
          }
        } catch (error) {
          console.error('Failed to save translation to database:', error);
        }
      };
      
      saveToDb();
    }
  }, [state, context, isDatabaseConnected, sessionId, saveTranslation]);
  
  // Handlers
  const startRecording = useCallback(async () => {
    if (orchestrator) {
      await orchestrator.startRecording();
    }
  }, [orchestrator]);
  
  const stopRecordingAndTranslate = useCallback(async () => {
    if (orchestrator) {
      await orchestrator.stopRecording();
    }
  }, [orchestrator]);
  
  const clearError = useCallback(() => {
    if (orchestrator) {
      orchestrator.clearError();
    }
  }, [orchestrator]);
  
  const handleFromLanguageChange = useCallback((language: string) => {
    setFromLanguage(language);
  }, []);
  
  const handleToLanguageChange = useCallback((language: string) => {
    setToLanguage(language);
  }, []);
  
  const handleVoiceChange = useCallback((newVoiceId: string) => {
    setVoiceId(newVoiceId);
  }, []);
  
  // Derived state
  const isRecording = state === TranslationState.RECORDING;
  const isProcessing = [
    TranslationState.TRANSCRIBING,
    TranslationState.TRANSLATING,
    TranslationState.SPEAKING
  ].includes(state);
  
  return {
    state,
    isRecording,
    isProcessing,
    error: context?.error || null,
    originalText: context?.originalText || null,
    translatedText: context?.translatedText || null,
    detectedLanguage: context?.detectedLanguage || null,
    supportedLanguages,
    fromLanguage,
    toLanguage,
    voiceId,
    availableVoices,
    startRecording,
    stopRecordingAndTranslate,
    clearError,
    setFromLanguage: handleFromLanguageChange,
    setToLanguage: handleToLanguageChange,
    setVoiceId: handleVoiceChange
  };
};

export default useFSMTranslation;