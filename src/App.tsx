// Remove unused React import since you're using React 17+ JSX transform
import { useState } from 'react';
import TranslationCard from './components/TranslationCard';
import SettingsMenu from './components/SettingsMenu';
import logoImage from './components/bridgit ai logo.png';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleVoiceSettings = () => {
    console.log('Voice settings triggered');
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#e0e0e0' }}>
      <div className="flex items-center justify-center min-h-screen relative px-4 py-8">
        {/* Mobile: Stack vertically, Tablet+: Side by side */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-32 w-full max-w-7xl">
          {/* Left Card */}
          <TranslationCard 
            cardId="card-1"
            className="w-full max-w-sm lg:max-w-md xl:max-w-lg"
          />
          
          {/* Right Card */}
          <TranslationCard 
            cardId="card-2"
            className="w-full max-w-sm lg:max-w-md xl:max-w-lg"
          />
        </div>
        
        {/* Central Logo - Clickable Menu Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <button
            onClick={handleSettingsToggle}
            className="rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto"
            style={{
              width: '80px',
              height: '80px',
              background: '#e0e0e0',
              boxShadow: isSettingsOpen 
                ? 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff'
                : '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
            }}
            aria-label="Open settings menu"
          >
            <img 
              src={logoImage} 
              alt="Bridgit AI Logo" 
              className="w-12 h-12 object-contain"
            />
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onVoiceSettings={handleVoiceSettings}
      />
    </div>
  );
}

export default App;