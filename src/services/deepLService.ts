import { getApiKey } from '../config/apiKeys';
import LoggingService from './loggingService';

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
  private logger = LoggingService.getInstance();

  constructor() {
    this.apiKey = getApiKey('DEEPL_API_KEY');
    this.baseUrl = getApiKey('DEEPL_API_URL') || 'https://api-free.deepl.com/v2';
    
    if (!this.apiKey) {
      throw new Error('DEEPL_API_KEY is required. Please configure your environment variables.');
    }
    
    this.logger.configure({ contextPrefix: 'DeepLService' });
  }

  async initializeLanguages(): Promise<void> {
    try {
      const [sourceLanguages, targetLanguages] = await Promise.all([
        this.getSourceLanguages(),
        this.getTargetLanguages()
      ]);

      const allLanguages = new Map<string, DeepLLanguage>();
      
      sourceLanguages.forEach(lang => {
        allLanguages.set(lang.language, lang);
      });
      
      targetLanguages.forEach(lang => {
        if (allLanguages.has(lang.language)) {
          const existing = allLanguages.get(lang.language)!;
          allLanguages.set(lang.language, { ...existing, ...lang });
        } else {
          allLanguages.set(lang.language, lang);
        }
      });

      this.supportedLanguages = allLanguages;
      this.logger.info(`DeepL API initialized successfully. ${allLanguages.size} languages available.`);
    } catch (error) {
      this.logger.error('Failed to initialize DeepL languages', 'initialization', error);
      throw new Error('DeepL API initialization failed. Please check your API key and network connection.');
    }
  }

  async getSourceLanguages(): Promise<DeepLLanguage[]> {
    const response = await fetch(`${this.baseUrl}/languages?type=source`, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getTargetLanguages(): Promise<DeepLLanguage[]> {
    const response = await fetch(`${this.baseUrl}/languages?type=target`, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string) {
    if (!text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      formData.append('target_lang', this.normalizeLanguageCode(targetLanguage));
      
      if (sourceLanguage) {
        formData.append('source_lang', this.normalizeLanguageCode(sourceLanguage));
      }

      formData.append('preserve_formatting', '1');
      formData.append('formality', 'default');

      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        },
        body: formData,
        signal: AbortSignal.timeout(15000),
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
      
      this.logger.info(`Translation completed: ${text.substring(0, 50)}... -> ${translation.text.substring(0, 50)}...`);

      return {
        translatedText: translation.text,
        detectedSourceLanguage: translation.detected_source_language,
      };
    } catch (error) {
      this.logger.error('Translation failed', 'translateText', { text: text.substring(0, 100), targetLanguage, error });
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUsageInfo(): Promise<DeepLUsageResponse> {
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
      this.logger.error('Failed to fetch usage info', 'getUsageInfo', error);
      throw new Error('Failed to fetch DeepL usage information');
    }
  }

  getSupportedLanguages(): Array<{ code: string; name: string; flag: string }> {
    if (this.supportedLanguages.size === 0) {
      this.logger.warn('No languages loaded from API, using fallback list');
      return this.getFallbackLanguages();
    }

    const languageFlags: { [key: string]: string } = {
      'EN': '🇺🇸', 'ES': '🇪🇸', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹',
      'PT': '🇧🇷', 'RU': '🇷🇺', 'JA': '🇯🇵', 'KO': '🇰🇷', 'ZH': '🇨🇳',
      'AR': '🇸🇦', 'HI': '🇮🇳', 'NL': '🇳🇱', 'PL': '🇵🇱', 'SV': '🇸🇪',
      'DA': '🇩🇰', 'FI': '🇫🇮', 'NO': '🇳🇴', 'CS': '🇨🇿', 'HU': '🇭🇺',
      'RO': '🇷🇴', 'SK': '🇸🇰', 'SL': '🇸🇮', 'BG': '🇧🇬', 'ET': '🇪🇪',
      'LV': '🇱🇻', 'LT': '🇱🇹', 'UK': '🇺🇦', 'TR': '🇹🇷', 'EL': '🇬🇷',
      'ID': '🇮🇩', 'MS': '🇲🇾', 'TH': '🇹🇭', 'VI': '🇻🇳',
    };

    return Array.from(this.supportedLanguages.values()).map(lang => ({
      code: lang.language,
      name: lang.name,
      flag: languageFlags[lang.language] || '🌐',
    }));
  }

  private getFallbackLanguages(): Array<{ code: string; name: string; flag: string }> {
    return [
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
    ];
  }

  private normalizeLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'English': 'EN', 'Spanish': 'ES', 'French': 'FR', 'German': 'DE',
      'Italian': 'IT', 'Portuguese': 'PT', 'Russian': 'RU', 'Japanese': 'JA',
      'Korean': 'KO', 'Chinese': 'ZH', 'Arabic': 'AR', 'Hindi': 'HI',
      'Dutch': 'NL', 'Polish': 'PL', 'Swedish': 'SV', 'Danish': 'DA',
      'Finnish': 'FI', 'Norwegian': 'NO', 'Czech': 'CS', 'Hungarian': 'HU',
      'Romanian': 'RO', 'Slovak': 'SK', 'Slovenian': 'SL', 'Bulgarian': 'BG',
      'Estonian': 'ET', 'Latvian': 'LV', 'Lithuanian': 'LT', 'Ukrainian': 'UK',
      'Turkish': 'TR', 'Greek': 'EL', 'Indonesian': 'ID', 'Malay': 'MS',
      'Thai': 'TH', 'Vietnamese': 'VI',
    };

    return languageMap[language] || language.toUpperCase();
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.has(this.normalizeLanguageCode(languageCode));
  }

  getApiStatus(): { available: boolean; message: string } {
    return {
      available: !!this.apiKey && this.supportedLanguages.size > 0,
      message: `DeepL API ready with ${this.supportedLanguages.size} languages`,
    };
  }
}

export default DeepLService;