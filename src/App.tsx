// Remove unused React import if using React 17+
// import React from 'react'; // Remove this line
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
        
        {/* Central Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="rounded-2xl sm:rounded-3xl flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              background: '#e0e0e0',
              boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
            }}
          >
            <img 
              src={logoImage} 
              alt="Bridgit AI Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;