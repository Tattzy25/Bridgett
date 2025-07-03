// Finite State Machine Orchestrator for Voice Bridge Translation
// This orchestrator manages the state transitions and coordinates the services

import AudioRecorder from './audioRecorder';
import GroqService from './groqService';
import DeepLService from './deepLService';
import ElevenLabsService from './elevenLabsService';
import EventService, { EventType } from './eventService';
import LoggingService, { LogLevel } from './loggingService';

// Define the possible states for our FSM
export enum TranslationState {
  IDLE = 'idle',
  RECORDING = 'recording',
  TRANSCRIBING = 'transcribing',
  TRANSLATING = 'translating',
  SPEAKING = 'speaking',
  ERROR = 'error'
}

// Define the events that can trigger state transitions
export enum TranslationEvent {
  START_RECORDING = 'startRecording',
  STOP_RECORDING = 'stopRecording',
  TRANSCRIPTION_COMPLETE = 'transcriptionComplete',
  TRANSLATION_COMPLETE = 'translationComplete',
  SPEECH_COMPLETE = 'speechComplete',
  ERROR_OCCURRED = 'errorOccurred',
  RESET = 'reset'
}

// Define the error types
export interface TranslationError {
  message: string;
  service: 'elevenlabs' | 'groq' | 'deepl' | 'recorder' | 'general' | 'gemini';
  timestamp: Date;
}

// Define the context that will be passed between states
export interface TranslationContext {
  speaker: string;
  audioBlob?: Blob;
  originalText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  fromLanguage: string;
  toLanguage: string;
  voiceId?: string;
  error?: TranslationError;
}

// Define the FSM Orchestrator class
export class FSMOrchestrator {
  protected state: TranslationState = TranslationState.IDLE;
  protected context: TranslationContext;
  protected audioRecorder: AudioRecorder;
  protected groqService: GroqService;
  protected deepLService: DeepLService;
  protected elevenLabsService: ElevenLabsService;
  private stateChangeListeners: ((state: TranslationState, context: TranslationContext) => void)[] = [];
  protected eventService: EventService;
  protected logger: LoggingService;
  private stateMonitor: NodeJS.Timeout | null = null;
  private stateHistory: Array<{ state: TranslationState; timestamp: number; context: Partial<TranslationContext> }> = [];
  private maxStateHistorySize = 50;
  private stuckStateThreshold = 60000; // 60 seconds

  // Add state monitoring
  private startStateMonitoring(): void {
    if (this.stateMonitor) {
      clearInterval(this.stateMonitor);
    }

    this.stateMonitor = setInterval(() => {
      this.checkForStuckStates();
      this.cleanupStateHistory();
    }, 15000); // Check every 15 seconds

    this.logger.info('FSM state monitoring started');
  }

  private checkForStuckStates(): void {
    const now = Date.now();
    const currentStateEntry = this.stateHistory[this.stateHistory.length - 1];
    
    if (!currentStateEntry) return;

    const timeInCurrentState = now - currentStateEntry.timestamp;
    
    // Check if stuck in non-idle states
    if (this.state !== TranslationState.IDLE && 
        this.state !== TranslationState.ERROR && 
        timeInCurrentState > this.stuckStateThreshold) {
      
      this.logger.warn(`FSM stuck in ${this.state} for ${timeInCurrentState}ms`, 'monitoring');
      
      // Auto-recovery for stuck states
      this.handleStuckState();
    }
  }

  private handleStuckState(): void {
    this.logger.info(`Attempting auto-recovery from stuck state: ${this.state}`);
    
    try {
      // Force cleanup based on current state
      switch (this.state) {
        case TranslationState.RECORDING:
          this.audioRecorder.dispose();
          break;
        case TranslationState.TRANSCRIBING:
        case TranslationState.TRANSLATING:
        case TranslationState.SPEAKING:
          // These should timeout naturally, but force reset
          break;
      }
      
      // Reset to idle with error context
      this.transition(TranslationState.ERROR, {
        error: {
          message: `Auto-recovery from stuck state: ${this.state}`,
          service: 'general',
          timestamp: new Date()
        }
      });
      
      // Publish stuck state event
      this.eventService.publish(EventType.ERROR_OCCURRED, {
        error: 'stuck_state_recovery',
        previousState: this.state,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.logger.error('Failed to recover from stuck state', 'recovery', error);
    }
  }

  // Enhanced transition with history tracking
  protected transition(newState: TranslationState, contextUpdates: Partial<TranslationContext> = {}): void {
    // Record state history
    this.stateHistory.push({
      state: this.state,
      timestamp: Date.now(),
      context: {
        speaker: this.context.speaker,
        fromLanguage: this.context.fromLanguage,
        toLanguage: this.context.toLanguage,
        error: this.context.error
      }
    });

    this.state = newState;
    this.context = { ...this.context, ...contextUpdates };
    this.notifyStateChange();
  }

  private cleanupStateHistory(): void {
    if (this.stateHistory.length > this.maxStateHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxStateHistorySize);
    }
  }

  // Get state monitoring info
  public getStateMonitoringInfo(): {
    currentState: TranslationState;
    timeInCurrentState: number;
    stateHistory: typeof this.stateHistory;
    isStuck: boolean;
  } {
    const now = Date.now();
    const lastEntry = this.stateHistory[this.stateHistory.length - 1];
    const timeInCurrentState = lastEntry ? now - lastEntry.timestamp : 0;
    
    return {
      currentState: this.state,
      timeInCurrentState,
      stateHistory: [...this.stateHistory],
      isStuck: timeInCurrentState > this.stuckStateThreshold && 
               this.state !== TranslationState.IDLE && 
               this.state !== TranslationState.ERROR
    };
  }

  // Start monitoring in constructor
  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    this.context = {
      speaker: '',
      fromLanguage,
      toLanguage,
      voiceId
    };

    // Initialize services
    this.audioRecorder = new AudioRecorder();
    this.groqService = new GroqService();
    this.deepLService = new DeepLService();
    this.elevenLabsService = new ElevenLabsService();
    
    // Initialize event service and logger
    this.eventService = EventService.getInstance();
    this.logger = LoggingService.getInstance();
    this.logger.configure({
      minLevel: LogLevel.DEBUG,
      contextPrefix: 'FSMOrchestrator'
    });
    this.startStateMonitoring();
  }

  // Cleanup monitoring
  public dispose(): void {
    if (this.stateMonitor) {
      clearInterval(this.stateMonitor);
      this.stateMonitor = null;
    }
    this.audioRecorder.dispose();
    this.stateChangeListeners = [];
  }

  // Add a listener for state changes
  public addStateChangeListener(listener: (state: TranslationState, context: TranslationContext) => void): void {
    this.stateChangeListeners.push(listener);
  }

  // Remove a listener
  public removeStateChangeListener(listener: (state: TranslationState, context: TranslationContext) => void): void {
    this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
  }

  // Notify all listeners of a state change
  private notifyStateChange(): void {
    // Notify direct listeners
    this.stateChangeListeners.forEach((listener: (state: TranslationState, context: TranslationContext) => void) => {
      listener(this.state, this.context);
    });
    
    // Publish event through event service
    this.eventService.publish(EventType.STATE_CHANGED, {
      state: this.state,
      context: this.context,
      timestamp: new Date()
    });
    
    // Log state change
    this.logger.info(`State changed to: ${this.state}`, 'state', {
      state: this.state,
      context: this.context
    });
  }
  
  // Add this method after the getStateMonitoringInfo method
  public getContext(): TranslationContext {
    return { ...this.context };
  }
}

export default FSMOrchestrator;