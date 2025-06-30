import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings, Users, Globe, AlertCircle, Database, Sparkles, Brain, Key, Edit3, X, Menu } from 'lucide-react';
import { useTranslationServices } from './hooks/useTranslationServices';
import { useNeonDatabase } from './hooks/useNeonDatabase';
import { validateApiKeys } from './config/apiKeys';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorAlert from './components/ErrorAlert';
import LoadingSpinner from './components/LoadingSpinner';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
}

interface TranslationState {
  user1Text: string;
  user2Text: string;
  user1Translation: string;
  user2Translation: string;
}

// Enhanced voice options with better ElevenLabs voices
const voices: Voice[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sophia', gender: 'female', description: 'Warm, professional female voice' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', description: 'Clear, articulate female voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', description: 'Deep, confident male voice' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', description: 'Professional, clear male voice' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', description: 'Friendly, casual male voice' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', description: 'Elegant, sophisticated female voice' },
];

function App() {
  const [user1Language, setUser1Language] = useState<Language | null>(null);
  const [user2Language, setUser2Language] = useState<Language | null>(null);
  const [user1Voice, setUser1Voice] = useState<Voice>(voices[0]);
  const [user2Voice, setUser2Voice] = useState<Voice>(voices[2]); // Default to different genders
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
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const {
    isProcessing,
    error: translationError,
    supportedLanguages,
    startRecording,
    stopRecordingAndTranslate,
    playTranslation,
    clearError: clearTranslationError,
    isRecording,
    initializeLanguages,
  } = useTranslationServices();

  const {
    isConnected: isDatabaseConnected,
    currentSessionId,
    error: databaseError,
    startNewSession,
    saveTranslation,
    clearError: clearDatabaseError,
  } = useNeonDatabase();

  useEffect(() => {
    // Check if API keys are configured
    const validation = validateApiKeys();
    setMissingKeys(validation.missing);
    setApiKeysConfigured(validation.valid);

    if (validation.valid) {
      // Initialize languages from DeepL
      initializeLanguages().then(() => {
        setLanguagesInitialized(true);
      }).catch(console.error);
    }
  }, [initializeLanguages]);

  // Set default languages once they're loaded
  useEffect(() => {
    if (languagesInitialized && supportedLanguages.length > 0 && !user1Language && !user2Language) {
      const english = supportedLanguages.find(lang => lang.code === 'EN');
      const spanish = supportedLanguages.find(lang => lang.code === 'ES');
      
      setUser1Language(english || supportedLanguages[0]);
      setUser2Language(spanish || supportedLanguages[1] || supportedLanguages[0]);
    }
  }, [languagesInitialized, supportedLanguages, user1Language, user2Language]);

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

  const handleStartRecording = async (speaker: 'user1' | 'user2') => {
    try {
      clearAllErrors();
      setCurrentSpeaker(speaker);
      await startRecording();
      console.log(`Started recording for ${speaker}`);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setCurrentSpeaker(null);
    }
  };

  const handleStopRecording = async () => {
    if (!currentSpeaker || !user1Language || !user2Language) {
      console.error('Missing speaker or language configuration');
      return;
    }

    try {
      const fromLang = currentSpeaker === 'user1' ? user1Language.name : user2Language.name;
      const toLang = currentSpeaker === 'user1' ? user2Language.name : user1Language.name;
      const speakerVoice = currentSpeaker === 'user1' ? user2Voice : user1Voice; // Voice for the translation

      console.log(`Processing translation: ${fromLang} → ${toLang}`);

      const result = await stopRecordingAndTranslate(fromLang, toLang);

      console.log('Translation result:', {
        original: result.original.substring(0, 50) + '...',
        translated: result.translated.substring(0, 50) + '...'
      });

      if (currentSpeaker === 'user1') {
        setTranslationState(prev => ({
          ...prev,
          user1Text: result.original,
          user1Translation: result.translated
        }));
        
        // Play translation for user 2 with user 2's selected voice
        console.log(`Playing translation with voice: ${speakerVoice.name} (${speakerVoice.id})`);
        await playTranslation(result.translated, speakerVoice.id);
        
        // Save to database
        if (currentSessionId) {
          await saveTranslation(
            'user_one',
            result.original,
            result.translated,
            fromLang,
            toLang,
            speakerVoice.id
          );
        }
      } else {
        setTranslationState(prev => ({
          ...prev,
          user2Text: result.original,
          user2Translation: result.translated
        }));
        
        // Play translation for user 1 with user 1's selected voice
        console.log(`Playing translation with voice: ${speakerVoice.name} (${speakerVoice.id})`);
        await playTranslation(result.translated, speakerVoice.id);
        
        // Save to database
        if (currentSessionId) {
          await saveTranslation(
            'user_two',
            result.original,
            result.translated,
            fromLang,
            toLang,
            speakerVoice.id
          );
        }
      }

      console.log('Translation flow completed successfully');
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
  };

  const clearAllErrors = () => {
    clearTranslationError();
    clearDatabaseError();
  };

  const testVoice = async (voiceId: string, voiceName: string) => {
    try {
      const testText = `Hello! This is ${voiceName} speaking. How do you like this voice?`;
      await playTranslation(testText, voiceId);
    } catch (error) {
      console.error('Voice test failed:', error);
    }
  };

  if (!apiKeysConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 text-center max-w-lg w-full border border-white/20">
          <div className="text-violet-500 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <Key size={24} className="mx-auto sm:hidden" />
            <Key size={32} className="mx-auto hidden sm:block" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Brigitte AI
            </span> Setup Required
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Please configure your API keys in the <code className="bg-gray-100 px-1 rounded text-xs">.env</code> file to enable intelligent translation services.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Missing API Keys:</h3>
            <ul className="text-left text-sm text-red-700 space-y-1">
              {missingKeys.map(key => (
                <li key={key} className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">VITE_{key}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">Setup Instructions:</h3>
            <ol className="text-left text-xs sm:text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Edit your <code className="bg-blue-100 px-1 rounded text-xs">.env</code> file</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Get API keys from:</span>
              </li>
              <li className="ml-6 sm:ml-7 text-xs space-y-1">
                <div>• <strong>ElevenLabs:</strong> elevenlabs.io/api</div>
                <div>• <strong>Google Gemini:</strong> makersuite.google.com/app/apikey</div>
                <div>• <strong>DeepL:</strong> deepl.com/pro-api</div>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Replace placeholder values in your <code className="bg-blue-100 px-1 rounded text-xs">.env</code> file</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Restart the development server</span>
              </li>
            </ol>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <strong>Note:</strong> Make sure to replace all placeholder values like "your_api_key_here" with your actual API keys in the <code>.env</code> file.
          </div>
        </div>
      </div>
    );
  }

  if (!languagesInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-violet-500 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <Sparkles size={24} className="mx-auto animate-pulse sm:hidden" />
            <Sparkles size={32} className="mx-auto animate-pulse hidden sm:block" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Initializing Brigitte AI</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Loading intelligent language processing...
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

        {/* Mobile-First Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
          <div className="px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Brigitte AI
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Powered by Google Gemini AI</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center space-x-2">
                {/* Status Indicators - Hidden on small screens */}
                <div className="hidden lg:flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                    <Brain className="w-3 h-3" />
                    <span>Gemini</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Translation</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200">
                    <Volume2 className="w-3 h-3" />
                    <span>ElevenLabs</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${
                    isDatabaseConnected 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    <Database className="w-3 h-3" />
                    <span>{isDatabaseConnected ? 'DB' : 'Offline'}</span>
                  </div>
                </div>

                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 sm:p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors lg:hidden"
                >
                  {showMobileMenu ? (
                    <X className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Menu className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Status Bar */}
            {showMobileMenu && (
              <div className="mt-4 pt-4 border-t border-gray-200 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700">
                    <Brain className="w-3 h-3" />
                    <span>Gemini Active</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs bg-emerald-100 text-emerald-700">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Translation</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs bg-purple-100 text-purple-700">
                    <Volume2 className="w-3 h-3" />
                    <span>ElevenLabs</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${
                    isDatabaseConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Database className="w-3 h-3" />
                    <span>{isDatabaseConnected ? 'DB Connected' : 'DB Offline'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile-First Settings Panel */}
        {showSettings && (
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Language & Voice Configuration</h3>
              
              {/* Mobile-First Grid Layout */}
              <div className="space-y-6 sm:space-y-8">
                {/* User 1 Settings */}
                <div className="bg-white/50 rounded-2xl p-4 sm:p-6 border border-violet-200">
                  <h4 className="text-base sm:text-lg font-medium text-violet-600 flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span>Speaker One Settings</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={user1Language?.code || ''}
                        onChange={(e) => {
                          const selected = supportedLanguages.find(l => l.code === e.target.value);
                          if (selected) setUser1Language(selected);
                        }}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/80 text-sm sm:text-base"
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
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/80 text-sm sm:text-base"
                      >
                        {voices.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.gender === 'female' ? '♀️' : '♂️'})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">{user1Voice.description}</p>
                      <button
                        onClick={() => testVoice(user1Voice.id, user1Voice.name)}
                        className="mt-2 px-3 py-1.5 text-xs bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                      >
                        Test Voice
                      </button>
                    </div>
                  </div>
                </div>

                {/* User 2 Settings */}
                <div className="bg-white/50 rounded-2xl p-4 sm:p-6 border border-purple-200">
                  <h4 className="text-base sm:text-lg font-medium text-purple-600 flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Speaker Two Settings</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={user2Language?.code || ''}
                        onChange={(e) => {
                          const selected = supportedLanguages.find(l => l.code === e.target.value);
                          if (selected) setUser2Language(selected);
                        }}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 text-sm sm:text-base"
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
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 text-sm sm:text-base"
                      >
                        {voices.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.gender === 'female' ? '♀️' : '♂️'})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">{user2Voice.description}</p>
                      <button
                        onClick={() => testVoice(user2Voice.id, user2Voice.name)}
                        className="mt-2 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        Test Voice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Swap Languages Button */}
              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  onClick={swapLanguages}
                  disabled={!user1Language || !user2Language}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
                >
                  <Users className="w-4 h-4" />
                  <span>Swap Languages & Voices</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-First Main Content */}
        <main className="px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Mobile-First Speaker Panels */}
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
              {/* User 1 Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="text-2xl sm:text-3xl">{user1Language?.flag || '🌐'}</div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">Speaker One</h3>
                        <p className="text-violet-100 text-sm sm:text-base">{user1Language?.name || 'Select Language'}</p>
                        <p className="text-violet-200 text-xs sm:text-sm">{user1Voice.name} ({user1Voice.gender === 'female' ? '♀️' : '♂️'})</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      currentSpeaker === 'user1' ? 'bg-green-400 animate-pulse shadow-lg' : 'bg-white/30'
                    }`} />
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="min-h-[100px] sm:min-h-[120px]">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 sm:mb-3">Original Speech:</h4>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px] border border-gray-100">
                      <p className="text-gray-800 text-sm sm:text-lg leading-relaxed">
                        {translationState.user1Text || 'Start speaking...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="min-h-[100px] sm:min-h-[120px]">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 sm:mb-3">AI Translation:</h4>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px]">
                      <p className="text-emerald-800 text-sm sm:text-lg leading-relaxed">
                        {translationState.user1Translation || 'Translation will appear here...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-2 sm:pt-4">
                    <button
                      onClick={() => currentSpeaker === 'user1' ? handleStopRecording() : handleStartRecording('user1')}
                      disabled={currentSpeaker === 'user2' || isProcessing || !user1Language || !user2Language}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
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
                        <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* User 2 Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="text-2xl sm:text-3xl">{user2Language?.flag || '🌐'}</div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">Speaker Two</h3>
                        <p className="text-purple-100 text-sm sm:text-base">{user2Language?.name || 'Select Language'}</p>
                        <p className="text-purple-200 text-xs sm:text-sm">{user2Voice.name} ({user2Voice.gender === 'female' ? '♀️' : '♂️'})</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      currentSpeaker === 'user2' ? 'bg-green-400 animate-pulse shadow-lg' : 'bg-white/30'
                    }`} />
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="min-h-[100px] sm:min-h-[120px]">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 sm:mb-3">Original Speech:</h4>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px] border border-gray-100">
                      <p className="text-gray-800 text-sm sm:text-lg leading-relaxed">
                        {translationState.user2Text || 'Start speaking...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="min-h-[100px] sm:min-h-[120px]">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 sm:mb-3">AI Translation:</h4>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px]">
                      <p className="text-amber-800 text-sm sm:text-lg leading-relaxed">
                        {translationState.user2Translation || 'Translation will appear here...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-2 sm:pt-4">
                    <button
                      onClick={() => currentSpeaker === 'user2' ? handleStopRecording() : handleStartRecording('user2')}
                      disabled={currentSpeaker === 'user1' || isProcessing || !user1Language || !user2Language}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
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
                        <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-First Status Indicator */}
            <div className="text-center mt-6 sm:mt-8">
              <div className={`inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full ${
                isRecording
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : isProcessing
                  ? 'bg-violet-100 text-violet-800 border border-violet-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span className="text-xs sm:text-sm font-medium">
                  {isRecording
                    ? `Recording ${currentSpeaker === 'user1' ? user1Language?.name : user2Language?.name}...`
                    : isProcessing
                    ? 'Processing with Brigitte AI...'
                    : 'Tap microphone to start intelligent conversation'
                  }
                </span>
              </div>
              
              {/* Session Info */}
              {currentSessionId && (
                <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                  Session: {currentSessionId.slice(0, 8)}... | {supportedLanguages.length} languages available via AI Translation
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Mobile-First Footer */}
        <footer className="text-center py-6 sm:py-8 text-gray-500 px-4">
          <p className="text-sm">
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Brigitte AI
            </span> - Intelligent language barriers elimination
          </p>
          <p className="text-xs mt-1">
            Powered by Google Gemini AI, ElevenLabs & Neon Database
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;