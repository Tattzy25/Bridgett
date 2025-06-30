// Logging Service for comprehensive application logging
// This service provides structured logging with different log levels

// Define log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Define log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

// Define logger configuration
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableHistory: boolean;
  maxHistorySize: number;
  contextPrefix?: string;
}

// Logging Service class
class LoggingService {
  private static instance: LoggingService;
  private config: LoggerConfig;
  private logHistory: LogEntry[] = [];
  
  // Private constructor for singleton pattern
  private constructor() {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableHistory: true,
      maxHistorySize: 1000
    };
  }
  
  // Get singleton instance
  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }
  
  // Configure the logger
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  // Log a debug message
  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }
  
  // Log an info message
  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }
  
  // Log a warning message
  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }
  
  // Log an error message
  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }
  
  // Get log history
  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }
  
  // Clear log history
  public clearHistory(): void {
    this.logHistory = [];
  }
  
  // Export logs to JSON
  public exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }
  
  // Internal log method
  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    // Check if we should log this level
    if (level < this.config.minLevel) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const fullContext = this.config.contextPrefix 
      ? `${this.config.contextPrefix}${context ? `:${context}` : ''}` 
      : context;
    
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context: fullContext,
      data
    };
    
    // Add to history if enabled
    if (this.config.enableHistory) {
      this.addToHistory(entry);
    }
    
    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }
  
  // Add log entry to history
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Trim history if it exceeds max size
    if (this.logHistory.length > this.config.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.config.maxHistorySize);
    }
  }
  
  // Log to console with appropriate styling
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, data } = entry;
    const contextStr = context ? `[${context}]` : '';
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`🔍 DEBUG ${contextStr}:`, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ INFO ${contextStr}:`, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ WARNING ${contextStr}:`, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`❌ ERROR ${contextStr}:`, message, data || '');
        break;
    }
  }
}

export default LoggingService;