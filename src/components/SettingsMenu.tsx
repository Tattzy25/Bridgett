import React, { useRef, useEffect } from 'react';
import NeumorphicCard from './NeumorphicCard';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSettings: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  onVoiceSettings
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div ref={menuRef} className="relative">
        <NeumorphicCard className="w-80 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
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

            <SettingsButton
              icon="🎤"
              label="Voice Settings"
              onClick={onVoiceSettings}
            />
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

interface SettingsButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl flex items-center space-x-3 text-left transition-all duration-200 hover:scale-[0.98]"
      style={{
        background: '#e0e0e0',
        boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = '8px 8px 16px #bebebe, -8px -8px 16px #ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '8px 8px 16px #bebebe, -8px -8px 16px #ffffff';
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-700 font-medium">{label}</span>
    </button>
  );
};

export default SettingsMenu;