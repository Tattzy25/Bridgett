// Socket.IO Server for Brigitte AI
// This server handles real-time communication between clients

import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventType } from './src/services/eventService';
import LoggingService, { LogLevel } from './src/services/loggingService';

// Initialize logger
const logger = LoggingService.getInstance();
logger.configure({
  contextPrefix: 'Server',
  minLevel: LogLevel.DEBUG
});

// Create HTTP server
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || 'https://bridgette-ai.com' 
      : '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6, // 1MB max message size
  transports: ['websocket', 'polling']
});

// Track connected clients with rate limiting
const connectedClients = new Map();

// Rate limiting configuration
const rateLimits = {
  connection: { points: 5, duration: 60 }, // 5 connections per minute
  events: { points: 100, duration: 60 }     // 100 events per minute
};

// Rate limiting maps
const connectionLimiter = new Map();
const eventLimiter = new Map();

// Rate limiting function
function isRateLimited(limiter, ip, limit) {
  const now = Date.now();
  const windowMs = limit.duration * 1000;
  
  if (!limiter.has(ip)) {
    limiter.set(ip, []);
  }
  
  const requests = limiter.get(ip);
  const windowStart = now - windowMs;
  
  // Filter out old requests
  const recent = requests.filter(time => time > windowStart);
  limiter.set(ip, recent);
  
  if (recent.length >= limit.points) {
    return true; // Rate limited
  }
  
  // Add current request
  recent.push(now);
  limiter.set(ip, recent);
  return false;
}

// Socket.IO middleware for authentication and rate limiting
io.use((socket, next) => {
  const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  
  // Rate limiting for connections
  if (isRateLimited(connectionLimiter, ip, rateLimits.connection)) {
    logger.warn(`Rate limit exceeded for connections from ${ip}`, 'security');
    return next(new Error('Too many connection attempts, please try again later'));
  }
  
  // Add authentication check here if needed
  // if (!socket.handshake.auth.token) {
  //   return next(new Error('Authentication failed'));
  // }
  
  next();
});

// Socket.IO connection handler with error handling
io.on('connection', (socket) => {
  try {
    const clientId = socket.id;
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    logger.info(`Client connected: ${clientId} from ${ip}`, 'socket');
  
  // Add client to connected clients
  connectedClients.set(clientId, {
    id: clientId,
    connectedAt: new Date(),
    sessionId: null
  });
  
  // Send current connected count to all clients
  io.emit('clients:count', connectedClients.size);
  
  // Handle client events with validation and rate limiting
  socket.on('event', (payload) => {
    try {
      const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
      
      // Rate limiting for events
      if (isRateLimited(eventLimiter, ip, rateLimits.events)) {
        logger.warn(`Rate limit exceeded for events from ${clientId}`, 'security');
        socket.emit('error', { message: 'Rate limit exceeded for events' });
        return;
      }
      
      // Validate payload
      if (!payload || !payload.type) {
        logger.warn(`Invalid event payload from ${clientId}`, 'validation', payload);
        return;
      }
      
      logger.debug(`Received event from client ${clientId}`, 'socket', payload);
      
      // Sanitize payload before broadcasting
      const sanitizedPayload = {
        type: payload.type,
        data: payload.data, // Consider deeper sanitization based on your needs
        timestamp: payload.timestamp || Date.now(),
        source: payload.source || 'client'
      };
      
      // Broadcast event to session members or all clients based on event type
      const client = connectedClients.get(clientId);
      if (client?.sessionId) {
        // Broadcast to session members only
        socket.to(`session:${client.sessionId}`).emit('event', sanitizedPayload);
      } else {
        // Broadcast to all other clients
        socket.broadcast.emit('event', sanitizedPayload);
      }
      
      // Handle specific events
      if (payload.type === EventType.SESSION_STARTED) {
        // Update client with session ID
        const client = connectedClients.get(clientId);
        if (client) {
          client.sessionId = payload.data.sessionId;
          connectedClients.set(clientId, client);
        }
      }
    } catch (error) {
      logger.error(`Error handling event from ${clientId}`, 'socket', error);
    }
  });
  
  // Handle client joining a session
  socket.on('session:join', (sessionId) => {
    logger.info(`Client ${clientId} joined session ${sessionId}`, 'socket');
    
    // Leave any existing rooms
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    // Join session room
    socket.join(`session:${sessionId}`);
    
    // Update client with session ID
    const client = connectedClients.get(clientId);
    if (client) {
      client.sessionId = sessionId;
      connectedClients.set(clientId, client);
    }
    
    // Notify room members
    io.to(`session:${sessionId}`).emit('session:joined', {
      clientId,
      sessionId,
      timestamp: new Date()
    });
  });
  
  // Handle client leaving a session
  socket.on('session:leave', (sessionId) => {
    logger.info(`Client ${clientId} left session ${sessionId}`, 'socket');
    
    // Leave session room
    socket.leave(`session:${sessionId}`);
    
    // Update client
    const client = connectedClients.get(clientId);
    if (client) {
      client.sessionId = null;
      connectedClients.set(clientId, client);
    }
    
    // Notify room members
    io.to(`session:${sessionId}`).emit('session:left', {
      clientId,
      sessionId,
      timestamp: new Date()
    });
  });
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${clientId}`, 'socket');
    
    // Get client session before removing
    const client = connectedClients.get(clientId);
    const sessionId = client?.sessionId;
    
    // Remove client from connected clients
    connectedClients.delete(clientId);
    
    // Send updated connected count to all clients
    io.emit('clients:count', connectedClients.size);
    
    // Notify session members if client was in a session
    if (sessionId) {
      io.to(`session:${sessionId}`).emit('session:left', {
        clientId,
        sessionId,
        timestamp: new Date()
      });
    }
  });
} catch (error) {
  logger.error(`Error in socket connection handler`, 'socket', error);
}
});

// Start server with proper error handling
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Set up server timeouts
httpServer.timeout = 120000; // 2 minutes
httpServer.keepAliveTimeout = 60000; // 1 minute

// Start listening with error handling
httpServer.listen(Number(PORT), HOST, () => {
  logger.info(`Socket.IO server running on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`, 'server');
});

httpServer.on('error', (error) => {
  logger.error(`Server error: ${error.message}`, 'server', error);
  process.exit(1);
});

// Handle server shutdown gracefully
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`, 'server');
  
  // Set a timeout for forceful shutdown if graceful shutdown fails
  const forcefulShutdown = setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down', 'server');
    process.exit(1);
  }, 30000);
  
  // Clear timeout if shutdown completes
  forcefulShutdown.unref();
  
  // Close server
  httpServer.close(() => {
    logger.info('Server closed, all connections ended', 'server');
    process.exit(0);
  });
  
  // Notify all clients
  io.sockets.emit('server:shutdown', { message: 'Server is shutting down' });
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