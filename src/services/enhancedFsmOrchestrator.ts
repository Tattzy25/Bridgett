import { FSMOrchestrator, TranslationState, TranslationContext, TranslationError } from './fsmOrchestrator';
import AblyService from './ablyService';
import NeonService from './neonService';
import EventService, { EventType } from './eventService';
import LoggingService from './loggingService';
import GroqService from './groqService';
import DeepLService from './deepLService';
import ElevenLabsService from './elevenLabsService';
import GeminiService from './geminiService';

interface ApiStatus {
  service: string;
  available: boolean;
  lastChecked: number;
  errorCount: number;
}

interface BridgitSession {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  finalText?: string;
  translatedText?: string;
  ttsVoice?: string;
  recordingStart?: Date;
  recordingEnd?: Date;
  translationStart?: Date;
  translationEnd?: Date;
  speakingStart?: Date;
  speakingEnd?: Date;
}

export class EnhancedFSMOrchestrator extends FSMOrchestrator {
  private ablyService: AblyService;
  private neonService: NeonService | null = null;
  private groqService: GroqService;
  private deepLService: DeepLService;
  private elevenLabsService: ElevenLabsService;
  private apiStatuses: Map<string, ApiStatus> = new Map();
  private currentSession: BridgitSession | null = null;
  private fallbackMode: boolean = false;
  private enhancedLogger: LoggingService;
  private enhancedEventService: EventService;
  private geminiService: GeminiService;
  
  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    super(fromLanguage, toLanguage, voiceId);
    
    this.ablyService = AblyService.getInstance();
    this.groqService = new GroqService();
    this.deepLService = new DeepLService();
    this.elevenLabsService = new ElevenLabsService();
    this.enhancedLogger = LoggingService.getInstance();
    this.enhancedEventService = EventService.getInstance();
    this.geminiService = new GeminiService();
    
    this.enhancedLogger.configure({ contextPrefix: 'ProductionFSM' });
    
    this.initializeServices();
    this.setupProductionListeners();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Ably for real-time FSM state sync
      await this.ablyService.initialize();
      
      // Initialize Neon database for session tracking
      try {
        this.neonService = new NeonService();
        await this.neonService.initializeDatabase();
        await this.createBridgitSessionsTable();
        this.enhancedLogger.info('Production database initialized');
      } catch (error) {
        this.enhancedLogger.warn('Database unavailable, continuing without persistence');
      }
      
