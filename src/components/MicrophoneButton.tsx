// Add disabled prop to interface
interface MicrophoneButtonProps {
  isRecording: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  disabled?: boolean; // Add this prop
}

// Remove unused useState import
import React from 'react';

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onStartRecording,
  onStopRecording,
  isRecording
}) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
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
        cursor: 'pointer'
      }}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
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
          justifyContent: 'center'
        }}
      >
        <span style={{ 
          fontSize: '24px',
          color: isRecording ? '#fff' : '#666'
        }}>
          {isRecording ? '⏹' : '🎤'}
        </span>
      </div>
    </button>
  );
};

export default MicrophoneButton;