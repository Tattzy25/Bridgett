import * as Ably from 'ably';
import { getApiKey } from '../config/apiKeys';
import EventService, { EventType, EventPayload } from './eventService';
import LoggingService, { LogLevel } from './loggingService';
import { TranslationState, TranslationContext } from './fsmOrchestrator';

interface AblyStatePayload {
  state: TranslationState;
  context: TranslationContext;
  timestamp: number;
  sessionId?: string;
  clientId: string;
}

interface AblyConnectionState {
  connected: boolean;
  clientId: string;
  connectionState: string;
  lastError?: string;
}

class AblyService {
  private static instance: AblyService;
  private client: Ably.Realtime | null = null;
  private channel: Ably.RealtimeChannel | null = null;
  private eventService: EventService;
  private logger: LoggingService;
  private connectionState: AblyConnectionState;
  private currentSessionId: string | null = null;
  // Remove these unused variables:
  // private reconnectAttempts: number = 0;
  // private maxReconnectAttempts: number = 5;

  private constructor() {
    this.eventService = EventService.getInstance();
    this.logger = LoggingService.getInstance();
    this.logger.configure({
      contextPrefix: 'AblyService',
      minLevel: LogLevel.DEBUG
    });
    
    this.connectionState = {
      connected: false,
      clientId: '',
      connectionState: 'disconnected'
    };
  }

