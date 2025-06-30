import { getApiKey } from '../config/apiKeys';

interface DeepLLanguage {
  language: string;
  name: string;
  supports_formality?: boolean;
}

interface DeepLTranslationResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}


interface DeepLUsageResponse {
  character_count: number;
  character_limit: number;
}

class DeepLService {
  private apiKey: string;
  private baseUrl: string;
  private supportedLanguages: Map<string, DeepLLanguage> = new Map();
  private isApiAvailable: boolean = false;

  constructor() {
    this.apiKey = getApiKey('DEEPL_API_KEY');
    this.baseUrl = getApiKey('DEEPL_API_URL') || 'https://api-free.deepl.com/v2';
    
    if (!this.apiKey || this.apiKey === 'your_deepl_api_key_here') {
      console.warn('DeepL API key is not configured. Using fallback languages.');
      this.initializeFallbackLanguages();
    }
  }

  async initializeLanguages(): Promise<void> {
    // Always initialize fallback languages first
    this.initializeFallbackLanguages();

    // If no API key is configured, skip API calls
    if (!this.apiKey || this.apiKey === 'your_deepl_api_key_here') {
      console.info('DeepL API key not configured. Using fallback language list.');
      return;
    }

    try {
      // Try to get languages from API
      const [sourceLanguages, targetLanguages] = await Promise.all([
        this.getSourceLanguages(),
        this.getTargetLanguages()
      ]);

      // Only update languages if we successfully got them from the API
      if (sourceLanguages && targetLanguages) {
        // Combine and deduplicate languages
        const allLanguages = new Map<string, DeepLLanguage>();
        
        sourceLanguages.forEach(lang => {
          allLanguages.set(lang.language, lang);
        });
        
        targetLanguages.forEach(lang => {
          if (allLanguages.has(lang.language)) {
            // Merge properties if language exists in both
            const existing = allLanguages.get(lang.language)!;
            allLanguages.set(lang.language, { ...existing, ...lang });
          } else {
            allLanguages.set(lang.language, lang);
          }
        });

        this.supportedLanguages = allLanguages;
        this.isApiAvailable = true;
        console.info(`DeepL API connected successfully. ${allLanguages.size} languages available.`);
      }
    } catch (error) {
      console.warn('DeepL API is not available. Using fallback languages.', error);
      this.isApiAvailable = false;
      // Fallback languages are already initialized, so we don't need to do anything else
    }
  }



  private initializeFallbackLanguages(): void {
    const fallbackLanguages: DeepLLanguage[] = [
      { language: 'EN', name: 'English' },
      { language: 'ES', name: 'Spanish' },
      { language: 'FR', name: 'French' },
      { language: 'DE', name: 'German' },
      { language: 'IT', name: 'Italian' },
      { language: 'PT', name: 'Portuguese' },
      { language: 'RU', name: 'Russian' },
      { language: 'JA', name: 'Japanese' },
      { language: 'KO', name: 'Korean' },
      { language: 'ZH', name: 'Chinese' },
      { language: 'AR', name: 'Arabic' },
      { language: 'HI', name: 'Hindi' },
      { language: 'NL', name: 'Dutch' },
      { language: 'PL', name: 'Polish' },
      { language: 'SV', name: 'Swedish' },
      { language: 'DA', name: 'Danish' },
      { language: 'FI', name: 'Finnish' },
      { language: 'NO', name: 'Norwegian' },
      { language: 'CS', name: 'Czech' },
      { language: 'HU', name: 'Hungarian' },
      { language: 'RO', name: 'Romanian' },
      { language: 'SK', name: 'Slovak' },
      { language: 'SL', name: 'Slovenian' },
      { language: 'BG', name: 'Bulgarian' },
      { language: 'ET', name: 'Estonian' },
      { language: 'LV', name: 'Latvian' },
      { language: 'LT', name: 'Lithuanian' },
      { language: 'UK', name: 'Ukrainian' },
      { language: 'TR', name: 'Turkish' },
      { language: 'EL', name: 'Greek' },
      { language: 'ID', name: 'Indonesian' },
      { language: 'MS', name: 'Malay' },
      { language: 'TH', name: 'Thai' },
      { language: 'VI', name: 'Vietnamese' },
    ];

    this.supportedLanguages.clear();
    fallbackLanguages.forEach(lang => {
      this.supportedLanguages.set(lang.language, lang);
    });
  }

