import React, { useState } from 'react';
import NeumorphicCard from './NeumorphicCard';
import LanguageSelector from './LanguageSelector';
import InputField from './InputField';
import MicrophoneButton from './MicrophoneButton';
import { useCardLanguageState } from '../hooks/useCardLanguageState'; // Updated import

interface TranslationCardProps {
  cardId: string;
  className?: string;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ cardId, className }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const {
    fromLanguage,
    toLanguage,
    setFromLanguage,
    setToLanguage,
    swapLanguages
  } = useCardLanguageState(cardId); // Updated hook usage

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement stop recording and transcription logic
  };

  return (
    <NeumorphicCard 
      width="100%" 
      height="auto"
      className={className}
    >
      <div className="flex flex-col items-center justify-between h-full w-full p-4 sm:p-6 min-h-[400px] sm:min-h-[500px]">
        <LanguageSelector
          fromLanguage={fromLanguage}
          toLanguage={toLanguage}
          onFromLanguageChange={setFromLanguage}
          onToLanguageChange={setToLanguage}
          onSwapLanguages={swapLanguages}
          cardId={cardId}
        />
        
        <InputField
          value={inputText}
          onChange={setInputText}
          placeholder="Enter text to translate"
          size="large"
          className="mb-4 sm:mb-5"
        />
        
        <InputField
          value={outputText}
          onChange={setOutputText}
          placeholder="Translation will appear here"
          size="small"
          className="w-3/5 mb-6 sm:mb-10 self-start"
        />
        
        <MicrophoneButton
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          isRecording={isRecording}
        />
      </div>
    </NeumorphicCard>
  );
};

export default TranslationCard;