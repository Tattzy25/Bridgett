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
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Filter languages based on search term
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return languages;
    
    const term = searchTerm.toLowerCase().trim();
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term)
    );
  }, [languages, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleToggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [disabled, isOpen]);

  const handleLanguageSelect = useCallback((languageCode: string) => {
    if (disabled) return;
    
    try {
      onLanguageChange(languageCode);
      setIsOpen(false);
      setSearchTerm('');
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
          // Focus previous item logic could be added here
        }
        break;
    }
  }, [handleLanguageSelect, handleToggleDropdown, isOpen]);

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
          borderRadius: '20px',
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
            <span className="text-2xl mb-1" role="img" aria-label={`${selectedLang.name} flag`}>
              {selectedLang.flag}
            </span>
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
            borderRadius: '15px',
            background: '#e0e0e0',
            boxShadow: '10px 10px 20px #bebebe, -10px -10px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-300">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search languages..."
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search languages"
            />
          </div>

          {/* Language List - Hidden Scrollbar */}
          <div 
            className="max-h-48 overflow-y-auto"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* Internet Explorer 10+ */
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none; /* Safari and Chrome */
              }
            `}</style>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language, index) => (
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
                  <span className="text-2xl" role="img" aria-label={`${language.name} flag`}>
                    {language.flag}
                  </span>
                  <span className="font-medium text-lg">{language.code}</span>
                  {selectedLanguage === language.code && (
                    <span className="ml-auto text-blue-500" aria-hidden="true">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-gray-500 text-sm">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;