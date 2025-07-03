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
  private connectionMonitor: NodeJS.Timeout | null = null;
  private lastHeartbeat: Map<string, number> = new Map();
  private disconnectedClients: Set<string> = new Set();
  private readonly staleConnectionThreshold: number = 30000; // 30 seconds

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
      if (this.channel) {
        await this.channel.detach();
      }

      this.channel = this.client.channels.get(`session:${sessionId}`);
      this.currentSessionId = sessionId;
      
      await this.channel.attach();
      this.setupChannelListeners();
      
      await this.channel.presence.enter({
        clientId: this.connectionState.clientId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });

      this.startConnectionMonitoring();

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

  public async createHostSession(sessionCode: string, channelName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Ably client not initialized');
    }

    try {
      this.channel = this.client.channels.get(channelName);
      this.currentSessionId = sessionCode;
      
      await this.channel.attach();
      this.setupChannelListeners();
      
      await this.channel.setOptions({
        params: {
          rewind: '1',
          occupancy: 'metrics'
        }
      });
      
      await this.channel.presence.enter({
        clientId: this.connectionState.clientId,
        role: 'host',
        timestamp: Date.now(),
        sessionCode
      });

      this.startConnectionMonitoring();
      this.logger.info(`Created and joined host session: ${sessionCode}`);
      
      this.eventService.publish(EventType.SESSION_STARTED, {
        sessionId: sessionCode,
        role: 'host',
        channelName,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error(`Failed to create host session ${sessionCode}`, 'session', error);
      throw error;
    }
  }

  public async joinGuestSession(sessionCode: string, channelName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Ably client not initialized');
    }

    try {
      if (this.channel) {
        await this.channel.detach();
      }

      this.channel = this.client.channels.get(channelName);
      this.currentSessionId = sessionCode;
      
      await this.channel.attach();
      
      const presence = await this.channel.presence.get();
      const hasHost = presence.some(member => member.data?.role === 'host');
      
      if (!hasHost) {
        throw new Error('Session not found or expired');
      }
      
      this.setupChannelListeners();
      
      await this.channel.presence.enter({
        clientId: this.connectionState.clientId,
        role: 'guest',
        timestamp: Date.now(),
        sessionCode
      });

      this.logger.info(`Joined guest session: ${sessionCode}`);
      
      this.eventService.publish(EventType.SESSION_STARTED, {
        sessionId: sessionCode,
        role: 'guest',
        channelName,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error(`Failed to join guest session ${sessionCode}`, 'session', error);
      throw error;
    }
  }

  public async leaveSession(): Promise<void> {
    if (this.connectionMonitor) {
      clearInterval(this.connectionMonitor);
      this.connectionMonitor = null;
    }
    
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
      
      // Clear monitoring data
      this.lastHeartbeat.clear();
      this.disconnectedClients.clear();
      
      this.logger.info(`Left session: ${sessionId}`);
      
      this.eventService.publish(EventType.SESSION_ENDED, {
        sessionId,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error('Failed to leave session', 'session', error);
    }
  }

  public async endLiveSession(): Promise<void> {
    if (!this.channel || !this.currentSessionId) {
      this.logger.warn('No active session to end');
      return;
    }

    try {
      await this.channel.publish('session:ending', {
        sessionId: this.currentSessionId,
        timestamp: Date.now(),
        reason: 'host_ended'
      });
      
      await this.channel.presence.leave();
      await this.channel.detach();
      
      const sessionId = this.currentSessionId;
      this.channel = null;
      this.currentSessionId = null;
      
      this.logger.info(`Ended live session: ${sessionId}`);
      
      this.eventService.publish(EventType.SESSION_ENDED, {
        sessionId,
        clientId: this.connectionState.clientId
      });
    } catch (error) {
      this.logger.error('Failed to end live session', 'session', error);
      throw error;
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

    this.channel.publish('event', payload).then(() => {
      this.logger.debug(`Published event: ${eventType}`);
    }).catch((err) => {
      this.logger.error(`Failed to publish event ${eventType}`, 'publish', err);
    });
  }

  public async publishAudio(audioBuffer: ArrayBuffer, text: string): Promise<void> {
    if (!this.channel || !this.connectionState.connected) {
      this.logger.debug('Cannot publish audio: Channel not ready');
      return;
    }

    try {
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      
      await this.channel.publish('audio:synthesized', {
        audio: audioBase64,
        text,
        timestamp: Date.now(),
        clientId: this.connectionState.clientId
      });
      
      this.logger.debug('Published synthesized audio to channel');
    } catch (error) {
      this.logger.error('Failed to publish audio', 'publish', error);
      throw error;
    }
  }

  public async isChannelActive(): Promise<boolean> {
    if (!this.channel) return false;
    
    try {
      const presence = await this.channel.presence.get();
      return presence.length > 1;
    } catch {
      return false;
    }
  }

  public getConnectionState(): AblyConnectionState {
    return { ...this.connectionState };
  }

  public isConnected(): boolean {
    return this.connectionState.connected;
  }

  public getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  public getConnectionHealth(): {
    activeClients: number;
    staleClients: number;
    disconnectedClients: string[];
    lastHeartbeat: number;
  } {
    return {
      activeClients: this.lastHeartbeat.size,
      staleClients: this.disconnectedClients.size,
      disconnectedClients: Array.from(this.disconnectedClients),
      lastHeartbeat: this.lastHeartbeat.get(this.connectionState.clientId) || 0
    };
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
      this.connectionState.lastError = error?.reason?.message || 'Connection failed';
      this.logger.error('Ably connection failed', 'connection', {
        error: error?.reason?.message || 'Unknown error'
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
      this.eventService.subscribe(eventType, (data: any) => {
        this.publishEvent(eventType, data);
      });
    });
  }

  private startConnectionMonitoring(): void {
    if (this.connectionMonitor) {
      clearInterval(this.connectionMonitor);
    }

    this.connectionMonitor = setInterval(async () => {
      await this.checkStaleConnections();
    }, 10000); // Check every 10 seconds

    this.logger.info('Connection monitoring started');
  }

  private async checkStaleConnections(): Promise<void> {
    if (!this.channel || !this.currentSessionId) return;

    try {
      const presence = await this.channel.presence.get();
      const now = Date.now();
      const staleClients: string[] = [];

      // Check for stale connections
      presence.forEach(member => {
        const lastSeen = this.lastHeartbeat.get(member.clientId) || member.timestamp || 0;
        const timeSinceLastSeen = now - lastSeen;

        if (timeSinceLastSeen > this.staleConnectionThreshold) {
          staleClients.push(member.clientId);
          this.disconnectedClients.add(member.clientId);
        }
      });

      // Clean up stale connections
      if (staleClients.length > 0) {
        await this.cleanupStaleConnections(staleClients);
      }

      // Publish heartbeat
      await this.publishHeartbeat();
    } catch (error) {
      this.logger.error('Error checking stale connections', 'monitoring', error);
    }
  }

  private async cleanupStaleConnections(staleClients: string[]): Promise<void> {
    this.logger.warn(`Detected ${staleClients.length} stale connections`, 'cleanup', { staleClients });

    for (const clientId of staleClients) {
      try {
        this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
          service: 'ably',
          status: 'client_disconnected_stale',
          clientId,
          reason: 'stale_connection'
        });

        this.logger.info(`Detected stale connection: ${clientId}`);
      } catch (error) {
        this.logger.error(`Failed to process stale connection ${clientId}`, 'cleanup', error);
      }
    }
  }

  private async publishHeartbeat(): Promise<void> {
    if (!this.channel || !this.connectionState.connected) return;

    try {
      await this.channel.publish('heartbeat', {
        clientId: this.connectionState.clientId,
        timestamp: Date.now(),
        state: 'alive'
      });

      this.lastHeartbeat.set(this.connectionState.clientId, Date.now());
    } catch (error) {
      this.logger.debug('Failed to publish heartbeat', 'heartbeat', error);
    }
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

    this.channel.subscribe('heartbeat', (message) => {
      const data = message.data;
      if (data.clientId !== this.connectionState.clientId) {
        this.lastHeartbeat.set(data.clientId, data.timestamp);
        this.disconnectedClients.delete(data.clientId);
      }
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
      this.lastHeartbeat.delete(member.clientId);
      this.disconnectedClients.add(member.clientId);
      
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'ably',
        status: 'client_left',
        clientId: member.clientId,
        reason: 'normal_disconnect'
      });
    });
  }
}

export default AblyService;