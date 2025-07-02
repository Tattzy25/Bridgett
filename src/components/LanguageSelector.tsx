import React, { useState, useEffect } from 'react';
import LanguageDropdown from './LanguageDropdown';
import SwapButton from './SwapButton';
import DeepLService from '../services/deepLService';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  fromLanguage: string;
  toLanguage: string;
  onFromLanguageChange: (language: string) => void;
  onToLanguageChange: (language: string) => void;
  onSwapLanguages: () => void;
  cardId: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  fromLanguage,
  toLanguage,
  onFromLanguageChange,
  onToLanguageChange,
  onSwapLanguages,
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const deepLService = new DeepLService();
        await deepLService.initializeLanguages();
        const supportedLanguages = deepLService.getSupportedLanguages();
        setLanguages(supportedLanguages);
      } catch (error) {
        console.error('Failed to load languages:', error);
        // Enhanced fallback with all DeepL supported languages
        setLanguages([
          { code: 'EN', name: 'English', flag: '🇺🇸' },
          { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
          { code: 'FR', name: 'French', flag: '🇫🇷' },
          { code: 'DE', name: 'German', flag: '🇩🇪' },
          { code: 'IT', name: 'Italian', flag: '🇮🇹' },
          { code: 'PT', name: 'Portuguese', flag: '🇧🇷' },
          { code: 'RU', name: 'Russian', flag: '🇷🇺' },
          { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
          { code: 'KO', name: 'Korean', flag: '🇰🇷' },
          { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
          { code: 'AR', name: 'Arabic', flag: '🇸🇦' },
          { code: 'HI', name: 'Hindi', flag: '🇮🇳' },
          { code: 'NL', name: 'Dutch', flag: '🇳🇱' },
          { code: 'PL', name: 'Polish', flag: '🇵🇱' },
          { code: 'SV', name: 'Swedish', flag: '🇸🇪' },
          { code: 'DA', name: 'Danish', flag: '🇩🇰' },
          { code: 'FI', name: 'Finnish', flag: '🇫🇮' },
          { code: 'NO', name: 'Norwegian', flag: '🇳🇴' },
          { code: 'CS', name: 'Czech', flag: '🇨🇿' },
          { code: 'HU', name: 'Hungarian', flag: '🇭🇺' },
          { code: 'RO', name: 'Romanian', flag: '🇷🇴' },
          { code: 'SK', name: 'Slovak', flag: '🇸🇰' },
          { code: 'SL', name: 'Slovenian', flag: '🇸🇮' },
          { code: 'BG', name: 'Bulgarian', flag: '🇧🇬' },
          { code: 'ET', name: 'Estonian', flag: '🇪🇪' },
          { code: 'LV', name: 'Latvian', flag: '🇱🇻' },
          { code: 'LT', name: 'Lithuanian', flag: '🇱🇹' },
          { code: 'UK', name: 'Ukrainian', flag: '🇺🇦' },
          { code: 'TR', name: 'Turkish', flag: '🇹🇷' },
          { code: 'EL', name: 'Greek', flag: '🇬🇷' },
          { code: 'ID', name: 'Indonesian', flag: '🇮🇩' },
          { code: 'MS', name: 'Malay', flag: '🇲🇾' },
          { code: 'TH', name: 'Thai', flag: '🇹🇭' },
          { code: 'VI', name: 'Vietnamese', flag: '🇻🇳' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-between w-full mb-4 sm:mb-6">
        <div className="flex-1 max-w-[100px] sm:max-w-[120px] h-[60px] bg-gray-200 rounded-[20px] animate-pulse"></div>
        <SwapButton onClick={onSwapLanguages} />
        <div className="flex-1 max-w-[100px] sm:max-w-[120px] h-[60px] bg-gray-200 rounded-[20px] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full mb-4 sm:mb-6">
      <LanguageDropdown
        languages={languages}
        selectedLanguage={fromLanguage}
        onLanguageChange={onFromLanguageChange}
        placeholder="From"
        className="flex-1 max-w-[100px] sm:max-w-[120px]"
        aria-label="Select source language"
      />
      
      <SwapButton onClick={onSwapLanguages} />
      
      <LanguageDropdown
        languages={languages}
        selectedLanguage={toLanguage}
        onLanguageChange={onToLanguageChange}
        placeholder="To"
        className="flex-1 max-w-[100px] sm:max-w-[120px]"
        aria-label="Select target language"
      />
    </div>
  );
};

export default LanguageSelector;