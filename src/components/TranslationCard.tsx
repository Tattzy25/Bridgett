import React, { useState, useEffect } from 'react';
import NeumorphicCard from './NeumorphicCard';
import LanguageSelector from './LanguageSelector';
import InputField from './InputField';
import MicrophoneButton from './MicrophoneButton';
import { useCardLanguageState } from '../hooks/useCardLanguageState';
import { useFSMTranslation } from '../hooks/useFSMTranslation';
import { TranslationState } from '../services/fsmOrchestrator';

interface TranslationCardProps {
  cardId: string;
  className?: string;
  side?: 'single' | 'left' | 'right' | 'top' | 'bottom';
  isFlipped?: boolean;
  isMobile?: boolean;
}

const TranslationCard: React.FC<TranslationCardProps> = ({
  side = 'single',
  isFlipped = false,
  isMobile = false,
  cardId,
  className = ''
}) => {
  const [inputText, setInputText] = useState('');
  
  const {
    fromLanguage,
    toLanguage,
    setFromLanguage,
    setToLanguage,
    swapLanguages
  } = useCardLanguageState(cardId);

  // Use FSM Translation hook for real functionality
  const {
    state,
    isRecording,
    isProcessing,
    error,
    originalText,
    detectedLanguage,
    startRecording,
    stopRecordingAndTranslate,
    clearError,
    setFromLanguage: setFSMFromLanguage,
    setToLanguage: setFSMToLanguage
  } = useFSMTranslation();

  // Sync language changes with FSM
  useEffect(() => {
    setFSMFromLanguage(fromLanguage);
  }, [fromLanguage, setFSMFromLanguage]);

  useEffect(() => {
    setFSMToLanguage(toLanguage);
  }, [toLanguage, setFSMToLanguage]);

  // Update display text based on FSM state
  useEffect(() => {
    if (originalText && state !== TranslationState.IDLE) {
      setInputText(originalText);
    }
  }, [originalText, state]);

  // Clear error when component unmounts or resets
  useEffect(() => {
    return () => {
      if (error) {
        clearError();
      }
    };
  }, [error, clearError]);

  const handleStartRecording = async () => {
    try {
      clearError();
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecordingAndTranslate();
    } catch (error) {
      console.error('Failed to stop recording and translate:', error);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
  };

  const getStatusText = () => {
    if (error) return `Error: ${error.message}`;
    if (detectedLanguage && state !== TranslationState.IDLE) {
      return `Detected: ${detectedLanguage}`;
    }
    switch (state) {
      case TranslationState.RECORDING: return 'Listening...';
      case TranslationState.TRANSCRIBING: return 'Processing...';
      case TranslationState.TRANSLATING: return 'Translating...';
      case TranslationState.SPEAKING: return 'Speaking...';
      default: return 'Translation will appear here';
    }
  };

  // Determine if this card should be flipped
  const shouldFlip = isMobile && side === 'top' && isFlipped;
  
  return (
    <div 
      className={`transition-transform duration-300 ${
        shouldFlip ? 'transform rotate-180' : ''
      }`}
    >
      <NeumorphicCard className="p-6">
        {/* Card content - when flipped, the content inside should be flipped back */}
        <div className={shouldFlip ? 'transform rotate-180' : ''}>
          {/* Language Selector */}
          <LanguageSelector
            fromLanguage={fromLanguage}
            toLanguage={toLanguage}
            onFromLanguageChange={setFromLanguage}
            onToLanguageChange={setToLanguage}
            onSwapLanguages={swapLanguages}
            cardId={cardId}
          />
          
          {/* Input Field */}
          <InputField
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter text to translate"
            size="large"
            className="mb-4"
          />
          
          {/* Status Indicator - Where "Translation will appear here" was */}
          <div 
            className="mx-auto mb-4 px-4 py-2 text-sm text-center flex items-center justify-center"
            style={{
              width: '80%',
              height: '40px',
              borderRadius: '8px',
              background: '#e0e0e0',
              boxShadow: 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff',
              color: error ? '#ef4444' : '#666',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {getStatusText()}
          </div>
          
          {/* Single Microphone Button - Centered */}
          <div className="flex justify-center">
            <MicrophoneButton
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              disabled={isProcessing}
            />
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default TranslationCard;
