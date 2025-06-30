import React from 'react';
import BlueBack from './svg componants/BlueBack';
import PinkBack from './svg componants/PinkBack';
import BlueButton from './svg componants/BlueButton';
import PinkButton from './svg componants/PinkButton';
import BlueInd from './svg componants/BlueInd';
import PinkInd from './svg componants/PinkInd';
import BlueInput from './svg componants/BlueInput';
import PinkInput from './svg componants/PinkInput';
import BForBridgit from './svg componants/BForBridgit';
import Swap from './svg componants/Swap';
import BigWave from './svg componants/BigWave';
import SmallWave from './svg componants/SmallWave';
import BlueBubble from './svg componants/BlueBubble';
import PinkBubble from './svg componants/PinkBubble';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface DesktopLayoutProps {
  onLanguageSwap: () => void;
  onStartRecording: (speaker: 'user1' | 'user2') => void;
  onStopRecording: () => void;
  currentSpeaker: 'user1' | 'user2' | null;
  isProcessing: boolean;
  isRecording: boolean;
  user1Language: Language | null;
  user2Language: Language | null;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  onLanguageSwap,
  onStartRecording,
  onStopRecording,
  currentSpeaker,
  isProcessing,
  isRecording,
  user1Language,
  user2Language,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
      <div className="flex items-center justify-center space-x-8 max-w-7xl w-full">
        {/* Blue Section (Left Side) */}
        <div className="relative flex-1 max-w-md">
          {/* Blue Background */}
          <div className="relative">
            <BlueBack className="w-full h-auto" />
            
            {/* Content overlay on blue background */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6">
              {/* Blue Bubble at top */}
              <div className="relative">
                <BlueBubble className="w-24 h-24" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <SmallWave className="w-16 h-16" />
                </div>
              </div>
              
              {/* Click Bubble to Translate button */}
              <div className="relative">
                <BlueButton 
                  className="w-48 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => currentSpeaker === 'user1' ? onStopRecording() : onStartRecording('user1')}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentSpeaker === 'user1' ? 'Stop Recording' : 'Click Bubble to Translate'}
                  </span>
                </div>
              </div>
              
              {/* Type to Speak input */}
              <div className="relative">
                <BlueInput className="w-56 h-12" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Type To Speak</span>
                </div>
              </div>
              
              {/* Language selection */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <BlueInd className="w-20 h-16" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">{user1Language?.flag || '🇺🇸'}</div>
                    <span className="text-white text-xs font-bold">
                      {user1Language?.code || 'english'}
                    </span>
                  </div>
                </div>
                
                <Swap 
                  className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={onLanguageSwap}
                />
                
                <div className="relative">
                  <BlueInd className="w-20 h-16" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">{user2Language?.flag || '🇲🇽'}</div>
                    <span className="text-white text-xs font-bold">
                      {user2Language?.code || 'spanish'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center B Button */}
        <div className="relative z-10">
          <div className="relative">
            <BForBridgit className="w-32 h-32" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BigWave className="w-24 h-24" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text">
                B
              </span>
            </div>
          </div>
        </div>
        
        {/* Pink Section (Right Side) */}
        <div className="relative flex-1 max-w-md">
          {/* Pink Background */}
          <div className="relative">
            <PinkBack className="w-full h-auto" />
            
            {/* Content overlay on pink background */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6">
              {/* Pink Bubble at top */}
              <div className="relative">
                <PinkBubble className="w-24 h-24" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <SmallWave className="w-16 h-16" />
                </div>
              </div>
              
              {/* Click Bubble to Translate button */}
              <div className="relative">
                <PinkButton 
                  className="w-48 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => currentSpeaker === 'user2' ? onStopRecording() : onStartRecording('user2')}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentSpeaker === 'user2' ? 'Stop Recording' : 'Click Bubble to Translate'}
                  </span>
                </div>
              </div>
              
              {/* Type to Speak input */}
              <div className="relative">
                <PinkInput className="w-56 h-12" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Type To Speak</span>
                </div>
              </div>
              
              {/* Language selection */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <PinkInd className="w-20 h-16" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">{user2Language?.flag || '🇲🇽'}</div>
                    <span className="text-white text-xs font-bold">
                      {user2Language?.code || 'spanish'}
                    </span>
                  </div>
                </div>
                
                <Swap 
                  className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={onLanguageSwap}
                />
                
                <div className="relative">
                  <PinkInd className="w-20 h-16" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">{user1Language?.flag || '🇺🇸'}</div>
                    <span className="text-white text-xs font-bold">
                      {user1Language?.code || 'english'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status indicator at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`px-6 py-3 rounded-full text-sm font-medium ${
          isRecording
            ? 'bg-green-100 text-green-800 border border-green-200'
            : isProcessing
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isRecording
            ? `Recording ${currentSpeaker === 'user1' ? user1Language?.name : user2Language?.name}...`
            : isProcessing
            ? 'Processing with Brigitte AI...'
            : 'Click bubble to start conversation'
          }
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;