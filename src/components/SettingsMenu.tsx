import React, { useRef, useEffect, useState } from 'react';
import NeumorphicCard from './NeumorphicCard';
import SessionManager from './SessionManager';
import ProductionOrchestrator from '../services/productionOrchestrator';

type TranslationMode = 'just-me' | 'talk-together';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSettings: () => void;
  onModeChange: (mode: TranslationMode) => void;
  currentMode: TranslationMode;
  productionOrchestrator: ProductionOrchestrator;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  onVoiceSettings,
  onModeChange,
  currentMode,
  productionOrchestrator
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [sessionMode, setSessionMode] = useState<'host' | 'join'>('host');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show Session Manager
  if (showSessionManager) {
    return (
      <SessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        productionOrchestrator={productionOrchestrator}
        mode={sessionMode} // ✅ Mode prop is correctly passed
      />
    );
  }

  // Main Settings Menu - Updated Layout
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div ref={menuRef} className="relative">
        <NeumorphicCard className="w-96 p-8">
          <div className="space-y-6">
            {/* Centered Header with Close Button */}
            <div className="flex items-center justify-center relative mb-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center">Bridgit-AI</h2>
              <button
                onClick={onClose}
                className="absolute right-0 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-95"
                style={{
                  background: '#e0e0e0',
                  boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Three Action Buttons Below Title - Using Your CSS Style */}
            <div className="flex justify-center mb-8">
              <div 
                className="flex flex-row justify-around p-1 rounded-2xl"
                style={{
                  backgroundColor: '#e4e4e4',
                  borderRadius: '15px',
                  boxShadow: '10px 10px 20px #c4c4c4, -10px -10px 20px #ffffff'
                }}
              >
                <NeumorphicButton
                  label="host"
                  icon={<svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                  // Host button
                  onClick={() => {
                    setSessionMode('host');
                    setShowSessionManager(true);
                  }}
                  
                  // Join button  
                  onClick={() => {
                    setSessionMode('join');
                    setShowSessionManager(true);
                  }}
                  
                  // End button (uses host mode to show end session functionality)
                  onClick={() => {
                    setSessionMode('host');
                    setShowSessionManager(true);
                  }}
                  colorClass="host-btn"
                />
                <NeumorphicButton
                  label="join"
                  icon={<svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                  onClick={() => {
                    setSessionMode('join');
                    setShowSessionManager(true);
                  }}
                  colorClass="join-btn"
                />
                <NeumorphicButton
                  label="end"
                  icon={<svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" /></svg>}
                  onClick={() => {
                    // For end session, we can use host mode since it will show the end session functionality
                    setSessionMode('host');
                    setShowSessionManager(true);
                  }}
                  colorClass="end-btn"
                />
              </div>
            </div>

            {/* Settings Grid - 2x4 with proper icons and functionality */}
            <div className="grid grid-cols-4 gap-4">
              {/* Row 1 */}
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label="Just Me"
                isActive={currentMode === 'just-me'}
                onClick={() => onModeChange('just-me')}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                label="Talk Together"
                isActive={currentMode === 'talk-together'}
                onClick={() => onModeChange('talk-together')}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                label="Sound"
                onClick={onVoiceSettings}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 01-6 0z" /></svg>}
                label="Settings"
                onClick={() => {/* handle general settings */}}
              />
              
              {/* Row 2 */}
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                label="Support"
                onClick={() => {/* handle support */}}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Help"
                onClick={() => {/* handle help */}}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                label="About"
                onClick={() => {/* handle about */}}
              />
              <SettingsCard
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>}
                label="Share"
                onClick={() => {/* handle share */}}
              />
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

// Neumorphic Button Component (using your CSS styling)
interface NeumorphicButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ label, icon, onClick, colorClass }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-4 py-3 mx-1 rounded-xl font-bold text-sm uppercase transition-all duration-200 ${colorClass}`}
      style={{
        backgroundColor: '#e4e4e4',
        border: 'none',
        boxShadow: 'inset 5px 5px 5px #c4c4c4, inset -5px -5px 5px #ffffff',
        color: '#333',
        cursor: 'pointer',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'inset 5px 5px 5px #c4c4c4, inset -5px -5px 5px #ffffff';
      }}
    >
      {icon}
      {label}
    </button>
  );
};

// Settings Card Component (for the 2x4 grid)
interface SettingsCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, label, onClick, isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 w-16 h-16 rounded-xl transition-all duration-200 hover:scale-95 ${
        isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
      }`}
      style={{
        background: isActive ? '#d1ecf1' : '#e0e0e0',
        boxShadow: isActive 
          ? 'inset 2px 2px 4px #a8d4da, inset -2px -2px 4px #ffffff'
          : '4px 4px 8px #bebebe, -4px -4px 8px #ffffff'
      }}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default SettingsMenu;
export type { TranslationMode };