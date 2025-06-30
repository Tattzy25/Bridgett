import { useState, useCallback, useRef } from 'react';
import ElevenLabsService from '../services/elevenLabsService';
import GeminiService from '../services/geminiService';
import DeepLService from '../services/deepLService';
import AudioRecorder from '../services/audioRecorder';

interface TranslationError {
  message: string;
  service: 'elevenlabs' | 'gemini' | 'deepl' | 'recorder' | 'general';
  timestamp: Date;
}

interface UseTranslationServicesReturn {
  isProcessing: boolean;
  error: TranslationError | null;
  supportedLanguages: Array<{ code: string; name: string; flag: string }>;
  startRecording: () => Promise<void>;
  stopRecordingAndTranslate: (fromLang: string, toLang: string) => Promise<{ original: string; translated: string; detectedLanguage?: string }>;
  playTranslation: (text: string, voiceId?: string) => Promise<void>;
  clearError: () => void;
  isRecording: boolean;
  initializeLanguages: () => Promise<void>;
}

export const useTranslationServices = (): UseTranslationServicesReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<Array<{ code: string; name: string; flag: string }>>([]);

  const elevenLabsRef = useRef<ElevenLabsService | null>(null);
  const geminiRef = useRef<GeminiService | null>(null);
  const deepLRef = useRef<DeepLService | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

  // Initialize services
  const initializeServices = useCallback(() => {
    try {
      if (!elevenLabsRef.current) {
        elevenLabsRef.current = new ElevenLabsService();
      }
      if (!geminiRef.current) {
        geminiRef.current = new GeminiService();
      }
      if (!deepLRef.current) {
        deepLRef.current = new DeepLService();
      }
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Service initialization failed: ${error.message}`,
        service: 'general',
        timestamp: new Date(),
      });
    }
  }, []);

  const initializeLanguages = useCallback(async () => {
    try {
      setError(null);
      initializeServices();

      if (!deepLRef.current) {
        throw new Error('DeepL service not initialized');
      }

      await deepLRef.current.initializeLanguages();
      const languages = deepLRef.current.getSupportedLanguages();
      setSupportedLanguages(languages);
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Language initialization failed: ${error.message}`,
        service: 'deepl',
        timestamp: new Date(),
      });
      
      // Fallback to basic language set
      setSupportedLanguages([
        { code: 'EN', name: 'English', flag: '🇺🇸' },
        { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
        { code: 'FR', name: 'French', flag: '🇫🇷' },
        { code: 'DE', name: 'German', flag: '🇩🇪' },
        { code: 'IT', name: 'Italian', flag: '🇮🇹' },
        { code: 'PT', name: 'Portuguese', flag: '🇧🇷' },
        { code: 'RU', name: 'Russian', flag: '🇷🇺' },
        { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
        { code: 'KO', name: 'Korean', flag: '🇰🇷' },
        { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
      ]);
    }
  }, [initializeServices]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      initializeServices();

      if (!recorderRef.current) {
        throw new Error('Audio recorder not initialized');
      }

      await recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Recording start failed: ${error.message}`,
        service: 'recorder',
        timestamp: new Date(),
      });
      setIsRecording(false);
    }
  }, [initializeServices]);

  const stopRecordingAndTranslate = useCallback(async (
    fromLang: string,
    toLang: string
  ): Promise<{ original: string; translated: string; detectedLanguage?: string }> => {
    try {
      setIsProcessing(true);
      setError(null);

      if (!recorderRef.current) {
        throw new Error('Audio recorder not initialized');
      }

      if (!geminiRef.current) {
        throw new Error('Gemini service not initialized');
      }

      if (!deepLRef.current) {
        throw new Error('DeepL service not initialized');
      }

      // Stop recording and get audio blob
      const audioBlob = await recorderRef.current.stopRecording();
      setIsRecording(false);

      // Transcribe audio using Gemini (speech-to-text)
      const originalText = await geminiRef.current.transcribeAudio(audioBlob, fromLang);

      if (!originalText.trim()) {
        throw new Error('No speech detected in the recording');
      }

      // Translate using DeepL
      const translationResult = await deepLRef.current.translateText(
        originalText,
        toLang,
        fromLang
      );

      return {
        original: originalText,
        translated: translationResult.translatedText,
        detectedLanguage: translationResult.detectedSourceLanguage,
      };
    } catch (err) {
      const error = err as Error;
      let service: TranslationError['service'] = 'general';

      if (error.message.includes('Gemini') || error.message.includes('transcribe')) {
        service = 'gemini';
      } else if (error.message.includes('DeepL') || error.message.includes('translate')) {
        service = 'deepl';
      } else if (error.message.includes('recording')) {
        service = 'recorder';
      }

      setError({
        message: error.message,
        service,
        timestamp: new Date(),
      });

      setIsRecording(false);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const playTranslation = useCallback(async (text: string, voiceId?: string) => {
    try {
      setError(null);

      if (!elevenLabsRef.current) {
        elevenLabsRef.current = new ElevenLabsService();
      }

      const audioBuffer = await elevenLabsRef.current.synthesizeSpeech(text, voiceId);
      await elevenLabsRef.current.playAudio(audioBuffer);
    } catch (err) {
      const error = err as Error;
      setError({
        message: `Audio playback failed: ${error.message}`,
        service: 'elevenlabs',
        timestamp: new Date(),
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    supportedLanguages,
    startRecording,
    stopRecordingAndTranslate,
    playTranslation,
    clearError,
    isRecording,
    initializeLanguages,
  };
};