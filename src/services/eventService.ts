// Event Service for managing application events
// This service provides a centralized event bus for the application

// Define event types for strong typing
export enum EventType {
  // FSM State Events
  STATE_CHANGED = 'state_changed',
  RECORDING_STARTED = 'recording_started',
  RECORDING_STOPPED = 'recording_stopped',
  TRANSCRIPTION_COMPLETED = 'transcription_completed',
  TRANSLATION_COMPLETED = 'translation_completed',
  SPEECH_COMPLETED = 'speech_completed',
  
  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  ERROR_CLEARED = 'error_cleared',
  
  // Service Status Events
  SERVICE_STATUS_CHANGED = 'service_status_changed',
  
  // Session Events
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  TRANSLATION_SAVED = 'translation_saved',
  
  // UI Events
  LANGUAGE_CHANGED = 'language_changed',
  VOICE_CHANGED = 'voice_changed',
  SETTINGS_UPDATED = 'settings_updated'
}

// Define event payload types
export interface EventPayload {
  type: EventType;
  data?: any;
  timestamp: number;
  source?: string;
}

// Define event handler type
export type EventHandler = (payload: EventPayload) => void;

// Event Service class
class EventService {
  private static instance: EventService;
  private eventHandlers: Map<EventType, Set<EventHandler>> = new Map();
  private eventHistory: EventPayload[] = [];
  private maxHistorySize: number = 100;
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  // Get singleton instance
  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }
  
  // Subscribe to an event
  public subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, handler);
    };
  }
  
  // Unsubscribe from an event
  public unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  // Publish an event
  public publish(eventType: EventType, data?: any, source?: string): void {
    const payload: EventPayload = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source
    };
    
    // Add to history
    this.addToHistory(payload);
    
    // Notify subscribers
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }
  
  // Get event history
  public getHistory(): EventPayload[] {
    return [...this.eventHistory];
  }
  
  // Clear event history
  public clearHistory(): void {
    this.eventHistory = [];
  }
  
  // Add event to history
  private addToHistory(payload: EventPayload): void {
    this.eventHistory.push(payload);
    
    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

export default EventService;