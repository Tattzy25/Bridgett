import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './MobileMenu.css';
import BlueBack from './svg componants/BlueBack';
import PinkBack from './svg componants/PinkBack';
import BlueBubble from './svg componants/BlueBubble';
import PinkBubble from './svg componants/PinkBubble';
import BlueButton from './svg componants/BlueButton';
import PinkButton from './svg componants/PinkButton';
import BlueInd from './svg componants/BlueInd';
import PinkInd from './svg componants/PinkInd';
import BlueInput from './svg componants/BlueInput';
import PinkInput from './svg componants/PinkInput';
import SmallWave from './svg componants/SmallWave';
import BigWave from './svg componants/BigWave';
import Swap from './svg componants/Swap';

interface MobileMenuProps {
  onLanguageSwap: () => void;
  onStartRecording: (speaker: 'user1' | 'user2') => void;
  onStopRecording: () => void;
  currentSpeaker: 'user1' | 'user2' | null;
  isProcessing: boolean;
  isRecording: boolean;
  user1Language: { name: string; flag: string } | null;
  user2Language: { name: string; flag: string } | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  onLanguageSwap,
  onStartRecording,
  onStopRecording,
  currentSpeaker,
  isProcessing,
  isRecording,
  user1Language,
  user2Language
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRecordingAction = (speaker: 'user1' | 'user2') => {
    if (currentSpeaker === speaker) {
      onStopRecording();
    } else {
      onStartRecording(speaker);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed inset-x-0 flex flex-col items-center z-50">
      {/* Menu Items (conditionally rendered) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="rounded-3xl shadow-2xl p-5 m-4 animate-fade-in-up max-w-xs w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 z-0">
              <BlueBack className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 z-0">
              <PinkBack className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-4 relative z-10">
              {/* Header */}
              <div className="text-center mb-2">
                <BigWave className="w-16 h-16 mx-auto" />
                <h3 className="text-white font-bold text-xl">Bridgit AI</h3>
                <p className="text-white/80 text-sm">Select a speaker</p>
              </div>
              
              {/* Speaker One Button - Blue styling */}
              <div 
                onClick={() => handleRecordingAction('user1')}
                className="relative cursor-pointer"
              >
                <BlueButton className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center p-3">
                  <div className="text-2xl mr-3">{user1Language?.flag || '🌐'}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{user1Language?.name || 'english'}</div>
                    <div className="text-xs text-blue-100">Speaker 1</div>
                  </div>
                  {currentSpeaker === 'user1' && isRecording && (
                    <BlueInd className="w-6 h-6 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Speaker Two Button - Red styling */}
              <div 
                onClick={() => handleRecordingAction('user2')}
                className="relative cursor-pointer"
              >
                <PinkButton className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center p-3">
                  <div className="text-2xl mr-3">{user2Language?.flag || '🌐'}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{user2Language?.name || 'spanish'}</div>
                    <div className="text-xs text-pink-100">Speaker 2</div>
                  </div>
                  {currentSpeaker === 'user2' && isRecording && (
                    <PinkInd className="w-6 h-6 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Type to Speak Button */}
              <div className="relative cursor-pointer">
                <BlueInput className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-medium">Type To Speak</span>
                </div>
              </div>
              
              {/* Click Bubble to Translate Button */}
              <div className="relative cursor-pointer">
                <PinkInput className="w-full h-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-medium">Click Bubble To Translate</span>
                </div>
              </div>

              {/* Swap Languages Button */}
              <div 
                onClick={() => {
                  onLanguageSwap();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-3 text-white cursor-pointer"
              >
                <Swap className="w-8 h-8" />
                <span>Swap Languages</span>
              </div>
              
              {/* Close Button */}
              <div 
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 text-center text-white/80 text-sm cursor-pointer hover:text-white"
              >
                Close Menu
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Button - Positioned at the bottom center */}
      <div className="fixed bottom-10 inset-x-0 flex justify-center">
        <div className="relative">
          {/* Glowing effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-50"></div>
          
          {/* Main button */}
          <button
            onClick={toggleMenu}
            className="relative z-10"
            disabled={isProcessing}
          >
            {isMenuOpen ? (
              <PinkBubble className="w-16 h-16 mobile-menu-button open" />
            ) : (
              <BlueBubble className="w-16 h-16 mobile-menu-button" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {isProcessing ? (
                <LoadingSpinner size="md" className="text-white" />
              ) : (
                <div className="text-white text-3xl font-bold">B</div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {(isRecording || isProcessing) && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center">
          <div className="relative">
            <SmallWave className="w-48" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {isRecording ? (
                <span className="text-white">Recording {currentSpeaker === 'user1' ? user1Language?.name : user2Language?.name}...</span>
              ) : (
                <span className="text-white">Processing...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;