  async getSourceLanguages(): Promise<DeepLLanguage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/languages?type=source`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
      }

      const languages: DeepLLanguage[] = await response.json();
      return languages;
    } catch (error) {
      console.error('Error fetching DeepL source languages:', error);
      throw error; // Re-throw to be handled by initializeLanguages
    }
  }

  async getTargetLanguages(): Promise<DeepLLanguage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/languages?type=target`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
      }

      const languages: DeepLLanguage[] = await response.json();
      return languages;
    } catch (error) {
      console.error('Error fetching DeepL target languages:', error);
      throw error; // Re-throw to be handled by initializeLanguages
    }
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ translatedText: string; detectedSourceLanguage: string }> {
    if (!text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    // If API is not available, return a mock translation
    if (!this.isApiAvailable) {
      console.warn('DeepL API not available. Returning mock translation.');
      return {
        translatedText: `[Mock Translation] ${text}`,
        detectedSourceLanguage: sourceLanguage || 'EN',
      };
    }

    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      formData.append('target_lang', this.normalizeLanguageCode(targetLanguage));
      
      if (sourceLanguage) {
        formData.append('source_lang', this.normalizeLanguageCode(sourceLanguage));
      }

      // Additional parameters for better translation quality
      formData.append('preserve_formatting', '1');
      formData.append('formality', 'default');

      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        },
        body: formData,
        signal: AbortSignal.timeout(15000), // 15 second timeout for translation
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepL translation error: ${response.status} - ${errorText}`);
      }

      const data: DeepLTranslationResponse = await response.json();

      if (!data.translations || data.translations.length === 0) {
        throw new Error('No translation received from DeepL');
      }

      const translation = data.translations[0];

      return {
        translatedText: translation.text,
        detectedSourceLanguage: translation.detected_source_language,
      };
    } catch (error) {
      console.error('Error translating with DeepL:', error);
      
      // Fallback to mock translation if API fails
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('Network error')
      )) {
        console.warn('DeepL API request failed. Returning mock translation.');
        return {
          translatedText: `[Translation Unavailable] ${text}`,
          detectedSourceLanguage: sourceLanguage || 'EN',
        };
      }
      
      throw new Error('Failed to translate text with DeepL');
    }
  }

  async getUsageInfo(): Promise<DeepLUsageResponse> {
    if (!this.isApiAvailable) {
      // Return mock usage info when API is not available
      return {
        character_count: 0,
        character_limit: 500000,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/usage`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching DeepL usage info:', error);
      throw new Error('Failed to fetch DeepL usage information');
    }
  }

  getSupportedLanguages(): Array<{ code: string; name: string; flag: string }> {
    const languageFlags: { [key: string]: string } = {
      'EN': '🇺🇸',
      'ES': '🇪🇸',
      'FR': '🇫🇷',
      'DE': '🇩🇪',
      'IT': '🇮🇹',
      'PT': '🇧🇷',
      'RU': '🇷🇺',
      'JA': '🇯🇵',
      'KO': '🇰🇷',
      'ZH': '🇨🇳',
      'AR': '🇸🇦',
      'HI': '🇮🇳',
      'NL': '🇳🇱',
      'PL': '🇵🇱',
      'SV': '🇸🇪',
      'DA': '🇩🇰',
      'FI': '🇫🇮',
      'NO': '🇳🇴',
      'CS': '🇨🇿',
      'HU': '🇭🇺',
      'RO': '🇷🇴',
      'SK': '🇸🇰',
      'SL': '🇸🇮',
      'BG': '🇧🇬',
      'ET': '🇪🇪',
      'LV': '🇱🇻',
      'LT': '🇱🇹',
      'UK': '🇺🇦',
      'TR': '🇹🇷',
      'EL': '🇬🇷',
      'ID': '🇮🇩',
      'MS': '🇲🇾',
      'TH': '🇹🇭',
      'VI': '🇻🇳',
    };

    return Array.from(this.supportedLanguages.values()).map(lang => ({
      code: lang.language,
      name: lang.name,
      flag: languageFlags[lang.language] || '🌐',
    }));
  }

  private normalizeLanguageCode(language: string): string {
    // Convert language names to DeepL codes
    const languageMap: { [key: string]: string } = {
      'English': 'EN',
      'Spanish': 'ES',
      'French': 'FR',
      'German': 'DE',
      'Italian': 'IT',
      'Portuguese': 'PT',
      'Russian': 'RU',
      'Japanese': 'JA',
      'Korean': 'KO',
      'Chinese': 'ZH',
      'Arabic': 'AR',
      'Hindi': 'HI',
      'Dutch': 'NL',
      'Polish': 'PL',
      'Swedish': 'SV',
      'Danish': 'DA',
      'Finnish': 'FI',
      'Norwegian': 'NO',
      'Czech': 'CS',
      'Hungarian': 'HU',
      'Romanian': 'RO',
      'Slovak': 'SK',
      'Slovenian': 'SL',
      'Bulgarian': 'BG',
      'Estonian': 'ET',
      'Latvian': 'LV',
      'Lithuanian': 'LT',
      'Ukrainian': 'UK',
      'Turkish': 'TR',
      'Greek': 'EL',
      'Indonesian': 'ID',
      'Malay': 'MS',
      'Thai': 'TH',
      'Vietnamese': 'VI',
    };

    // If it's already a code, return as is
    if (language.length <= 3 && language === language.toUpperCase()) {
      return language;
    }

    // Try to find the code by name
    return languageMap[language] || language.toUpperCase();
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.has(this.normalizeLanguageCode(languageCode));
  }

  getApiStatus(): { available: boolean; message: string } {
    if (!this.apiKey || this.apiKey === 'your_deepl_api_key_here') {
      return {
        available: false,
        message: 'DeepL API key not configured. Using fallback languages.',
      };
    }

    return {
      available: this.isApiAvailable,
      message: this.isApiAvailable 
        ? 'DeepL API connected and ready'
        : 'DeepL API unavailable. Using fallback languages.',
    };
  }
}

export default DeepLService;