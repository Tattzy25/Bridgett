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
  onError,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!Array.isArray(languages)) {
      const error = 'Languages prop must be an array';
      console.error(error);
      onError?.(error);
      return;
    }

    if (languages.some(lang => !lang.code || !lang.name)) {
      const error = 'All languages must have code and name properties';
      console.error(error);
      onError?.(error);
    }
  }, [languages, onError]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, handleClickOutside, handleEscape]);

  const selectedLanguageData = useMemo(() => {
    return languages.find(lang => lang.code === selectedLanguage);
  }, [languages, selectedLanguage]);

  const handleLanguageSelect = useCallback((languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onLanguageChange]);

  const handleImageError = useCallback((languageCode: string) => {
    setFailedImages(prev => new Set([...prev, languageCode]));
  }, []);

  const getFlagUrl = (languageCode: string) => {
    const countryCodeMap: { [key: string]: string } = {
      'EN': 'us', 'ES': 'es', 'FR': 'fr', 'DE': 'de', 'IT': 'it',
      'PT': 'br', 'RU': 'ru', 'JA': 'jp', 'KO': 'kr', 'ZH': 'cn',
      'AR': 'sa', 'HI': 'in', 'NL': 'nl', 'PL': 'pl', 'SV': 'se',
      'DA': 'dk', 'FI': 'fi', 'NO': 'no', 'CS': 'cz', 'HU': 'hu',
      'RO': 'ro', 'SK': 'sk', 'SL': 'si', 'BG': 'bg', 'ET': 'ee',
      'LV': 'lv', 'LT': 'lt', 'UK': 'ua', 'TR': 'tr', 'EL': 'gr',
      'ID': 'id', 'MS': 'my', 'TH': 'th', 'VI': 'vn'
    };
    
    const countryCode = countryCodeMap[languageCode] || languageCode.toLowerCase();
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  const renderFlag = (language: Language) => {
    if (failedImages.has(language.code)) {
      return <span className="text-lg">{language.flag}</span>;
    }

    return (
      <img
        src={getFlagUrl(language.code)}
        alt={`${language.name} flag`}
        className="w-6 h-4 object-cover rounded-sm"
        onError={() => handleImageError(language.code)}
        loading="lazy"
      />
    );
  };

  if (!languages.length) {
    return (
      <div className={`${className} opacity-50`}>
        <div 
          className="p-4 text-center text-gray-500 rounded-[20px]"
          style={{
            background: '#e0e0e0',
            boxShadow: 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff'
          }}
        >
          No languages available
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`
          w-full p-4 rounded-[20px] flex items-center justify-center gap-2 transition-all duration-200
          hover:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          background: '#e0e0e0',
          boxShadow: isOpen 
            ? 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff'
            : '8px 8px 16px #bebebe, -8px -8px 16px #ffffff'
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onMouseDown={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff';
          }
        }}
        onMouseUp={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.boxShadow = '8px 8px 16px #bebebe, -8px -8px 16px #ffffff';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.boxShadow = '8px 8px 16px #bebebe, -8px -8px 16px #ffffff';
          }
        }}
      >
        {selectedLanguageData ? (
          <>
            {renderFlag(selectedLanguageData)}
            <span className="text-sm font-medium text-gray-700 truncate">
              {selectedLanguageData.code}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}
        
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-[20px] shadow-lg z-50 max-h-60 overflow-y-auto scrollbar-hidden"
          style={{
            background: '#e0e0e0',
            boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff'
          }}
        >
          <div className="p-2" role="listbox" aria-label="Language options">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`
                  w-full flex items-center gap-3 p-3 rounded-[15px] transition-all duration-150
                  hover:scale-[0.98] focus:outline-none
                  ${selectedLanguage === language.code ? 'text-blue-700' : 'text-gray-700'}
                `}
                style={{
                  background: selectedLanguage === language.code ? '#d1d5db' : 'transparent',
                  boxShadow: selectedLanguage === language.code 
                    ? 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'
                    : 'none'
                }}
                onClick={() => handleLanguageSelect(language.code)}
                role="option"
                aria-selected={selectedLanguage === language.code}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff';
                }}
                onMouseUp={(e) => {
                  if (selectedLanguage !== language.code) {
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLanguage !== language.code) {
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {renderFlag(language)}
                <span className="text-sm font-medium truncate">{language.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{language.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
