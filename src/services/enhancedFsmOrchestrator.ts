import { FSMOrchestrator, TranslationState, TranslationContext, TranslationError } from './fsmOrchestrator';
import AblyService from './ablyService';
import NeonService from './neonService';
import EventService, { EventType } from './eventService';
import LoggingService from './loggingService';
import GroqService from './groqService';

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

// Define proper event data interfaces
interface ErrorEventData {
  service?: string;
  error?: { message?: string };
  operation?: string;
  sessionId?: string;
}

export class EnhancedFSMOrchestrator extends FSMOrchestrator {
  private ablyService: AblyService;
  private neonService: NeonService | null = null;
  private apiStatuses: Map<string, ApiStatus> = new Map();
  private sessionId: string | null = null;
  // Remove operationStartTime property
  private fallbackMode: boolean = false;
  private enhancedLogger: LoggingService;
  private enhancedEventService: EventService;

  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    super(fromLanguage, toLanguage, voiceId);
    
    this.ablyService = AblyService.getInstance();
    this.enhancedLogger = LoggingService.getInstance();
    this.enhancedEventService = EventService.getInstance();
    
    this.enhancedLogger.configure({ contextPrefix: 'EnhancedFSMOrchestrator' });
    
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
        this.enhancedLogger.info('Database service initialized');
      } catch (error) {
        this.enhancedLogger.warn('Database service unavailable, continuing without persistence');
      }
      
      // Initialize API status tracking
      this.initializeApiStatuses();
      
    } catch (error) {
      this.enhancedLogger.error('Failed to initialize enhanced services', 'initialization', error);
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
    this.enhancedEventService.subscribe(EventType.ERROR_OCCURRED, (payload) => {
      const errorData = payload.data as ErrorEventData;
      if (errorData?.service) {
        this.updateApiStatus(errorData.service, false, errorData.error?.message);
      }
    });
  }

  public async startSession(sessionId: string): Promise<void> {
    try {
      this.sessionId = sessionId;
      
      this.enhancedEventService.publish(EventType.SESSION_STARTED, {
        sessionId,
        timestamp: Date.now()
      });
      
      this.enhancedLogger.info(`Session started: ${sessionId}`);
    } catch (error) {
      this.enhancedLogger.error('Failed to start session', 'session', error);
      throw error;
    }
  }

  public async endSession(): Promise<void> {
    if (this.sessionId) {
      try {
        this.enhancedEventService.publish(EventType.SESSION_ENDED, {
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
        
        this.enhancedLogger.info(`Session ended: ${this.sessionId}`);
        this.sessionId = null;
      } catch (error) {
        this.enhancedLogger.error('Failed to end session', 'session', error);
      }
    }
  }

  private async handleTranslationFallback(text: string, fromLang: string, toLang: string): Promise<string> {
    this.enhancedLogger.warn('Using translation fallback');
    
    // Fallback: Try using Groq for translation
    try {
      const groqService = new GroqService();
      const result = await groqService.translateWithLLM(text, fromLang, toLang);
      
      this.enhancedEventService.publish(EventType.TRANSLATION_COMPLETED, {
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
      
      this.enhancedEventService.publish(EventType.TRANSLATION_COMPLETED, {
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
    this.enhancedLogger.warn('Using speech fallback');
    
    // Fallback: Use browser's built-in speech synthesis
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
        
        this.enhancedEventService.publish(EventType.SPEECH_COMPLETED, {
          text,
          fallback: true,
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      } else {
        throw new Error('Speech synthesis not available');
      }
    } catch (error) {
      this.enhancedLogger.error('Speech fallback failed', 'speech', error);
      
      this.enhancedEventService.publish(EventType.SPEECH_COMPLETED, {
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
        this.enhancedLogger.warn(`API ${service} unavailable: ${errorMessage}`);
      } else {
        status.errorCount = 0;
      }
      
      this.apiStatuses.set(service, status);
    }
  }

  // Remove or comment out these unused items:
  // - operationStartTime property (line 37)
  // - handleTranslationFallback method (line 137)
  // - handleSpeechFallback method (line 175)
  // - logOperationResult method if not needed (line 249)
  // - handleOperationError (line 227)
  // Remove handleTranslationFallback method entirely
  // Remove handleSpeechFallback method entirely
  // Remove logOperationResult method entirely

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

    this.enhancedLogger.info(`State transition: ${state}`, 'fsm', logData);
  }

  private async logOperationResult(result: OrchestrationResult, operation: string): Promise<void> {
    if (!this.neonService || !this.sessionId) {
      return;
    }
  
    try {
      // Since NeonService doesn't have logOperation method, 
      // either remove this call or create a translation record instead
      const translationData = {
        voice_bridge_session_id: this.sessionId,
        speaker_identifier: 'user_one' as const,
        original_speech_text: operation,
        translated_speech_text: result.success ? 'Success' : 'Failed',
        source_language: 'en',
        target_language: 'en',
        voice_synthesis_id: 'system'
      };
      
      // Use existing NeonService method instead
      await this.neonService.saveVoiceBridgeTranslation(translationData);
      
      this.enhancedLogger.info(`Operation ${operation} logged`, 'EnhancedFSMOrchestrator', {
        success: result.success,
        duration: result.duration
      });
    } catch (error) {
      this.enhancedLogger.error(`Failed to log operation: ${error}`, 'EnhancedFSMOrchestrator');
    }
  }

  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  public getApiStatuses(): Map<string, ApiStatus> {
    return new Map(this.apiStatuses);
  }

  public dispose(): void {
    try {
      // Clean up enhanced services
      this.ablyService.disconnect();
      
      // Call parent dispose
      super.dispose();
      
      this.enhancedLogger.info('Enhanced FSM Orchestrator disposed');
    } catch (error) {
      this.enhancedLogger.error('Error during disposal', 'cleanup', error);
    }
  }
}

export default EnhancedFSMOrchestrator;