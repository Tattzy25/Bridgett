import React, { useState, useEffect } from 'react';
import NeumorphicCard from './NeumorphicCard';
import AblyService from '../services/ablyService';
import ProductionOrchestrator from '../services/productionOrchestrator';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  productionOrchestrator: ProductionOrchestrator;
  mode: 'host' | 'join'; // New prop to determine which popup to show
}

interface SessionState {
  isHost: boolean;
  isGuest: boolean;
  sessionCode: string | null;
  isConnected: boolean;
  participants: number;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  isOpen,
  onClose,
  productionOrchestrator,
  mode
}) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isHost: false,
    isGuest: false,
    sessionCode: null,
    isConnected: false,
    participants: 0
  });
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Auto-expiry timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState.isHost && timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleEndSession();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState.isHost, timeRemaining]);

  const generateSessionCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  };

  const handleHostSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionCode = generateSessionCode();
      const channelName = `bridgit_${sessionCode}`;
      
      // Create session in database and Ably
      await productionOrchestrator.createHostSession(sessionCode, channelName);
      
      setSessionState({
        isHost: true,
        isGuest: false,
        sessionCode,
        isConnected: true,
        participants: 1
      });
      
      // Set 30-minute auto-expiry
      // UI also sets 30 minutes
      setTimeRemaining(30 * 60); // 30 minutes in seconds
      
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    // End current session (security cleanup)
    await productionOrchestrator.endLiveSession();
    
    // Generate new session with fresh 30-minute timer
    const sessionCode = generateSessionCode();
    await productionOrchestrator.createHostSession(sessionCode, channelName);
    
    // Reset timer for another 30 minutes
    setTimeRemaining(30 * 60);
  };

  const handleCopyCode = async () => {
    if (!sessionState.sessionCode) return;
    
    try {
      await navigator.clipboard.writeText(sessionState.sessionCode);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleShareSession = async () => {
    if (!sessionState.sessionCode) return;
    
    const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.VITE_APP_URL || 'https://bridgette-ai.com'
    : 'http://localhost:5173';
    
    const shareData = {
      title: 'Join my Bridgit AI Session',
      text: `Hey! Join my live Bridgit AI voice session now.\nGo to ${baseUrl}/join?code=${sessionState.sessionCode}\nEnter this code to connect: ${sessionState.sessionCode}`,
      url: `${baseUrl}/join?code=${sessionState.sessionCode}`
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy
        await handleCopyCode();
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a session code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const channelName = `bridgit_${joinCode}`;
      
      // Join session via Ably and update database
      await productionOrchestrator.joinGuestSession(joinCode, channelName);
      
      setSessionState({
        isHost: false,
        isGuest: true,
        sessionCode: joinCode,
        isConnected: true,
        participants: 0 // Will be updated by presence events
      });
      
      setJoinCode('');
      
    } catch (err: any) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    
    try {
      await productionOrchestrator.endLiveSession();
      
      setSessionState({
        isHost: false,
        isGuest: false,
        sessionCode: null,
        isConnected: false,
        participants: 0
      });
      
      setTimeRemaining(null);
      
    } catch (err: any) {
      setError(err.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <NeumorphicCard className="w-96 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'host' ? 'Host Session' : 'Join Session'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              style={{
                background: '#e0e0e0',
                boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {showCopySuccess && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
              Copied to clipboard!
            </div>
          )}

          {mode === 'host' ? (
            // HOST SESSION MODE
            !sessionState.isConnected ? (
              <>
                {/* Host Session Button */}
                <SessionButton
                  icon="👑"
                  label="Host Session"
                  onClick={handleHostSession}
                  disabled={loading}
                />
              </>
            ) : (
              <>
                {/* Active Host Session Display */}
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-lg" style={{
                    background: '#e8f5e8',
                    boxShadow: 'inset 2px 2px 4px #d1e7d1, inset -2px -2px 4px #ffffff'
                  }}>
                    <div className="text-sm text-gray-600 mb-1">
                      Your Session Code
                    </div>
                    <div className="text-3xl font-bold text-gray-800 tracking-wider">
                      {sessionState.sessionCode}
                    </div>
                    {timeRemaining && (
                      <div className="text-sm text-gray-500 mt-2">
                        Expires in: {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Connected • {sessionState.participants} participant(s)</span>
                  </div>

                  {/* Copy and Share Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 p-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={handleShareSession}
                      className="flex-1 p-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                      📤 Share
                    </button>
                  </div>
                </div>

                {/* Regenerate Code Button */}
                <SessionButton
                  icon="🔄"
                  label="Regenerate Code"
                  onClick={handleRegenerateCode}
                  disabled={loading}
                />

                {/* End Session Button */}
                <SessionButton
                  icon="🛑"
                  label="End Session"
                  onClick={handleEndSession}
                  disabled={loading}
                  variant="danger"
                />
              </>
            )
          ) : (
            // JOIN SESSION MODE
            !sessionState.isConnected ? (
              <>
                {/* Join Session Input */}
                <div className="space-y-3">
                  <div className="text-center text-gray-600 mb-4">
                    Enter the session code to join
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter session code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                      style={{
                        background: '#f5f5f5',
                        boxShadow: 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleJoinSession}
                    disabled={loading || !joinCode.trim()}
                    className="w-full p-3 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    🔗 Join Session
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Active Guest Session Display */}
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-lg" style={{
                    background: '#e8f5e8',
                    boxShadow: 'inset 2px 2px 4px #d1e7d1, inset -2px -2px 4px #ffffff'
                  }}>
                    <div className="text-sm text-gray-600 mb-1">
                      Joined Session
                    </div>
                    <div className="text-3xl font-bold text-gray-800 tracking-wider">
                      {sessionState.sessionCode}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Connected • {sessionState.participants} participant(s)</span>
                  </div>
                </div>

                {/* Leave Session Button */}
                <SessionButton
                  icon="🛑"
                  label="Leave Session"
                  onClick={handleEndSession}
                  disabled={loading}
                  variant="danger"
                />
              </>
            )
          )}
        </div>
      </NeumorphicCard>
    </div>
  );
};

interface SessionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

const SessionButton: React.FC<SessionButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'default'
}) => {
  const baseStyle = {
    background: variant === 'danger' ? '#ffe0e0' : '#e0e0e0',
    boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-xl flex items-center space-x-3 text-left transition-all duration-200 hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
      style={baseStyle}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = baseStyle.boxShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = baseStyle.boxShadow;
        }
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className={`font-medium ${
        variant === 'danger' ? 'text-red-700' : 'text-gray-700'
      }`}>{label}</span>
    </button>
  );
};

export default SessionManager;