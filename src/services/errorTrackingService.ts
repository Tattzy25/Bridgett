import LoggingService from './loggingService';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  service?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: number;
  environment: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private logger: LoggingService;
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;
  private sentryDsn?: string;

  private constructor() {
    this.logger = LoggingService.getInstance();
    this.sentryDsn = process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN;
    
    // Initialize Sentry if DSN is provided
    if (this.sentryDsn && typeof window === 'undefined') {
      this.initializeSentry();
    }
  }

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  private async initializeSentry() {
    try {
      const Sentry = await import('@sentry/node');
      
      Sentry.init({
        dsn: this.sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend: (event) => {
          // Filter out non-critical errors in development
          if (process.env.NODE_ENV !== 'production' && event.level !== 'error') {
            return null;
          }
          return event;
        }
      });
      
      this.logger.info('Sentry error tracking initialized', 'error-tracking');
    } catch (error) {
      this.logger.warn('Failed to initialize Sentry', 'error-tracking', error);
    }
  }

  public captureError(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      severity
    };

    // Log locally
    this.logger.error(
      `[${severity.toUpperCase()}] ${errorReport.message}`,
      context.service || 'error-tracking',
      {
        errorId: errorReport.id,
        context,
        stack: errorReport.stack
      }
    );

    // Add to queue for external reporting
    this.errorQueue.push(errorReport);
    this.processErrorQueue();

    // Send to Sentry if available
    if (this.sentryDsn) {
      this.sendToSentry(error, context, severity);
    }
  }

  public captureException(error: Error, context: ErrorContext = {}): void {
    this.captureError(error, context, 'high');
  }

  public captureMessage(
    message: string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'low'
  ): void {
    this.captureError(message, context, severity);
  }

  private async sendToSentry(
    error: Error | string,
    context: ErrorContext,
    severity: ErrorReport['severity']
  ) {
    try {
      const Sentry = await import('@sentry/node');
      
      Sentry.withScope((scope) => {
        // Set context
        if (context.userId) scope.setUser({ id: context.userId });
        if (context.sessionId) scope.setTag('sessionId', context.sessionId);
        if (context.service) scope.setTag('service', context.service);
        if (context.action) scope.setTag('action', context.action);
        if (context.metadata) scope.setContext('metadata', context.metadata);
        
        // Set severity level
        scope.setLevel(this.mapSeverityToSentryLevel(severity));
        
        // Capture the error
        if (typeof error === 'string') {
          Sentry.captureMessage(error);
        } else {
          Sentry.captureException(error);
        }
      });
    } catch (sentryError) {
      this.logger.warn('Failed to send error to Sentry', 'error-tracking', sentryError);
    }
  }

  private mapSeverityToSentryLevel(severity: ErrorReport['severity']): any {
    const levelMap = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'fatal'
    };
    return levelMap[severity] || 'error';
  }

  private async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }
  
    this.isProcessing = true;
    let batch: ErrorReport[] = []; // Declare batch variable in proper scope
  
    try {
      // Process errors in batches
      batch = this.errorQueue.splice(0, 10);
      
      // Send to external service
      await this.sendErrorBatch(batch);
      
      // Clear processed batch
      batch = [];
    } catch (error) {
      console.error('Error processing error queue:', error);
      
      // Re-add failed batch to queue
      if (batch.length > 0) {
        this.errorQueue.unshift(...batch);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendErrorBatch(errors: ErrorReport[]): Promise<void> {
    // Implement your preferred error tracking service here
    // Examples: Sentry, Bugsnag, Rollbar, LogRocket, etc.
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Error batch (dev mode):', errors);
      return;
    }

    // Example: Send to custom endpoint
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors })
      });

      if (!response.ok) {
        throw new Error(`Failed to send errors: ${response.status}`);
      }
    } catch (error) {
      // Fallback: log to console in production
      console.error('Failed to send error batch:', error);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getErrorStats(): { total: number; queued: number } {
    return {
      total: this.errorQueue.length,
      queued: this.errorQueue.filter(e => e.timestamp > Date.now() - 3600000).length
    };
  }
}

export default ErrorTrackingService;
export type { ErrorContext, ErrorReport };