import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageDropdownProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showFullName?: boolean;
  onError?: (error: string) => void;
  'aria-label'?: string;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  placeholder = "Select Language",
  className = "",
  disabled = false,
  showFullName = true,
  onError,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Validate props
  useEffect(() => {
    if (!Array.isArray(languages)) {
      const error = 'Languages prop must be an array';
      console.error(error);
      onError?.(error);
      return;
    }

    if (selectedLanguage && !languages.some(lang => lang.code === selectedLanguage)) {
      const error = `Selected language '${selectedLanguage}' not found in languages list`;
      console.warn(error);
      onError?.(error);
    }
  }, [languages, selectedLanguage, onError]);

  // Find the selected language object with validation
  const selectedLang = useMemo(() => {
    return languages.find(lang => lang.code === selectedLanguage) || null;
  }, [languages, selectedLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }, [disabled]);

  const handleLanguageSelect = useCallback((languageCode: string) => {
    if (disabled) return;
    
    try {
      onLanguageChange(languageCode);
      setIsOpen(false);
      buttonRef.current?.focus();
    } catch (error) {
      const errorMessage = `Failed to select language: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      onError?.(errorMessage);
    }
  }, [disabled, onLanguageChange, onError]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, languageCode?: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (languageCode) {
          handleLanguageSelect(languageCode);
        } else {
          handleToggleDropdown();
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        if (isOpen) {
          event.preventDefault();
        }
        break;
    }
  }, [handleLanguageSelect, handleToggleDropdown, isOpen]);

  // Function to get flag image URL with proper country code mapping
  const getFlagUrl = (languageCode: string) => {
    // Map language codes to proper country codes for flags
    const countryCodeMap: { [key: string]: string } = {
      'EN': 'us', // English -> United States flag
      'ES': 'es', // Spanish -> Spain
      'FR': 'fr', // French -> France
      'DE': 'de', // German -> Germany
      'IT': 'it', // Italian -> Italy
      'PT': 'br', // Portuguese -> Brazil
      'RU': 'ru', // Russian -> Russia
      'JA': 'jp', // Japanese -> Japan
      'KO': 'kr', // Korean -> South Korea
      'ZH': 'cn', // Chinese -> China
      'AR': 'sa', // Arabic -> Saudi Arabia
      'HI': 'in', // Hindi -> India
      'NL': 'nl', // Dutch -> Netherlands
      'PL': 'pl', // Polish -> Poland
      'SV': 'se', // Swedish -> Sweden
      'DA': 'dk', // Danish -> Denmark
      'FI': 'fi', // Finnish -> Finland
      'NO': 'no', // Norwegian -> Norway
      'CS': 'cz', // Czech -> Czech Republic
      'HU': 'hu', // Hungarian -> Hungary
      'RO': 'ro', // Romanian -> Romania
      'SK': 'sk', // Slovak -> Slovakia
      'SL': 'si', // Slovenian -> Slovenia
      'BG': 'bg', // Bulgarian -> Bulgaria
      'ET': 'ee', // Estonian -> Estonia
      'LV': 'lv', // Latvian -> Latvia
      'LT': 'lt', // Lithuanian -> Lithuania
      'UK': 'ua', // Ukrainian -> Ukraine
      'TR': 'tr', // Turkish -> Turkey
      'EL': 'gr', // Greek -> Greece
      'ID': 'id', // Indonesian -> Indonesia
      'MS': 'my', // Malay -> Malaysia
      'TH': 'th', // Thai -> Thailand
      'VI': 'vn', // Vietnamese -> Vietnam
    };
    
    const countryCode = countryCodeMap[languageCode.toUpperCase()] || languageCode.toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
  };

  const handleImageError = useCallback((languageCode: string) => {
    setFailedImages(prev => new Set(prev).add(languageCode));
  }, []);

  const shouldShowImage = useCallback((languageCode: string) => {
    return !failedImages.has(languageCode);
  }, [failedImages]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel || `Language selector. Currently selected: ${selectedLang?.name || 'None'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full h-full flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-1 transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          borderRadius: '8px',
          background: disabled ? '#f0f0f0' : '#e0e0e0',
          boxShadow: isOpen 
            ? 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff'
            : '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
          color: disabled ? '#999' : '#666',
          border: 'none',
          outline: 'none',
          minHeight: '60px'
        }}
      >
        {selectedLang ? (
          <>
            {shouldShowImage(selectedLang.code) ? (
              <img 
                src={getFlagUrl(selectedLang.code)} 
                alt={`${selectedLang.name} flag`}
                className="w-8 h-6 mb-1 object-cover rounded-sm"
                onError={() => handleImageError(selectedLang.code)}
              />
            ) : (
              <span className="text-2xl mb-1" role="img" aria-label={`${selectedLang.name} flag`}>
                {selectedLang.flag}
              </span>
            )}
            <span className="text-xs font-medium text-center leading-tight">
              {selectedLang.code}
            </span>
          </>
        ) : (
          <span className="text-center text-xs">{placeholder}</span>
        )}
        <span className="absolute top-1 right-1 text-xs opacity-60" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-hidden"
          style={{
            borderRadius: '8px',
            background: '#e0e0e0',
            boxShadow: '10px 10px 20px #bebebe, -10px -10px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Language List - No search field */}
          <div 
            className="max-h-48 overflow-y-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                onKeyDown={(e) => handleKeyDown(e, language.code)}
                role="option"
                aria-selected={selectedLanguage === language.code}
                className="w-full px-3 py-3 text-left text-xs sm:text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center gap-3"
                style={{
                  color: '#666',
                  background: selectedLanguage === language.code ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                }}
              >
                {shouldShowImage(language.code) ? (
                  <img 
                    src={getFlagUrl(language.code)} 
                    alt={`${language.name} flag`}
                    className="w-8 h-6 object-cover rounded-sm"
                    onError={() => handleImageError(language.code)}
                  />
                ) : (
                  <span className="text-2xl" role="img" aria-label={`${language.name} flag`}>
                    {language.flag}
                  </span>
                )}
                <span className="font-medium text-lg">{language.code}</span>
                {selectedLanguage === language.code && (
                  <span className="ml-auto text-blue-500" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;