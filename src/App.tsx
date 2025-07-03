import React, { useState, useEffect } from 'react';
import TranslationCard from './components/TranslationCard';
import SettingsMenu from './components/SettingsMenu';
import { TranslationMode } from './components/SettingsMenu';
import { useProductionTranslation } from './hooks/useProductionTranslation';
import logoImage from './components/bridgit ai logo.png';

const App: React.FC = () => {
  const [translationMode, setTranslationMode] = useState<TranslationMode>('talk-together');
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const productionTranslation = useProductionTranslation();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleModeChange = (mode: TranslationMode) => {
    setTranslationMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header with your actual logo */}
      <div className={`flex mb-6 ${
        translationMode === 'talk-together' && !isMobile ? 'justify-center' : 'justify-center'
      }`}>
        <button
          onClick={() => setShowSettings(true)}
          className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff'
          }}
        >
          <img 
            src={logoImage} 
            alt="Bridgit AI Logo" 
            className="w-12 h-12 object-contain"
          />
        </button>
      </div>

      {/* Translation Cards */}
      <div className="max-w-4xl mx-auto">
        {translationMode === 'just-me' ? (
          /* Single Card for Just Me Mode */
          <div className="flex justify-center">
            <TranslationCard 
              cardId="single-card"
              side="single" 
            />
          </div>
        ) : (
          /* Dual Cards for Talk Together Mode */
          <div className={`${
            isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-2 gap-4'
          }`}>
            <TranslationCard 
              cardId="card-1"
              side={isMobile ? 'top' : 'left'} 
              isFlipped={isMobile}
              isMobile={isMobile}
            />
            <TranslationCard 
              cardId="card-2"
              side={isMobile ? 'bottom' : 'right'} 
              isMobile={isMobile}
            />
          </div>
        )}
      </div>

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onVoiceSettings={() => {/* handle voice settings */}}
        onModeChange={handleModeChange}
        currentMode={translationMode}
        productionOrchestrator={productionTranslation.orchestrator}
      />
    </div>
  );
};

export default App;