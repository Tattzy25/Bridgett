import { useState, useEffect, useCallback } from 'react';
import EnhancedFSMOrchestrator from '../services/enhancedFsmOrchestrator';
import { TranslationState, TranslationContext, TranslationError } from '../services/fsmOrchestrator';
import { useNeonDatabase } from './useNeonDatabase';
import { getApiKey } from '../config/apiKeys';

export interface UseEnhancedFSMTranslationReturn {
  state: TranslationState;
  isRecording: boolean;
  isProcessing: boolean;
  error: TranslationError | null;
  originalText: string | null;
  translatedText: string | null;
  detectedLanguage: string | null;
  fromLanguage: string;
  toLanguage: string;
  voiceId: string | null;
  isConnected: boolean;
  isFallbackMode: boolean;
  apiStatuses: Map<string, any>;
  startRecording: () => Promise<void>;
  stopRecordingAndTranslate: () => Promise<void>;
  clearError: () => void;
  setFromLanguage: (language: string) => void;
  setToLanguage: (language: string) => void;
  setVoiceId: (voiceId: string) => void;
}

export const useEnhancedFSMTranslation = (): UseEnhancedFSMTranslationReturn => {
  const [orchestrator, setOrchestrator] = useState<EnhancedFSMOrchestrator | null>(null);
  const [state, setState] = useState<TranslationState>(TranslationState.IDLE);
  const [context, setContext] = useState<TranslationContext | null>(null);
  const [fromLanguage, setFromLanguage] = useState<string>('en');
  const [toLanguage, setToLanguage] = useState<string>('es');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [isConnected] = useState<boolean>(false); // Remove setIsConnected
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [apiStatuses, setApiStatuses] = useState<Map<string, any>>(new Map());
  
  const { sessionId, startNewSession } = useNeonDatabase();

  // Initialize orchestrator
  useEffect(() => {
    const defaultVoiceId = getApiKey('ELEVENLABS_VOICE_ID');
    const newOrchestrator = new EnhancedFSMOrchestrator(fromLanguage, toLanguage, defaultVoiceId);
    
    const stateChangeListener = (newState: TranslationState, newContext: TranslationContext) => {
      setState(newState);
      setContext(newContext);
      setIsFallbackMode(newOrchestrator.isFallbackMode());
      setApiStatuses(new Map(newOrchestrator.getApiStatuses()));
    };
    
    newOrchestrator.addStateChangeListener(stateChangeListener);
    setOrchestrator(newOrchestrator);
    setVoiceId(defaultVoiceId);
    
    // Start session if we have a session ID
    if (sessionId) {
      newOrchestrator.startSession(sessionId).catch(console.error);
    }
    
    return () => {
      newOrchestrator.removeStateChangeListener(stateChangeListener);
      newOrchestrator.dispose();
    };
  }, []);

  // Update orchestrator when languages change
  useEffect(() => {
    if (orchestrator) {
      orchestrator.updateLanguages(fromLanguage, toLanguage);
    }
  }, [orchestrator, fromLanguage, toLanguage]);

  // Update orchestrator when voice changes
  useEffect(() => {
    if (orchestrator && voiceId) {
      orchestrator.updateVoice(voiceId);
    }
  }, [orchestrator, voiceId]);

  // Start new session when session ID changes
  useEffect(() => {
    if (orchestrator && sessionId) {
      orchestrator.startSession(sessionId).catch(console.error);
    }
  }, [orchestrator, sessionId]);

  const startRecording = useCallback(async () => {
    if (orchestrator) {
      // Ensure we have a session
      if (!sessionId) {
        await startNewSession(fromLanguage, toLanguage, voiceId || '', voiceId || '');
      }
      await orchestrator.startRecording();
    }
  }, [orchestrator, sessionId, startNewSession, fromLanguage, toLanguage, voiceId]);

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
    fromLanguage,
    toLanguage,
    voiceId,
    isConnected,
    isFallbackMode,
    apiStatuses,
    startRecording,
    stopRecordingAndTranslate,
    clearError,
    setFromLanguage: handleFromLanguageChange,
    setToLanguage: handleToLanguageChange,
    setVoiceId: handleVoiceChange
  };
};