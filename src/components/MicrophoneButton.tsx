import React from 'react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  disabled?: boolean;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  disabled = false
}) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    try {
      if (isRecording) {
        await onStopRecording();
      } else {
        await onStartRecording();
      }
    } catch (error) {
      console.error('Microphone button error:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: isRecording ? '#ff6b6b' : '#e0e0e0',
        boxShadow: isRecording 
          ? '10px 10px 20px #cc5555, -10px -10px 20px #ff8181'
          : '10px 10px 20px #bebebe, -10px -10px 20px #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto'
      }}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      aria-pressed={isRecording}
    >
      {/* Inner circle with inset effect */}
      <div 
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: isRecording ? '#ff6b6b' : '#e0e0e0',
          boxShadow: isRecording
            ? 'inset 6px 6px 12px #cc5555, inset -6px -6px 12px #ff8181'
            : 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <span style={{ 
          fontSize: '24px',
          color: isRecording ? '#fff' : '#666',
          userSelect: 'none'
        }}>
          {isRecording ? '⏹' : '🎤'}
        </span>
      </div>
    </button>
  );
};

export default MicrophoneButton;