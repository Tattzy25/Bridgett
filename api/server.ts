// Ably-Based Server for Bridgette AI
// This server handles HTTP endpoints and integrates with Ably for real-time communication

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Ably from 'ably';
import { getApiKey, validateProductionEnvironment } from '../src/config/apiKeys';
import LoggingService, { LogLevel } from '../src/services/loggingService';
import { EventType } from '../src/services/eventService';

// Initialize logger
const logger = LoggingService.getInstance();
logger.configure({
  contextPrefix: 'Server',
  minLevel: LogLevel.DEBUG
});

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://bridgette-ai.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ably server-side client for server operations
let ablyServer: Ably.Realtime | null = null;
const connectedClients = new Map();
const sessionChannels = new Map();

// Initialize Ably server client
async function initializeAblyServer() {
  try {
    const apiKey = getApiKey('ABLY_API_KEY');
    
    if (!apiKey || 
        apiKey === 'your_ably_api_key_here' || 
        apiKey.includes('your_') ||
        apiKey.includes('_here') ||
        apiKey.trim() === '') {
      throw new Error('Ably API key is required for server operations');
    }

    ablyServer = new Ably.Realtime({
      key: apiKey,
      clientId: `bridgette-server-${Date.now()}`,
      autoConnect: true
    });

    ablyServer.connection.on('connected', () => {
      logger.info('Server connected to Ably', 'ably');
    });

    ablyServer.connection.on('failed', (error) => {
      logger.error('Server failed to connect to Ably', 'ably', error);
    });

    // Monitor global presence across all sessions
    const globalChannel = ablyServer.channels.get('global:presence');
    
    globalChannel.presence.subscribe('enter', (member) => {
      connectedClients.set(member.clientId, {
        clientId: member.clientId,
        connectedAt: new Date(),
        sessionId: member.data?.sessionId || null
      });
      logger.info(`Client connected: ${member.clientId}`, 'presence');
    });

    globalChannel.presence.subscribe('leave', (member) => {
      connectedClients.delete(member.clientId);
      logger.info(`Client disconnected: ${member.clientId}`, 'presence');
    });

    logger.info('Ably server client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Ably server client', 'initialization', error);
    throw error;
  }
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    realtime: {
      provider: 'ably',
      connected: ablyServer?.connection.state === 'connected'
    }
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  const { valid, issues } = validateProductionEnvironment();
  
  if (valid && ablyServer?.connection.state === 'connected') {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'configured',
        apis: 'configured',
        realtime: 'connected'
      }
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      issues: [
        ...issues,
        ...(ablyServer?.connection.state !== 'connected' ? ['Ably connection not ready'] : [])
      ]
    });
  }
});

// Get connected clients count
app.get('/api/clients/count', (req, res) => {
  res.json({
    count: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

// Get session information
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!ablyServer) {
    return res.status(503).json({ error: 'Ably server not initialized' });
  }

  const channel = ablyServer.channels.get(`session:${sessionId}`);
  
  // Fix: Use promise-based approach for presence.get
  channel.presence.get().then((members) => {
    res.json({
      sessionId,
      memberCount: members?.length || 0,
      members: members?.map(member => ({
        clientId: member.clientId,
        data: member.data
      })) || [],
      timestamp: new Date().toISOString()
    });
  }).catch((err) => {
    logger.error(`Failed to get session ${sessionId} presence`, 'api', err);
    res.status(500).json({ error: 'Failed to get session information' });
  });
});

// Broadcast message to session
app.post('/api/sessions/:sessionId/broadcast', (req, res) => {
  const { sessionId } = req.params;
  const { eventType, data } = req.body;
  
  if (!ablyServer) {
    return res.status(503).json({ error: 'Ably server not initialized' });
  }

  if (!eventType) {
    return res.status(400).json({ error: 'eventType is required' });
  }

  const channel = ablyServer.channels.get(`session:${sessionId}`);
  
  // Fix: Use promise-based approach for publish
  channel.publish('server:broadcast', {
    type: eventType,
    data,
    timestamp: Date.now(),
    source: 'server'
  }).then(() => {
    logger.info(`Broadcasted ${eventType} to session ${sessionId}`, 'api');
    res.json({ success: true, timestamp: new Date().toISOString() });
  }).catch((err) => {
    logger.error(`Failed to broadcast to session ${sessionId}`, 'api', err);
    res.status(500).json({ error: 'Failed to broadcast message' });
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Express error: ${err.message}`, 'express', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Server configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Set up server timeouts
httpServer.timeout = 120000; // 2 minutes
httpServer.keepAliveTimeout = 60000; // 1 minute

// Start server
async function startServer() {
  try {
    // Initialize Ably server client first
    await initializeAblyServer();
    
    // Start HTTP server
    httpServer.listen(Number(PORT), HOST, () => {
      logger.info(`Bridgette AI server running on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`, 'server');
      logger.info('Real-time communication powered by Ably', 'server');
    });
  } catch (error) {
    logger.error('Failed to start server', 'startup', error);
    process.exit(1);
  }
}

// Error handling
httpServer.on('error', (error) => {
  logger.error(`Server error: ${error.message}`, 'server', error);
  process.exit(1);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`, 'server');
  
  const forcefulShutdown = setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down', 'server');
    process.exit(1);
  }, 30000);
  
  forcefulShutdown.unref();
  
  // Close Ably connection
  if (ablyServer) {
    ablyServer.close();
  }
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('Server closed, all connections ended', 'server');
    process.exit(0);
  });
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`, 'server', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', 'server', { reason });
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
