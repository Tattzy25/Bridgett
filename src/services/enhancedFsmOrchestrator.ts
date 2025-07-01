import { FSMOrchestrator, TranslationState, TranslationContext, TranslationError } from './fsmOrchestrator';
import AblyService from './ablyService';
import NeonService from './neonService';
import EventService, { EventType } from './eventService';
import LoggingService, { LogLevel } from './loggingService';
import DeepLService from './deepLService';
import GroqService from './groqService';
import ElevenLabsService from './elevenLabsService';

interface ApiStatus {
  service: string;
  available: boolean;
  lastChecked: number;
  errorCount: number;
}

interface OrchestrationResult {
  success: boolean;
  state: TranslationState;
  context: TranslationContext;
  error?: TranslationError;
  timestamp: number;
  duration: number;
}

export class EnhancedFSMOrchestrator extends FSMOrchestrator {
  private ablyService: AblyService;
  private neonService: NeonService | null = null;
  private apiStatuses: Map<string, ApiStatus> = new Map();
  private sessionId: string | null = null;
  private operationStartTime: number = 0;
  private fallbackMode: boolean = false;

  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    super(fromLanguage, toLanguage, voiceId);
    
    this.ablyService = AblyService.getInstance();
    this.initializeServices();
    this.setupEnhancedListeners();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Ably for real-time communication
      await this.ablyService.initialize();
      
      // Initialize Neon database if available
      try {
        this.neonService = new NeonService();
        await this.neonService.initializeDatabase();
        this.logger.info('Database service initialized');
      } catch (error) {
        this.logger.warn('Database service unavailable, continuing without persistence');
      }
      
