import { FSMOrchestrator, TranslationContext, TranslationError } from './fsmOrchestrator';
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
  lastError?: string;
}

interface BridgitSession {
  sessionId: string;
  userId?: string;
  planId?: string;
  sourceLanguage: string;
  targetLanguage: string;
  ttsVoice?: string;
  sttProvider?: string;
  translationProvider?: string;
  ttsProvider?: string;
  sttFallbackUsed: boolean;
  translateFallbackUsed: boolean;
  ttsFallbackUsed: boolean;
  finalText?: string;
  translatedText?: string;
  sttTokensUsed?: number;
  sttDurationSeconds?: number;
  ttsCharactersUsed?: number;
  totalTokensBilled?: number;
  usageBilled: boolean;
  recordingStart?: Date;
  recordingEnd?: Date;
  transcriptionStart?: Date;
  transcriptionEnd?: Date;
  translationStart?: Date;
  translationEnd?: Date;
  speakingStart?: Date;
  speakingEnd?: Date;
  clientIp?: string;
  userAgent?: string;
  status: string;
  errorMessage?: string;
  audioUrl?: string;
  createdAt: Date;
  deletedAt?: Date;
}

export class ProductionOrchestrator extends FSMOrchestrator {
  private ablyService: AblyService;
  private neonService: NeonService | null = null;
  private apiStatuses: Map<string, ApiStatus> = new Map();
  private currentSession: BridgitSession | null = null;
  private fallbackMode: boolean = false;
  private enhancedLogger: LoggingService;
  private enhancedEventService: EventService;
  private geminiService: GeminiService;
  private translationMode: 'just-me' | 'talk-together' = 'just-me';
  private isHostingSession: boolean = false;
  private isGuestInSession: boolean = false;
  private sessionMonitor: NodeJS.Timeout | null = null;

  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    super(fromLanguage, toLanguage, voiceId);
    
    this.ablyService = AblyService.getInstance();
    this.enhancedLogger = LoggingService.getInstance();
    this.enhancedEventService = EventService.getInstance();
    this.geminiService = new GeminiService();
    
    this.enhancedLogger.configure({ contextPrefix: 'ProductionFSM' });
    
