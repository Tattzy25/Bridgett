import React from 'react';
import { TranslationState } from '../services/fsmOrchestrator';

interface StateIndicatorProps {
  state: TranslationState;
  className?: string;
}

const StateIndicator: React.FC<StateIndicatorProps> = ({ state, className = '' }) => {
  const getStateDisplay = () => {
    switch (state) {
      case TranslationState.RECORDING:
        return {
          icon: '🎤',
          text: 'Recording...',
          animation: 'animate-pulse',
          color: 'text-red-500'
        };
      case TranslationState.TRANSCRIBING:
        return {
          icon: '📝',
          text: 'Transcribing...',
          animation: 'animate-spin',
          color: 'text-blue-500'
        };
      case TranslationState.TRANSLATING:
        return {
          icon: '🔄',
          text: 'Translating...',
          animation: 'animate-spin',
          color: 'text-yellow-500'
        };
      case TranslationState.SPEAKING:
        return {
          icon: '🔊',
          text: 'Speaking...',
          animation: 'animate-bounce',
          color: 'text-green-500'
        };
      case TranslationState.IDLE:
      default:
        return {
          icon: '⏸️',
          text: 'Ready',
          animation: '',
          color: 'text-gray-500'
        };
    }
  };

  const { icon, text, animation, color } = getStateDisplay();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`text-lg ${animation}`}>{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{text}</span>
    </div>
  );
};

export default StateIndicator;