      // Initialize API status tracking
      this.initializeApiStatuses();
      
    } catch (error) {
      this.logger.error('Failed to initialize enhanced services', 'initialization', error);
    }
  }

  private initializeApiStatuses(): void {
    const services = ['deepl', 'groq', 'elevenlabs'];
    services.forEach(service => {
      this.apiStatuses.set(service, {
        service,
        available: true,
        lastChecked: Date.now(),
        errorCount: 0
      });
    });
  }

  private setupEnhancedListeners(): void {
    // Listen for state changes to broadcast via Ably
    this.addStateChangeListener((state: TranslationState, context: TranslationContext) => {
      this.ablyService.publishState(state, context);
      this.logStateTransition(state, context);
    });

    // Listen for API errors to update status
    this.eventService.subscribe(EventType.ERROR_OCCURRED, (data) => {
      if (data.service) {
        this.updateApiStatus(data.service, false, data.error?.message);
      }
    });
  }

  public async startSession(sessionId: string): Promise<void> {
    try {
      this.sessionId = sessionId;
      await this.ablyService.joinSession(sessionId);
      
      this.eventService.publish(EventType.SESSION_STARTED, {
        sessionId,
        timestamp: Date.now()
      });
      
      this.logger.info(`Session started: ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to start session', 'session', error);
      throw error;
    }
  }

  public async endSession(): Promise<void> {
    try {
      if (this.sessionId) {
        await this.ablyService.leaveSession();
        
        this.eventService.publish(EventType.SESSION_ENDED, {
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
        
        this.logger.info(`Session ended: ${this.sessionId}`);
        this.sessionId = null;
      }
    } catch (error) {
      this.logger.error('Failed to end session', 'session', error);
    }
  }

  public async startRecording(): Promise<void> {
    this.operationStartTime = Date.now();
    
    try {
      await super.startRecording();
      
      this.eventService.publish(EventType.RECORDING_STARTED, {
        timestamp: this.operationStartTime,
        sessionId: this.sessionId
      });
      
    } catch (error) {
      await this.handleOperationError(error as Error, 'recording');
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    try {
      await super.stopRecording();
      
      // The orchestrator will handle the full pipeline
      // We'll log the final result when it completes
      
    } catch (error) {
      await this.handleOperationError(error as Error, 'recording');
      throw error;
    }
  }

  protected async transcribeAudio(audioBlob: Blob): Promise<string> {
    const groqStatus = this.apiStatuses.get('groq');
    
    if (!groqStatus?.available && !this.fallbackMode) {
      this.logger.warn('Groq API unavailable, enabling fallback mode');
      this.fallbackMode = true;
    }

    try {
      const groqService = new GroqService();
      const result = await groqService.transcribeAudio(audioBlob, this.getContext().fromLanguage);
      
      this.updateApiStatus('groq', true);
      this.eventService.publish(EventType.TRANSCRIPTION_COMPLETED, {
        originalText: result,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
      
      return result;
    } catch (error) {
      this.updateApiStatus('groq', false, (error as Error).message);
      
      if (this.fallbackMode) {
        return this.handleTranscriptionFallback(audioBlob);
      }
      
      throw error;
    }
  }

  protected async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    const deepLStatus = this.apiStatuses.get('deepl');
    
    try {
      const deepLService = new DeepLService();
      const result = await deepLService.translateText(text, toLang, fromLang);
      
      this.updateApiStatus('deepl', true);
      this.eventService.publish(EventType.TRANSLATION_COMPLETED, {
        originalText: text,
        translatedText: result.translatedText,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
      
      return result.translatedText;
    } catch (error) {
      this.updateApiStatus('deepl', false, (error as Error).message);
      
      if (!deepLStatus?.available || this.fallbackMode) {
        return this.handleTranslationFallback(text, fromLang, toLang);
      }
      
      throw error;
    }
  }

  protected async synthesizeSpeech(text: string, voiceId?: string): Promise<void> {
    const elevenLabsStatus = this.apiStatuses.get('elevenlabs');
    
    try {
      const elevenLabsService = new ElevenLabsService();
      const audioBuffer = await elevenLabsService.synthesizeSpeech(text, voiceId);
      await elevenLabsService.playAudio(audioBuffer);
      
      this.updateApiStatus('elevenlabs', true);
      this.eventService.publish(EventType.SPEECH_COMPLETED, {
        text,
        voiceId,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
      
    } catch (error) {
      this.updateApiStatus('elevenlabs', false, (error as Error).message);
      
      if (!elevenLabsStatus?.available || this.fallbackMode) {
        await this.handleSpeechFallback(text);
        return;
      }
      
      throw error;
    }
  }

  private async handleTranscriptionFallback(audioBlob: Blob): Promise<string> {
    this.logger.warn('Using transcription fallback');
    
    // Fallback: Return a placeholder that indicates manual transcription needed
    const fallbackText = '[Audio recorded - manual transcription required]';
    
    this.eventService.publish(EventType.TRANSCRIPTION_COMPLETED, {
      originalText: fallbackText,
      fallback: true,
      timestamp: Date.now(),
      sessionId: this.sessionId
    });
    
    return fallbackText;
  }

  private async handleTranslationFallback(text: string, fromLang: string, toLang: string): Promise<string> {
    this.logger.warn('Using translation fallback');
    
    // Fallback: Try using Groq for translation
    try {
      const groqService = new GroqService();
      const result = await groqService.translateWithLLM(text, fromLang, toLang);
      
      this.eventService.publish(EventType.TRANSLATION_COMPLETED, {
        originalText: text,
        translatedText: result,
        fromLanguage: fromLang,
        toLanguage: toLang,
        fallback: true,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
      
      return result;
    } catch (error) {
      // Ultimate fallback: Return original text with note
      const fallbackText = `[Translation unavailable: ${text}]`;
      
      this.eventService.publish(EventType.TRANSLATION_COMPLETED, {
        originalText: text,
        translatedText: fallbackText,
        fromLanguage: fromLang,
        toLanguage: toLang,
        fallback: true,
        error: true,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
      
      return fallbackText;
    }
  }

  private async handleSpeechFallback(text: string): Promise<void> {
    this.logger.warn('Using speech fallback');
    
    // Fallback: Use browser's built-in speech synthesis
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
        
        this.eventService.publish(EventType.SPEECH_COMPLETED, {
          text,
          fallback: true,
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      } else {
        throw new Error('Speech synthesis not available');
      }
    } catch (error) {
      this.logger.error('Speech fallback failed', 'speech', error);
      
      this.eventService.publish(EventType.SPEECH_COMPLETED, {
        text,
        fallback: true,
        error: true,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
    }
  }

  private updateApiStatus(service: string, available: boolean, errorMessage?: string): void {
    const status = this.apiStatuses.get(service);
    if (status) {
      status.available = available;
      status.lastChecked = Date.now();
      
      if (!available) {
        status.errorCount++;
        this.logger.warn(`API ${service} unavailable: ${errorMessage}`);
      } else {
        status.errorCount = 0;
      }
      
      this.apiStatuses.set(service, status);
    }
  }

  private async handleOperationError(error: Error, operation: string): Promise<void> {
    const result: OrchestrationResult = {
      success: false,
      state: this.getState(),
      context: this.getContext(),
      error: {
        message: error.message,
        service: 'general',
        timestamp: new Date()
      },
      timestamp: Date.now(),
      duration: Date.now() - this.operationStartTime
    };

    await this.logOperationResult(result, operation);
    
    this.eventService.publish(EventType.ERROR_OCCURRED, {
      error: result.error,
      operation,
      sessionId: this.sessionId
    });
  }

  private logStateTransition(state: TranslationState, context: TranslationContext): void {
    const logData = {
      state,
      context: {
        speaker: context.speaker,
        fromLanguage: context.fromLanguage,
        toLanguage: context.toLanguage,
        hasOriginalText: !!context.originalText,
        hasTranslatedText: !!context.translatedText,
        hasError: !!context.error
      },
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    this.logger.info(`State transition: ${state}`, 'fsm', logData);
  }

  private async logOperationResult(result: OrchestrationResult, operation: string): Promise<void> {
    if (!this.neonService || !this.sessionId) {
      return;
    }

    try {
      // Log to database with minimal data
      const logEntry = {
        session_id: this.sessionId,
        operation,
        success: result.success,
        state: result.state,
        duration_ms: result.duration,
        error_message: result.error?.message,
        timestamp: new Date(result.timestamp)
      };

      // This would require a new method in NeonService for operation logging
      // await this.neonService.logOperation(logEntry);
      
      this.logger.info(`Operation ${operation} completed`, 'operation', logEntry);
    } catch (error) {
      this.logger.error('Failed to log operation result', 'logging', error);
    }
  }

  public getApiStatuses(): Map<string, ApiStatus> {
    return new Map(this.apiStatuses);
  }

  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  public async dispose(): Promise<void> {
    try {
      await this.endSession();
      await this.ablyService.disconnect();
      super.dispose();
    } catch (error) {
      this.logger.error('Error during disposal', 'cleanup', error);
    }
  }
}

export default EnhancedFSMOrchestrator;