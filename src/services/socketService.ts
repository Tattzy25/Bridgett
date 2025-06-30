// Socket.IO Client Service for Brigitte AI
// This service handles real-time communication with the server

import { io, Socket } from 'socket.io-client';
import EventService, { EventType, EventPayload } from './eventService';
import LoggingService, { LogLevel } from './loggingService';

// Socket.IO Client Service class
class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private eventService: EventService;
  private logger: LoggingService;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private serverUrl: string = '';
  private currentSessionId: string | null = null;
  
  // Private constructor for singleton pattern
  private constructor() {
    this.eventService = EventService.getInstance();
    this.logger = LoggingService.getInstance();
    this.logger.configure({
      contextPrefix: 'SocketService',
      minLevel: LogLevel.DEBUG
    });
  }
  
  // Get singleton instance
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  // Initialize the socket connection
  public initialize(serverUrl: string = 'http://localhost:3001'): void {
    if (this.socket) {
      this.logger.warn('Socket connection already initialized');
      return;
    }
    
    this.serverUrl = serverUrl;
    this.logger.info(`Initializing socket connection to ${serverUrl}`);
    
    // Create socket connection
    this.socket = io(serverUrl, {
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      autoConnect: true
    });
    
    // Set up event listeners
    this.setupSocketListeners();
    
    // Subscribe to application events to forward to server
    this.subscribeToAppEvents();
  }
  
  // Check if socket is connected
  public isConnected(): boolean {
    return this.connected;
  }
  
  // Join a session
  public joinSession(sessionId: string): void {
    if (!this.socket || !this.connected) {
      this.logger.error('Cannot join session: Socket not connected');
      return;
    }
    
    this.logger.info(`Joining session: ${sessionId}`);
    this.socket.emit('session:join', sessionId);
    this.currentSessionId = sessionId;
  }
  
  // Leave current session
  public leaveSession(): void {
    if (!this.socket || !this.connected || !this.currentSessionId) {
      this.logger.warn('Cannot leave session: No active session');
      return;
    }
    
    this.logger.info(`Leaving session: ${this.currentSessionId}`);
    this.socket.emit('session:leave', this.currentSessionId);
    this.currentSessionId = null;
  }
  
  // Emit an event to the server
  public emit(eventType: EventType, data?: any): void {
    if (!this.socket || !this.connected) {
      this.logger.error(`Cannot emit event ${eventType}: Socket not connected`);
      return;
    }
    
    const payload: EventPayload = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: 'client'
    };
    
    this.logger.debug(`Emitting event: ${eventType}`, undefined, data);
    this.socket.emit('event', payload);
  }
  
  // Disconnect from the server
  public disconnect(): void {
    if (!this.socket) {
      this.logger.warn('Cannot disconnect: Socket not initialized');
      return;
    }
    
    this.logger.info('Disconnecting from server');
    this.socket.disconnect();
    this.connected = false;
  }
  
  // Set up socket event listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.logger.info('Connected to server');
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'socket',
        status: 'connected'
      });
      
      // Rejoin session if there was one
      if (this.currentSessionId) {
        this.joinSession(this.currentSessionId);
      }
    });
    
    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.logger.warn(`Disconnected from server: ${reason}`);
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'socket',
        status: 'disconnected',
        reason
      });
    });
    
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.logger.error(`Connection error: ${error.message}`, undefined, error);
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'socket',
        status: 'error',
        error: error.message
      });
    });
    
    // Server events
    this.socket.on('event', (payload: EventPayload) => {
      this.logger.debug(`Received event: ${payload.type}`, undefined, payload);
      this.eventService.publish(payload.type, payload.data, 'server');
    });
    
    // Session events
    this.socket.on('session:joined', (data) => {
      this.logger.info(`Client ${data.clientId} joined session ${data.sessionId}`);
      this.eventService.publish(EventType.SESSION_STARTED, data);
    });
    
    this.socket.on('session:left', (data) => {
      this.logger.info(`Client ${data.clientId} left session ${data.sessionId}`);
      this.eventService.publish(EventType.SESSION_ENDED, data);
    });
    
    // Client count updates
    this.socket.on('clients:count', (count) => {
      this.logger.debug(`Connected clients: ${count}`);
      this.eventService.publish(EventType.SERVICE_STATUS_CHANGED, {
        service: 'socket',
        status: 'connected',
        connectedClients: count
      });
    });
  }
  
  // Subscribe to application events to forward to server
  private subscribeToAppEvents(): void {
    // List of events to forward to the server
    const eventsToForward = [
      EventType.STATE_CHANGED,
      EventType.RECORDING_STARTED,
      EventType.RECORDING_STOPPED,
      EventType.TRANSCRIPTION_COMPLETED,
      EventType.TRANSLATION_COMPLETED,
      EventType.SPEECH_COMPLETED,
      EventType.SESSION_STARTED,
      EventType.SESSION_ENDED,
      EventType.TRANSLATION_SAVED
    ];
    
    // Subscribe to each event
    eventsToForward.forEach(eventType => {
      this.eventService.subscribe(eventType, (payload) => {
        // Only forward events that originated from this client
        if (payload.source !== 'server') {
          this.emit(eventType, payload.data);
        }
      });
    });
  }
}

export default SocketService;