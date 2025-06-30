import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings, Users, Database, Sparkles, Brain } from 'lucide-react';
import { useFSMTranslation } from './hooks/useFSMTranslation';
import { useNeonDatabase } from './hooks/useNeonDatabase';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import MobileMenu from './components/MobileMenu';
import DesktopLayout from './components/DesktopLayout';
import './components/MobileMenu.css';
import ErrorAlert from './components/ErrorAlert';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
}

interface TranslationState {
  user1Text: string;
  user2Text: string;
  user1Translation: string;
  user2Translation: string;
}

const voices: Voice[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sophia', gender: 'female' },
  { id: '9PVP7ENhDskL0KYHAKtD', name: 'Marcus', gender: 'male' },
];

function App() {
  const [user1Language, setUser1Language] = useState<Language | null>(null);
  const [user2Language, setUser2Language] = useState<Language | null>(null);
  const [user1Voice, setUser1Voice] = useState<Voice>(voices[0]);
  const [user2Voice, setUser2Voice] = useState<Voice>(voices[1]);
  const [translationState, setTranslationState] = useState<TranslationState>({
    user1Text: '',
    user2Text: '',
    user1Translation: '',
    user2Translation: ''
  });
  const [currentSpeaker, setCurrentSpeaker] = useState<'user1' | 'user2' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [languagesInitialized, setLanguagesInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    isProcessing,
    error: translationError,
    supportedLanguages,
    startRecording,
    stopRecordingAndTranslate,
    clearError: clearTranslationError,
    isRecording,
    originalText,
    translatedText,
    setFromLanguage,
    setToLanguage,
    setVoiceId
  } = useFSMTranslation();

  const {
    isConnected: isDatabaseConnected,
    currentSessionId,
    error: databaseError,
    startNewSession,
    clearError: clearDatabaseError,
  } = useNeonDatabase();

  useEffect(() => {
    // Always proceed with initialization - let orchestrator handle API keys
    setApiKeysConfigured(true);
    setLanguagesInitialized(true);
  }, []);

  // Set default languages once they're loaded
  useEffect(() => {
    if (languagesInitialized && supportedLanguages.length > 0 && !user1Language && !user2Language) {
      const english = supportedLanguages.find(lang => lang.code === 'EN');
      const spanish = supportedLanguages.find(lang => lang.code === 'ES');
      
      setUser1Language(english || supportedLanguages[0]);
      setUser2Language(spanish || supportedLanguages[1] || supportedLanguages[0]);
      
      // Set initial languages in the FSM
      if (english) setFromLanguage(english.code);
      if (spanish) setToLanguage(spanish.code);
    }
  }, [languagesInitialized, supportedLanguages, user1Language, user2Language, setFromLanguage, setToLanguage]);

  // Start new session when languages or voices change
  useEffect(() => {
    if (isDatabaseConnected && apiKeysConfigured && user1Language && user2Language) {
      startNewSession(
        user1Language.name,
        user2Language.name,
        user1Voice.name,
        user2Voice.name
      ).catch(console.error);
    }
  }, [user1Language, user2Language, user1Voice, user2Voice, isDatabaseConnected, apiKeysConfigured, startNewSession]);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleStartRecording = async (speaker: 'user1' | 'user2') => {
    try {
      setCurrentSpeaker(speaker);
      
      // Update FSM languages based on current speaker
      if (speaker === 'user1' && user1Language && user2Language) {
        setFromLanguage(user1Language.code);
        setToLanguage(user2Language.code);
        if (user2Voice) setVoiceId(user2Voice.id);
      } else if (speaker === 'user2' && user1Language && user2Language) {
        setFromLanguage(user2Language.code);
        setToLanguage(user1Language.code);
        if (user1Voice) setVoiceId(user1Voice.id);
      }
      
      await startRecording();
    } catch (error) {
      setCurrentSpeaker(null);
    }
  };

  const handleStopRecording = async () => {
    if (!currentSpeaker || !user1Language || !user2Language) return;

    try {
      await stopRecordingAndTranslate();
      
      // Update UI state based on translation results
      if (currentSpeaker === 'user1' && originalText && translatedText) {
        setTranslationState(prev => ({
          ...prev,
          user1Text: originalText,
          user1Translation: translatedText
        }));
        
        // Database saving is handled in the FSM hook
      } else if (currentSpeaker === 'user2' && originalText && translatedText) {
        setTranslationState(prev => ({
          ...prev,
          user2Text: originalText,
          user2Translation: translatedText
        }));
        
        // Database saving is handled in the FSM hook
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setCurrentSpeaker(null);
    }
  };

  const swapLanguages = () => {
    if (!user1Language || !user2Language) return;
    
    const tempLang = user1Language;
    const tempVoice = user1Voice;
    setUser1Language(user2Language);
    setUser2Language(tempLang);
    setUser1Voice(user2Voice);
    setUser2Voice(tempVoice);
    setTranslationState({
      user1Text: '',
      user2Text: '',
      user1Translation: '',
      user2Translation: ''
    });
    
    // Update FSM languages
    setFromLanguage(user2Language.code);
    setToLanguage(user1Language.code);
  };

  const clearAllErrors = () => {
    clearTranslationError();
    clearDatabaseError();
  };

  if (!languagesInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md border border-white/20">
          <div className="text-violet-500 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <Sparkles size={32} className="mx-auto animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Initializing Brigitte AI</h2>
          <p className="text-gray-600 mb-4">
                Loading intelligent language processing from Groq and DeepL AI...
              </p>
          <LoadingSpinner size="lg" className="mx-auto text-violet-500" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        {(translationError || databaseError) && (
          <ErrorAlert
            message={(translationError || databaseError)?.message || 'An error occurred'}
            service={translationError ? 'translation' : 'database'}
            onClose={clearAllErrors}
          />
        )}

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Brigitte AI
                  </h1>
                  <p className="text-sm text-gray-500">Powered by Groq & DeepL</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Groq Status Indicator */}
                <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                  <Brain className="w-3 h-3" />
                  <span>Groq Active</span>
                </div>
                {/* DeepL Status Indicator */}
                <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  <span>DeepL AI Active</span>
                </div>
                {/* Database Status Indicator */}
                <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs border ${
                  isDatabaseConnected 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  <Database className="w-3 h-3" />
                  <span>{isDatabaseConnected ? 'DB Connected' : 'DB Offline'}</span>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-6">
            <div className="container mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Language & Voice Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User 1 Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-violet-600 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span>Speaker One Settings</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={user1Language?.code || ''}
                      onChange={(e) => {
                        const selected = supportedLanguages.find(l => l.code === e.target.value);
                        if (selected) setUser1Language(selected);
                      }}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/80"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                    <select
                      value={user1Voice.id}
                      onChange={(e) => setUser1Voice(voices.find(v => v.id === e.target.value) || voices[0])}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/80"
                    >
                      {voices.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender === 'female' ? '♀️' : '♂️'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* User 2 Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-purple-600 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Speaker Two Settings</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={user2Language?.code || ''}
                      onChange={(e) => {
                        const selected = supportedLanguages.find(l => l.code === e.target.value);
                        if (selected) setUser2Language(selected);
                      }}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                    <select
                      value={user2Voice.id}
                      onChange={(e) => setUser2Voice(voices.find(v => v.id === e.target.value) || voices[1])}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
                    >
                      {voices.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender === 'female' ? '♀️' : '♂️'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={swapLanguages}
                  disabled={!user1Language || !user2Language}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Users className="w-4 h-4" />
                  <span>Swap Languages & Voices</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <MobileMenu
            onLanguageSwap={swapLanguages}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            currentSpeaker={currentSpeaker}
            isProcessing={isProcessing}
            isRecording={isRecording}
            user1Language={user1Language}
            user2Language={user2Language}
          />
        )}

        {/* Main Content */}
        {!isMobile ? (
          <DesktopLayout
            onLanguageSwap={swapLanguages}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            currentSpeaker={currentSpeaker}
            isProcessing={isProcessing}
            isRecording={isRecording}
            user1Language={user1Language}
            user2Language={user2Language}
          />
        ) : (
          <main className={`container mx-auto px-4 py-8 ${isMobile ? 'pb-32' : ''}`}>
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-8 max-w-6xl mx-auto`}>
            {/* User 1 Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{user1Language?.flag || '🌐'}</div>
                    <div>
                      <h3 className="text-xl font-bold">Speaker One</h3>
                      <p className="text-violet-100">{user1Language?.name || 'Select Language'}</p>
                      <p className="text-violet-200 text-sm">{user1Voice.name}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    currentSpeaker === 'user1' ? 'bg-green-400 animate-pulse shadow-lg' : 'bg-white/30'
                  }`} />
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="min-h-[120px]">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Original Speech:</h4>
                  <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] border border-gray-100">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {translationState.user1Text || 'Start speaking...'}
                    </p>
                  </div>
                </div>
                
                <div className="min-h-[120px]">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">AI Translation:</h4>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 min-h-[80px]">
                    <p className="text-emerald-800 text-lg leading-relaxed">
                      {translationState.user1Translation || 'Translation will appear here...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => currentSpeaker === 'user1' ? handleStopRecording() : handleStartRecording('user1')}
                    disabled={currentSpeaker === 'user2' || isProcessing || !user1Language || !user2Language}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      currentSpeaker === 'user1'
                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200'
                        : currentSpeaker === 'user2' || isProcessing || !user1Language || !user2Language
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-violet-500 hover:bg-violet-600 hover:scale-105 shadow-violet-200'
                    }`}
                  >
                    {isProcessing && currentSpeaker === 'user1' ? (
                      <LoadingSpinner size="md" className="text-white" />
                    ) : currentSpeaker === 'user1' ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* User 2 Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{user2Language?.flag || '🌐'}</div>
                    <div>
                      <h3 className="text-xl font-bold">Speaker Two</h3>
                      <p className="text-purple-100">{user2Language?.name || 'Select Language'}</p>
                      <p className="text-purple-200 text-sm">{user2Voice.name}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    currentSpeaker === 'user2' ? 'bg-green-400 animate-pulse shadow-lg' : 'bg-white/30'
                  }`} />
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="min-h-[120px]">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Original Speech:</h4>
                  <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] border border-gray-100">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {translationState.user2Text || 'Start speaking...'}
                    </p>
                  </div>
                </div>
                
                <div className="min-h-[120px]">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">AI Translation:</h4>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 min-h-[80px]">
                    <p className="text-amber-800 text-lg leading-relaxed">
                      {translationState.user2Translation || 'Translation will appear here...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => currentSpeaker === 'user2' ? handleStopRecording() : handleStartRecording('user2')}
                    disabled={currentSpeaker === 'user1' || isProcessing || !user1Language || !user2Language}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      currentSpeaker === 'user2'
                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200'
                        : currentSpeaker === 'user1' || isProcessing || !user1Language || !user2Language
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600 hover:scale-105 shadow-purple-200'
                    }`}
                  >
                    {isProcessing && currentSpeaker === 'user2' ? (
                      <LoadingSpinner size="md" className="text-white" />
                    ) : currentSpeaker === 'user2' ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-gray-500">
          <p className="text-sm">
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Brigitte AI
            </span> - Intelligent language barriers elimination
          </p>
          <p className="text-xs mt-1">
            Powered by Groq, DeepL AI, ElevenLabs & Neon Database
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;