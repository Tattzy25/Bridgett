# Bridgit AI Architecture Documentation

## Overview

Bridgit AI uses a modern orchestrator-based architecture that eliminates redundant API connectivity tests and provides efficient service management.

## Key Architectural Principles

### 1. No Startup API Testing

**Previous Approach (Removed):**
- API connectivity tests were performed on every application startup
- Services would test API endpoints before initialization
- This caused unnecessary delays and redundant network requests

**Current Approach:**
- APIs are validated only when actually needed
- The FSM Orchestrator handles service coordination without upfront testing
- Faster startup times and more efficient resource usage

### 2. FSM Orchestrator Pattern

The `FSMOrchestrator` class manages the entire translation workflow:

```
IDLE → RECORDING → TRANSCRIBING → TRANSLATING → SPEAKING → IDLE
```

**Key Components:**
- `AudioRecorder`: Handles audio capture
- `GroqService`: Speech-to-text transcription
- `DeepLService`: Translation with fallback support
- `ElevenLabsService`: Text-to-speech synthesis

### 3. Lazy API Validation

**Benefits:**
- APIs are only called when needed for actual functionality
- Graceful error handling at the point of use
- No blocking startup processes
- Better user experience with immediate application availability

**Implementation:**
- Services initialize without API validation
- Error handling occurs during actual API calls

### 4. Service Coordination

**Event-Driven Architecture:**
- `EventService`: Centralized event management
- `LoggingService`: Comprehensive logging with context
- State transitions trigger appropriate service calls

**Error Handling:**
- Each service handles its own errors gracefully
- Fallback mechanisms prevent application crashes
- User-friendly error messages without technical details

## Removed Components

### API Connectivity Tests

**What was removed:**
- `testApiConnectivity()` method from `DeepLService`
- Startup API validation calls
- Blocking initialization processes

**Why it was removed:**
- Redundant with existing orchestrator and agent system
- Caused unnecessary delays on every server restart
- The orchestrator already handles API management efficiently

## Development Guidelines

### DO NOT Re-implement:
- API connectivity tests in service constructors
- Blocking API validation during initialization
- Startup health checks for external APIs

### DO Implement:
- Error handling at the point of API usage
- User-friendly error messages
- Lazy loading of API-dependent features

## Service Integration

### Adding New Services

1. **Create the service class** without startup API tests
2. **Integrate with FSM Orchestrator** for state management
3. **Implement error handling** at the method level
4. **Update the orchestrator** to coordinate the new service

### Error Handling Pattern

```typescript
async someApiMethod(): Promise<Result> {
  try {
    // Make API call
    const response = await fetch(...);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    // Handle error gracefully
    console.warn('API unavailable, using fallback');
    return this.getFallbackResult();
  }
}
```

## Performance Benefits

- **Faster Startup**: No blocking API tests
- **Better UX**: Immediate application availability
- **Efficient Resource Usage**: APIs called only when needed
- **Improved Reliability**: Graceful degradation when services are unavailable

## Maintenance Notes

- The orchestrator pattern eliminates the need for startup API validation
- All API management is handled through the existing agent system
- Future developers should follow the lazy validation pattern
- Do not reintroduce API connectivity tests without architectural review