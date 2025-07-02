import LoggingService, { LogLevel } from './loggingService';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context: string;
  metadata?: any;
  timestamp: number;
  environment: string;
  service: string;
}

interface LogAggregationConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  endpoints: {
    datadog?: string;
    elasticsearch?: string;
    cloudwatch?: string;
    custom?: string;
  };
}

class ProductionLoggingService {
  private static instance: ProductionLoggingService;
  private baseLogger: LoggingService;
  private logBuffer: LogEntry[] = [];
  private config: LogAggregationConfig;
  private flushTimer?: NodeJS.Timeout;
  private isProduction: boolean;

  private constructor() {
    this.baseLogger = LoggingService.getInstance();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    this.config = {
      batchSize: parseInt(process.env.LOG_BATCH_SIZE || '50'),
      flushInterval: parseInt(process.env.LOG_FLUSH_INTERVAL || '30000'), // 30 seconds
      maxRetries: parseInt(process.env.LOG_MAX_RETRIES || '3'),
      endpoints: {
        datadog: process.env.DATADOG_API_KEY ? `https://http-intake.logs.datadoghq.com/v1/input/${process.env.DATADOG_API_KEY}` : undefined,
        elasticsearch: process.env.ELASTICSEARCH_URL,
        cloudwatch: process.env.AWS_CLOUDWATCH_LOG_GROUP,
        custom: process.env.CUSTOM_LOG_ENDPOINT
      }
    };

    this.startFlushTimer();
    this.setupProcessHandlers();
  }

  public static getInstance(): ProductionLoggingService {
    if (!ProductionLoggingService.instance) {
      ProductionLoggingService.instance = new ProductionLoggingService();
    }
    return ProductionLoggingService.instance;
  }

  public log(
    level: LogLevel,
    message: string,
    context: string = 'app',
    metadata?: any
  ): void {
    // Always log locally first
    this.baseLogger.log(level, message, context, metadata);

    // In production, also aggregate logs
    if (this.isProduction) {
      const logEntry: LogEntry = {
        id: this.generateLogId(),
        level,
        message,
        context,
        metadata,
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        service: 'bridgette-ai'
      };

      this.addToBuffer(logEntry);
    }
  }

  public info(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  public warn(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  public error(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, context, metadata);
  }

  public debug(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await Promise.allSettled([
        this.sendToDatadog(logsToFlush),
        this.sendToElasticsearch(logsToFlush),
        this.sendToCloudWatch(logsToFlush),
        this.sendToCustomEndpoint(logsToFlush)
      ]);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  private async sendToDatadog(logs: LogEntry[]): Promise<void> {
    if (!this.config.endpoints.datadog) return;

    try {
      const payload = logs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        // Convert LogLevel enum to string first
        level: LogLevel[log.level].toLowerCase(),
        // or
        level: log.level.toString().toLowerCase(),
        message: log.message,
        service: log.service,
        context: log.context,
        environment: log.environment,
        ...log.metadata
      }));

      const response = await fetch(this.config.endpoints.datadog, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY || ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Datadog API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send logs to Datadog:', error);
    }
  }

  private async sendToElasticsearch(logs: LogEntry[]): Promise<void> {
    if (!this.config.endpoints.elasticsearch) return;

    try {
      const bulkBody = logs.flatMap(log => [
        { index: { _index: `bridgette-logs-${new Date().toISOString().slice(0, 7)}` } },
        {
          '@timestamp': new Date(log.timestamp).toISOString(),
          level: log.level,
          message: log.message,
          service: log.service,
          context: log.context,
          environment: log.environment,
          ...log.metadata
        }
      ]);

      const response = await fetch(`${this.config.endpoints.elasticsearch}/_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
          ...(process.env.ELASTICSEARCH_AUTH && {
            'Authorization': `Basic ${Buffer.from(process.env.ELASTICSEARCH_AUTH).toString('base64')}`
          })
        },
        body: bulkBody.map(item => JSON.stringify(item)).join('\n') + '\n'
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send logs to Elasticsearch:', error);
    }
  }

  private async sendToCloudWatch(logsToFlush: LogEntry[]): Promise<void> { // Remove unused logs parameter
    if (!this.config.endpoints.cloudwatch) return;

    try {
      // AWS CloudWatch implementation would go here
      // This requires AWS SDK setup
      console.log('CloudWatch logging not implemented yet');
    } catch (error) {
      console.error('Failed to send logs to CloudWatch:', error);
    }
  }

  private async sendToCustomEndpoint(logs: LogEntry[]): Promise<void> {
    if (!this.config.endpoints.custom) return;

    try {
      const response = await fetch(this.config.endpoints.custom, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.CUSTOM_LOG_AUTH && {
            'Authorization': `Bearer ${process.env.CUSTOM_LOG_AUTH}`
          })
        },
        body: JSON.stringify({ logs })
      });

      if (!response.ok) {
        throw new Error(`Custom endpoint error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send logs to custom endpoint:', error);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  private setupProcessHandlers(): void {
    // Flush logs on process exit
    process.on('beforeExit', () => {
      this.flushLogs();
    });

    process.on('SIGTERM', () => {
      this.flushLogs();
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
    });

    process.on('SIGINT', () => {
      this.flushLogs();
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
    });
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getBufferStats(): { buffered: number; config: LogAggregationConfig } {
    return {
      buffered: this.logBuffer.length,
      config: this.config
    };
  }
}

export default ProductionLoggingService;
export type { LogEntry, LogAggregationConfig };
// Remove the duplicate property in the object literal
// Check for duplicate keys like 'level', 'message', etc.
// Replace direct access to private log method
// Use public methods or create a protected method in base class