    this.initializeServices();
    this.setupProductionListeners();
  }

  private async initializeServices(): Promise<void> {
    try {
      await this.ablyService.initialize();
      
      try {
        this.neonService = new NeonService();
        await this.neonService.initializeDatabase();
        this.enhancedLogger.info('Production database initialized');
      } catch (error) {
        this.enhancedLogger.warn('Database unavailable, continuing without persistence');
      }
      
      this.initializeApiStatuses();
      
    } catch (error) {
      this.enhancedLogger.error('Failed to initialize production services', 'initialization', error);
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
    this.enhancedEventService.subscribe(EventType.ERROR_OCCURRED, (payload) => {
      const errorData = payload.data as any;
      if (errorData?.service) {
        this.updateApiStatus(errorData.service, false, errorData.error?.message);
      }
    });
    
    // Listen for stale connection events
    this.enhancedEventService.subscribe(EventType.SERVICE_STATUS_CHANGED, (payload) => {
      const data = payload.data as any;
      if (data?.service === 'ably' && data?.status === 'client_disconnected_stale') {
        this.handleStaleClientDisconnection(data.clientId, data.reason);
      }
    });
  }

  private async handleStaleClientDisconnection(clientId: string, reason: string): Promise<void> {
    this.enhancedLogger.warn(`Handling stale client disconnection: ${clientId}`, 'cleanup', { reason });
    
    try {
      // Update database if this affects current session
      if (this.neonService && (this.isHostingSession || this.isGuestInSession)) {
        await this.neonService.sql`
          UPDATE bridgit_sessions 
          SET status = 'interrupted',
              disconnection_reason = ${reason},
              disconnected_at = NOW()
          WHERE (host_client_id = ${clientId} OR guest_client_id = ${clientId})
          AND status = 'active'
        `;
      }
      
      // If the disconnected client was critical to session, handle cleanup
      const connectionState = this.ablyService.getConnectionState();
      if (clientId !== connectionState.clientId) {
        // Remote client disconnected - continue session but log
        this.enhancedLogger.info(`Remote client ${clientId} disconnected, continuing session`);
      }
      
    } catch (error) {
      this.enhancedLogger.error('Failed to handle stale client disconnection', 'cleanup', error);
    }
  }

  public async createHostSession(sessionCode: string, channelName: string): Promise<void> {
    try {
      if (this.neonService) {
        await this.neonService.sql`
          INSERT INTO bridgit_sessions (
            session_id, session_code, channel_name, session_type, host_client_id,
            source_language, target_language, status, created_at, expires_at
          ) VALUES (
            ${this.generateSessionId()}, ${sessionCode}, ${channelName}, 'live_host',
            ${this.ablyService.getConnectionState().clientId},
            ${this.getContext().fromLanguage}, ${this.getContext().toLanguage},
            'active', NOW(), NOW() + INTERVAL '30 minutes'
          )
        `;
      }
      
      await this.ablyService.createHostSession(sessionCode, channelName);
      this.isHostingSession = true;
      this.startSessionMonitoring();
      
      this.enhancedLogger.info(`Created host session: ${sessionCode}`);
    } catch (error) {
      this.enhancedLogger.error('Failed to create host session', 'session', error);
      throw error;
    }
  }

  public async joinGuestSession(sessionCode: string, channelName: string): Promise<void> {
    try {
      if (this.neonService) {
        const session = await this.neonService.sql`
          SELECT session_id, expires_at, status 
          FROM bridgit_sessions 
          WHERE session_code = ${sessionCode} 
          AND status = 'active' 
          AND expires_at > NOW()
        `;
        
        const sessionRows = session as any[];
        if (sessionRows.length === 0) {
          throw new Error('Session not found or expired');
        }
        
        await this.neonService.sql`
          UPDATE bridgit_sessions 
          SET guest_client_id = ${this.ablyService.getConnectionState().clientId},
              guest_joined_at = NOW()
          WHERE session_code = ${sessionCode}
        `;
      }
      
      await this.ablyService.joinGuestSession(sessionCode, channelName);
      this.isGuestInSession = true;
      this.startSessionMonitoring();
      
      this.enhancedLogger.info(`Joined guest session: ${sessionCode}`);
    } catch (error) {
      this.enhancedLogger.error('Failed to join guest session', 'session', error);
      throw error;
    }
  }

  private startSessionMonitoring(): void {
    if (this.sessionMonitor) {
      clearInterval(this.sessionMonitor);
    }

    this.sessionMonitor = setInterval(async () => {
      await this.monitorSessionHealth();
    }, 30000); // Check every 30 seconds
  }

  private async monitorSessionHealth(): Promise<void> {
    try {
      const connectionHealth = this.ablyService.getConnectionHealth();
      const stateInfo = this.getStateMonitoringInfo();
      
      // Log session health
      this.enhancedLogger.debug('Session health check', 'monitoring', {
        activeClients: connectionHealth.activeClients,
        staleClients: connectionHealth.staleClients,
        currentState: stateInfo.currentState,
        timeInState: stateInfo.timeInCurrentState,
        isStuck: stateInfo.isStuck
      });
      
      // Handle critical issues
      if (connectionHealth.staleClients > 0) {
        this.enhancedLogger.warn(`${connectionHealth.staleClients} stale connections detected`);
      }
      
      if (stateInfo.isStuck) {
        this.enhancedLogger.warn('FSM appears to be stuck, monitoring for auto-recovery');
      }
      
    } catch (error) {
      this.enhancedLogger.error('Session health monitoring failed', 'monitoring', error);
    }
  }

  public async endLiveSession(): Promise<void> {
    if (this.sessionMonitor) {
      clearInterval(this.sessionMonitor);
      this.sessionMonitor = null;
    }
    try {
      const sessionCode = this.ablyService.getCurrentSessionId();
      
      if (this.neonService && sessionCode) {
        await this.neonService.sql`
          UPDATE bridgit_sessions 
          SET status = 'closed', ended_at = NOW()
          WHERE session_code = ${sessionCode}
        `;
      }
      
      await this.ablyService.endLiveSession();
      this.isHostingSession = false;
      this.isGuestInSession = false;
      
      this.enhancedLogger.info(`Ended live session: ${sessionCode}`);
    } catch (error) {
      this.enhancedLogger.error('Failed to end live session', 'session', error);
      throw error;
    }
  }
  
  private updateApiStatus(service: string, isOnline: boolean, error?: string): void {
    const currentStatus = this.apiStatuses.get(service);
    this.apiStatuses.set(service, {
      service,
      available: isOnline,
      lastChecked: Date.now(),
      errorCount: isOnline ? 0 : (currentStatus?.errorCount || 0) + 1,
      lastError: error
    });
    
    this.enhancedLogger.info(`API status updated: ${service} - ${isOnline ? 'online' : 'offline'}`, 'api-status', {
      service,
      available: isOnline,
      error
    });
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add these missing methods:
  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  public getApiStatuses(): Map<string, ApiStatus> {
    return new Map(this.apiStatuses);
  }

  public async startSession(sessionId: string): Promise<void> {
    try {
      this.enhancedLogger.info(`Starting session: ${sessionId}`);
      // Basic session initialization
    } catch (error) {
      this.enhancedLogger.error('Failed to start session', 'session', error);
      throw error;
    }
  }

  public updateLanguages(fromLanguage: string, toLanguage: string): void {
    this.context = {
      ...this.context,
      fromLanguage,
      toLanguage
    };
  }

  public updateVoice(voiceId: string): void {
    this.context = {
      ...this.context,
      voiceId
    };
  }

  public async startRecording(): Promise<void> {
    // Delegate to parent class if it exists, or implement basic functionality
    if (super.startRecording) {
      return super.startRecording();
    }
    throw new Error('Recording not implemented in production orchestrator');
  }

  public async stopRecording(): Promise<void> {
    // Delegate to parent class if it exists, or implement basic functionality
    if (super.stopRecording) {
      return super.stopRecording();
    }
    throw new Error('Recording not implemented in production orchestrator');
  }

  public clearError(): void {
    if (this.state === TranslationState.ERROR) {
      this.transition(TranslationState.IDLE, {
        error: undefined
      });
    }
  }
}

export default ProductionOrchestrator;