  public static getInstance(): AblyService {
    if (!AblyService.instance) {
      AblyService.instance = new AblyService();
    }
    return AblyService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const apiKey = getApiKey('ABLY_API_KEY');
      
      if (!apiKey || 
          apiKey === 'your_ably_api_key_here' || 
          apiKey.includes('your_') ||
          apiKey.includes('_here') ||
          apiKey.trim() === '') {
        throw new Error('Ably API key is required and must be properly configured. Please check your API keys configuration.');
      }

      this.client = new Ably.Realtime({
        key: apiKey,
        clientId: this.connectionState.clientId,
        autoConnect: true,
        // Remove the 'recover: true' line - it should be a string or callback
        disconnectedRetryTimeout: 15000,
        suspendedRetryTimeout: 30000
      });

      this.connectionState.clientId = this.client.auth.clientId || '';
      this.setupConnectionListeners();
      this.subscribeToAppEvents();
      
      this.logger.info(`Ably service initialized with client ID: ${this.connectionState.clientId}`);
    } catch (error) {
      this.logger.error('Failed to initialize Ably service', 'initialization', error);
      throw error;
    }
  }

  public async joinSession(sessionId: string): Promise<void> {
    if (!this.client) {
      this.logger.error('Cannot join session: Ably client not initialized');
      return;
    }

    try {
      // Leave current channel if exists
      if (this.channel) {
        await this.channel.detach();
      }

      // Join new session channel
      this.channel = this.client.channels.get(`session:${sessionId}`);
      this.currentSessionId = sessionId;
      
      await this.channel.attach();
      this.setupChannelListeners();
      
      // Announce presence
      await this.channel.presence.enter({
        clientId: this.connectionState.clientId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });

      this.logger.info(`Joined session: ${sessionId}`);
      
      this.eventService.publish(EventType.SESSION_STARTED, {
        sessionId,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error(`Failed to join session ${sessionId}`, 'session', error);
      throw error;
    }
  }

  public async leaveSession(): Promise<void> {
    if (!this.channel || !this.currentSessionId) {
      this.logger.warn('No active session to leave');
      return;
    }

    try {
      await this.channel.presence.leave();
      await this.channel.detach();
      
      const sessionId = this.currentSessionId;
      this.channel = null;
      this.currentSessionId = null;
      
      this.logger.info(`Left session: ${sessionId}`);
      
      this.eventService.publish(EventType.SESSION_ENDED, {
        sessionId,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error('Failed to leave session', 'session', error);
    }
  }

  public publishState(state: TranslationState, context: TranslationContext): void {
    if (!this.channel || !this.connectionState.connected) {
      this.logger.debug('Cannot publish state: Channel not ready');
      return;
    }

    const payload: AblyStatePayload = {
      state,
      context,
      timestamp: Date.now(),
      sessionId: this.currentSessionId || undefined,
      clientId: this.connectionState.clientId
    };

    // Fix: Use promise-based approach instead of callback
    this.channel.publish('state:changed', payload).then(() => {
      this.logger.debug(`Published state: ${state}`);
    }).catch((err) => {
      this.logger.error('Failed to publish state', 'publish', err);
    });
  }

  public publishEvent(eventType: EventType, data?: any): void {
    if (!this.channel || !this.connectionState.connected) {
      this.logger.debug(`Cannot publish event ${eventType}: Channel not ready`);
      return;
    }

    const payload: EventPayload = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: 'client'
    };

    // Fix: Use promise-based approach instead of callback
    this.channel.publish('event', payload).then(() => {
      this.logger.debug(`Published event: ${eventType}`);
    }).catch((err) => {
      this.logger.error(`Failed to publish event ${eventType}`, 'publish', err);
    });
  }

  public getConnectionState(): AblyConnectionState {
    return { ...this.connectionState };
  }

  public isConnected(): boolean {
    return this.connectionState.connected;
  }

  public async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.leaveSession();
      this.client.close();
      this.client = null;
      this.connectionState.connected = false;
      this.connectionState.connectionState = 'disconnected';
      
      this.logger.info('Ably service disconnected');
    } catch (error) {
      this.logger.error('Error during disconnect', 'disconnect', error);
    }
  }

  private setupConnectionListeners(): void {
    if (!this.client) return;

    this.client.connection.on('connected', () => {
      this.connectionState.connected = true;
      this.connectionState.connectionState = 'connected';
      this.connectionState.clientId = this.client!.auth.clientId || '';
      this.logger.info('Connected to Ably');
    });

    this.client.connection.on('disconnected', () => {
      this.connectionState.connected = false;
      this.connectionState.connectionState = 'disconnected';
      this.logger.warn('Disconnected from Ably');
    });

    this.client.connection.on('failed', (error) => {
      this.connectionState.connected = false;
      this.connectionState.connectionState = 'failed';
      // Fix: error handling
      this.connectionState.lastError = error?.reason?.message || 'Connection failed';
      this.logger.error('Ably connection failed', 'connection', {
        error: error?.reason?.message || 'Unknown error'
      });
    });
  }

  private setupChannelListeners(): void {
    if (!this.channel) return;

    this.channel.subscribe('state:changed', (message) => {
      const payload = message.data as AblyStatePayload;
      if (payload.clientId !== this.connectionState.clientId) {
        this.logger.debug(`Received state from ${payload.clientId}: ${payload.state}`);
        this.eventService.publish(EventType.STATE_CHANGED, payload, 'remote');
      }
    });

    this.channel.subscribe('event', (message) => {
      const payload = message.data as EventPayload;
      this.logger.debug(`Received event: ${payload.type}`);
      this.eventService.publish(payload.type, payload.data, 'remote');
    });

    this.channel.presence.subscribe('enter', (member) => {
      this.logger.info(`Client joined: ${member.clientId}`);
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'ably',
        status: 'client_joined',
        clientId: member.clientId
      });
    });

    this.channel.presence.subscribe('leave', (member) => {
      this.logger.info(`Client left: ${member.clientId}`);
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'ably',
        status: 'client_left',
        clientId: member.clientId
      });
    });
  }

  private subscribeToAppEvents(): void {
    const eventsToForward = [
      EventType.STATE_CHANGED,
      EventType.RECORDING_STARTED,
      EventType.RECORDING_STOPPED,
      EventType.TRANSCRIPTION_COMPLETED,
      EventType.TRANSLATION_COMPLETED,
      EventType.SPEECH_COMPLETED,
      EventType.ERROR_OCCURRED
    ];

    eventsToForward.forEach(eventType => {
      // Fix: EventService subscribe signature
      this.eventService.subscribe(eventType, (data: any) => {
        this.publishEvent(eventType, data);
      });
    });
  }
}

export default AblyService;