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
  service: 'elevenlabs' | 'groq' | 'deepl' | 'recorder' | 'general';
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
  private state: TranslationState = TranslationState.IDLE;
  private context: TranslationContext;
  private audioRecorder: AudioRecorder;
  private groqService: GroqService;
  private deepLService: DeepLService;
  private elevenLabsService: ElevenLabsService;
  private stateChangeListeners: ((state: TranslationState, context: TranslationContext) => void)[] = [];
  private eventService: EventService;
  private logger: LoggingService;

  constructor(fromLanguage: string, toLanguage: string, voiceId?: string) {
    this.context = {
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
    for (const listener of this.stateChangeListeners) {
      listener(this.state, this.context);
    }
    
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

  // Transition to a new state
  private transition(newState: TranslationState, contextUpdates: Partial<TranslationContext> = {}): void {
    this.state = newState;
    this.context = { ...this.context, ...contextUpdates };
    this.notifyStateChange();
  }

  // Handle errors
  private handleError(error: Error, service: TranslationError['service']): void {
    const translationError: TranslationError = {
      message: error.message,
      service,
      timestamp: new Date()
    };
    
    // Log error
    this.logger.error(`Error in ${service}: ${error.message}`, service, error);
    
    // Publish error event
    this.eventService.publish(EventType.ERROR_OCCURRED, {
      error: translationError,
      service
    });
    
    this.transition(TranslationState.ERROR, { error: translationError });
  }

  // Get the current state
  public getState(): TranslationState {
    return this.state;
  }

  // Get the current context
  public getContext(): TranslationContext {
    return this.context;
  }

  // Start recording
  public async startRecording(): Promise<void> {
    if (this.state !== TranslationState.IDLE && this.state !== TranslationState.ERROR) {
      const errorMsg = `Cannot start recording in ${this.state} state`;
      this.logger.warn(errorMsg, 'state');
      throw new Error(errorMsg);
    }

    try {
      this.logger.info('Starting recording', 'recorder');
      this.transition(TranslationState.RECORDING);
      await this.audioRecorder.startRecording();
      
      // Publish recording started event
      this.eventService.publish(EventType.RECORDING_STARTED, {
        timestamp: new Date()
      });
    } catch (error) {
      this.handleError(error as Error, 'recorder');
    }
  }

  // Stop recording and start transcription
  public async stopRecording(): Promise<void> {
    if (this.state !== TranslationState.RECORDING) {
      const errorMsg = `Cannot stop recording in ${this.state} state`;
      this.logger.warn(errorMsg, 'state');
      throw new Error(errorMsg);
    }
    
    this.logger.info('Stopping recording', 'recorder');

    try {
      const audioBlob = await this.audioRecorder.stopRecording();
      
      // Publish recording stopped event
      this.eventService.publish(EventType.RECORDING_STOPPED, {
        audioBlob,
        duration: audioBlob.size, // Approximate size as duration indicator
        timestamp: new Date()
      });
      
      this.transition(TranslationState.TRANSCRIBING, { audioBlob });
      this.logger.info('Starting transcription', 'transcription');
      
      // Start transcription
      const originalText = await this.groqService.transcribeAudio(audioBlob, this.context.fromLanguage);
      
      // Publish transcription completed event
      this.eventService.publish(EventType.TRANSCRIPTION_COMPLETED, {
        originalText,
        language: this.context.fromLanguage,
        timestamp: new Date()
      });
      
      this.logger.info('Transcription completed', 'transcription', { originalText });
      this.transition(TranslationState.TRANSLATING, { originalText });
      this.logger.info('Starting translation', 'translation');
      
      // Start translation
      let translatedText: string;
      let detectedLanguage: string | undefined;
      
      try {
        // Try using DeepL first
        const result = await this.deepLService.translateText(
          originalText,
          this.context.toLanguage,
          this.context.fromLanguage
        );
        translatedText = result.translatedText;
        detectedLanguage = result.detectedSourceLanguage;
      } catch (deepLError) {
        console.warn('DeepL translation failed, falling back to Groq:', deepLError);
        // Fallback to Groq for translation
        translatedText = await this.groqService.translateWithLLM(
          originalText,
          this.context.fromLanguage,
          this.context.toLanguage
        );
      }
      
      // Publish translation completed event
      this.eventService.publish(EventType.TRANSLATION_COMPLETED, {
        originalText,
        translatedText,
        fromLanguage: this.context.fromLanguage,
        toLanguage: this.context.toLanguage,
        detectedLanguage,
        timestamp: new Date()
      });
      
      this.logger.info('Translation completed', 'translation', { 
        translatedText, 
        detectedLanguage 
      });
      
      this.transition(TranslationState.SPEAKING, { translatedText, detectedLanguage });
      this.logger.info('Starting speech synthesis', 'speech');
      
      // Start speech synthesis
      const audioBuffer = await this.elevenLabsService.synthesizeSpeech(
        translatedText,
        this.context.voiceId
      );
      
      await this.elevenLabsService.playAudio(audioBuffer);
      
      // Publish speech completed event
      this.eventService.publish(EventType.SPEECH_COMPLETED, {
        translatedText,
        language: this.context.toLanguage,
        voiceId: this.context.voiceId,
        timestamp: new Date()
      });
      
      this.logger.info('Speech synthesis completed', 'speech');
      
      // Return to idle state
      this.transition(TranslationState.IDLE);
    } catch (error) {
      let service: TranslationError['service'] = 'general';
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('recording') || errorMessage.includes('audio')) {
          service = 'recorder';
        } else if (errorMessage.includes('transcribe') || errorMessage.includes('groq')) {
          service = 'groq';
        } else if (errorMessage.includes('translate') || errorMessage.includes('deepl')) {
          service = 'deepl';
        } else if (errorMessage.includes('speech') || errorMessage.includes('elevenlabs')) {
          service = 'elevenlabs';
        }
      }
      
      this.handleError(error as Error, service);
    }
  }

  // Reset the FSM to idle state
  public reset(): void {
    this.logger.info('Resetting FSM orchestrator', 'system');
    
    if (this.state === TranslationState.RECORDING) {
      this.audioRecorder.dispose();
    }
    
    this.transition(TranslationState.IDLE, {
      audioBlob: undefined,
      originalText: undefined,
      translatedText: undefined,
      detectedLanguage: undefined,
      error: undefined
    });
  }

  // Clear any errors and return to idle state
  public clearError(): void {
    if (this.state === TranslationState.ERROR) {
      this.transition(TranslationState.IDLE, { error: undefined });
    }
  }

  // Update language settings
  public updateLanguages(fromLanguage: string, toLanguage: string): void {
    this.context.fromLanguage = fromLanguage;
    this.context.toLanguage = toLanguage;
  }

  // Update voice ID
  public updateVoice(voiceId: string): void {
    this.context.voiceId = voiceId;
  }

  // Dispose all resources
  public dispose(): void {
    this.logger.info('Disposing FSM orchestrator resources', 'system');
    this.audioRecorder.dispose();
    this.stateChangeListeners = [];
  }
}

export default FSMOrchestrator;