import React from 'react';
import TranslationCard from './components/TranslationCard';
import logoImage from './components/bridgit ai logo.png';

function App() {
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
        
        {/* Central Logo Overlay - Responsive positioning */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="rounded-2xl sm:rounded-3xl flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              background: '#e0e0e0',
              boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <img 
              src={logoImage} 
              alt="Bridgit AI Logo" 
              className="object-contain"
              style={{
                width: '90px',
                height: '90px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;