      // Initialize API status tracking
      this.initializeApiStatuses();
      
    } catch (error) {
      this.enhancedLogger.error('Failed to initialize production services', 'initialization', error);
    }
  }

  private async createBridgitSessionsTable(): Promise<void> {
    if (!this.neonService) return;
    
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bridgit_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          source_language VARCHAR(10) NOT NULL,
          target_language VARCHAR(10) NOT NULL,
          final_text TEXT,
          translated_text TEXT,
          tts_voice VARCHAR(100),
          recording_start TIMESTAMP,
          recording_end TIMESTAMP,
          translation_start TIMESTAMP,
          translation_end TIMESTAMP,
          speaking_start TIMESTAMP,
          speaking_end TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_created_at ON bridgit_sessions(created_at);
        CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_languages ON bridgit_sessions(source_language, target_language);
      `;
      
      await this.neonService.executeQuery(createTableQuery);
    } catch (error) {
      this.enhancedLogger.error('Failed to create bridgit_sessions table', 'database', error);
    }
  }

  private initializeApiStatuses(): void {
    const services = ['groq', 'deepl', 'elevenlabs', 'gemini'];
    services.forEach(service => {
      this.apiStatuses.set(service, {
        service,
        available: true,
        lastChecked: Date.now(),
        errorCount: 0
      });
    });
  }

  private setupProductionListeners(): void {
    // Listen for API errors to update status and trigger fallbacks
    this.enhancedEventService.subscribe(EventType.ERROR_OCCURRED, (payload) => {
      const errorData = payload.data as any;
      if (errorData?.service) {
        this.updateApiStatus(errorData.service, false, errorData.error?.message);
      }
    });
  }

  private publishState(state: TranslationState, context: TranslationContext): void {
    this.ablyService.publishState(state, context);
    this.logStateTransition(state, context);
    this.updateSessionTimestamps(state);
  }

  // PRODUCTION API FLOW IMPLEMENTATION
  
  public async startProductionSession(sourceLanguage: string, targetLanguage: string, ttsVoice?: string): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      
      this.currentSession = {
        id: sessionId,
        sourceLanguage,
        targetLanguage,
        ttsVoice: ttsVoice || this.voiceId || 'default'
      };
      
      this.enhancedEventService.publish(EventType.SESSION_STARTED, {
        sessionId,
        timestamp: Date.now()
      });
      
      this.enhancedLogger.info(`Production session started: ${sessionId}`);
      return sessionId;
    } catch (error) {
      this.enhancedLogger.error('Failed to start production session', 'session', error);
      throw error;
    }
  }

  // 1️⃣ Mic ON + Voice Detection → FSM: RECORDING/IDLE
  public async startRecording(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session. Call startProductionSession first.');
    }
    
    this.currentSession.recordingStart = new Date();
    await super.startRecording();
  }

  public async stopRecording(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.recordingEnd = new Date();
    }
    await super.stopRecording();
  }

  // 2️⃣ STT: Groq (primary) → Gemini (fallback)
  protected async transcribeAudio(audioBlob: Blob): Promise<string> {
    const context = this.getContext();
    try {
      // PRIMARY: Groq STT
      return await this.groqService.transcribeAudio(audioBlob, context.fromLanguage);
    } catch (error) {
      // FALLBACK: Gemini STT
      return await this.geminiService.transcribeAudio(audioBlob, context.fromLanguage);
    }
  }

  // 3️⃣ Translation: DeepL (primary) → Groq LLM (fallback)
  protected async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    const context = this.getContext();
    if (this.currentSession) {
      this.currentSession.translationStart = new Date();
      this.currentSession.finalText = text;
    }
    
    try {
      // PRIMARY: DeepL
      const translation = await this.deepLService.translateText(text, context.fromLanguage, context.toLanguage);
      if (this.currentSession) {
        this.currentSession.translatedText = translation;
        this.currentSession.translationEnd = new Date();
      }
      return translation;
    } catch (error) {
      // FALLBACK: Groq LLM
      const translation = await this.groqService.translateWithLLM(text, context.fromLanguage, context.toLanguage);
      if (this.currentSession) {
        this.currentSession.translatedText = translation;
        this.currentSession.translationEnd = new Date();
      }
      return translation;
    }
  }

  // 4️⃣ TTS: ElevenLabs (primary) → Groq LLM text fallback
  protected async synthesizeSpeech(text: string): Promise<void> {
    const context = this.getContext();
    if (this.currentSession) {
      this.currentSession.speakingStart = new Date();
    }
    
    try {
      // PRIMARY: ElevenLabs
      await this.elevenLabsService.synthesizeAndPlay(text, this.voiceId);
      this.updateApiStatus('elevenlabs', true);
      
      if (this.currentSession) {
        this.currentSession.speakingEnd = new Date();
      }
    } catch (error: any) {
      this.enhancedLogger.warn('ElevenLabs failed, using Groq LLM text fallback');
      this.updateApiStatus('elevenlabs', false, error.message);
      
      try {
        // FALLBACK: Groq LLM text output (no audio)
        const fallbackText = await this.groqService.translateWithLLM(
          `Convert this to simple spoken text: ${text}`,
          context.toLanguage,
          context.toLanguage
        );
        
        // Display the text instead of playing audio
        this.enhancedLogger.info(`TTS Fallback Text: ${fallbackText}`);
        
        // Emit event for UI to display the text
        this.enhancedEventService.publish(EventType.TTS_FALLBACK_TEXT || 'tts_fallback_text', {
          text: fallbackText,
          sessionId: this.currentSession?.id
        });
        
        if (this.currentSession) {
          this.currentSession.speakingEnd = new Date();
        }
      } catch (fallbackError) {
        this.enhancedLogger.error('TTS completely failed', 'speech', fallbackError);
        throw fallbackError;
      }
    }
  }

  private updateSessionTimestamps(state: TranslationState): void {
    if (!this.currentSession) return;
    
    const now = new Date();
    
    switch (state) {
      case TranslationState.RECORDING:
        if (!this.currentSession.recordingStart) {
          this.currentSession.recordingStart = now;
        }
        break;
      case TranslationState.TRANSCRIBING:
        if (!this.currentSession.recordingEnd) {
          this.currentSession.recordingEnd = now;
        }
        break;
      case TranslationState.TRANSLATING:
        if (!this.currentSession.translationStart) {
          this.currentSession.translationStart = now;
        }
        break;
      case TranslationState.SPEAKING:
        if (!this.currentSession.translationEnd) {
          this.currentSession.translationEnd = now;
        }
        if (!this.currentSession.speakingStart) {
          this.currentSession.speakingStart = now;
        }
        break;
      case TranslationState.IDLE:
        if (this.currentSession.speakingStart && !this.currentSession.speakingEnd) {
          this.currentSession.speakingEnd = now;
        }
        // Save session to database when complete
        this.saveSessionToDatabase();
        break;
    }
  }

  private async saveSessionToDatabase(): Promise<void> {
    if (!this.currentSession || !this.neonService) return;
    
    const context = this.getContext();
    try {
      await this.neonService.executeQuery(`
        INSERT INTO bridgit_sessions (
          id, source_language, target_language, final_text, translated_text, 
          tts_voice, recording_start, recording_end, translation_start, 
          translation_end, speaking_start, speaking_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        this.currentSession.id,
        context.fromLanguage,
        context.toLanguage,
        context.originalText,
        context.translatedText,
        context.voiceId,
        this.currentSession.recordingStart,
        this.currentSession.recordingEnd,
        this.currentSession.translationStart,
        this.currentSession.translationEnd,
        this.currentSession.speakingStart,
        this.currentSession.speakingEnd
      ]);
    } catch (error) {
      this.enhancedLogger.error('Failed to save session to database', 'database', error);
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

  private logStateTransition(state: TranslationState, context: TranslationContext): void {
    const logData = {
      state,
      sessionId: this.currentSession?.id,
      timestamp: Date.now(),
      hasText: !!context.originalText,
      hasTranslation: !!context.translatedText
    };

    this.enhancedLogger.info(`FSM State: ${state}`, 'production', logData);
  }

  private generateSessionId(): string {
    return `bridgit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  public getApiStatuses(): Map<string, ApiStatus> {
    return new Map(this.apiStatuses);
  }

  public getCurrentSession(): BridgitSession | null {
    return this.currentSession;
  }

  public async endSession(): Promise<void> {
    if (this.currentSession) {
      await this.saveSessionToDatabase();
      
      this.enhancedEventService.publish(EventType.SESSION_ENDED, {
        sessionId: this.currentSession.id,
        timestamp: Date.now()
      });
      
      this.enhancedLogger.info(`Production session ended: ${this.currentSession.id}`);
      this.currentSession = null;
    }
  }

  public dispose(): void {
    try {
      this.endSession();
      this.ablyService.disconnect();
      super.dispose();
      this.enhancedLogger.info('Production FSM Orchestrator disposed');
    } catch (error) {
      this.enhancedLogger.error('Error during disposal', 'cleanup', error);
    }
  }
}

export default EnhancedFSMOrchestrator;