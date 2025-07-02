import { getApiKey } from '../config/apiKeys';

interface GroqTranscriptionResponse {
  choices: Array<{
    message: {
      content: string;
      executed_tools?: Array<{
        name: string;
        input: Record<string, any>;
        output: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

interface GroqWhisperResponse {
  text: string;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private primaryModel = 'compound-beta';
  private fallbackModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
  private whisperModel = 'whisper-large-v3';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.apiKey = getApiKey('GROQ_API_KEY');
    
    if (!this.apiKey || 
        this.apiKey === 'your_groq_api_key_here' || 
        this.apiKey.includes('your_') ||
        this.apiKey.includes('_here') ||
        this.apiKey.trim() === '') {
      throw new Error('Groq API key is required and must be properly configured. Please check your API keys configuration.');
    }
  }

  async transcribeAudio(audioBlob: Blob, language?: string): Promise<string> {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Audio recording is empty. Please try speaking again.');
    }

    // Check minimum audio size (at least 1KB for meaningful audio)
    if (audioBlob.size < 1024) {
      throw new Error('Audio recording is too short. Please speak for at least 1-2 seconds.');
    }

    // Check maximum audio size (25MB limit for Groq)
    if (audioBlob.size > 25 * 1024 * 1024) {
      throw new Error('Audio file too large. Please record shorter segments (max 25MB).');
    }

    // Try Whisper first (more reliable for audio transcription)
    try {
      return await this.transcribeWithWhisper(audioBlob, language);
    } catch (whisperError) {
      console.warn('Whisper transcription failed, trying LLM approach:', whisperError);
      
      // Fallback to LLM-based transcription
      try {
        return await this.transcribeWithLLM(audioBlob, this.primaryModel, language);
      } catch (primaryError) {
        console.warn('Primary model failed, trying fallback model:', primaryError);
        
        // Final fallback to meta-llama model
        return await this.transcribeWithLLM(audioBlob, this.fallbackModel, language);
      }
    }
  }

  private async transcribeWithWhisper(audioBlob: Blob, language?: string): Promise<string> {
    const formData = new FormData();
    
    // Convert blob to file with proper extension
    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' });
    formData.append('file', audioFile);
    formData.append('model', this.whisperModel);
    
    if (language) {
      formData.append('language', this.getWhisperLanguageCode(language));
    }
    
    formData.append('response_format', 'json');
    formData.append('temperature', '0.0'); // ❌ Should be configurable
    // Remove unused comma operator
formData.append('temperature', '0.3');

    console.log(`Transcribing audio with Whisper: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

    const response = await this.makeRequest('/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData,
    });

    const data: GroqWhisperResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Whisper API error: ${data.error.message}`);
    }
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No speech detected in the recording. Please speak more clearly and try again.');
    }

    const transcribedText = data.text.trim();
    console.log(`Whisper transcription successful: "${transcribedText.substring(0, 50)}..."`);
    
    return transcribedText;
  }

  private async transcribeWithLLM(audioBlob: Blob, model: string, language?: string): Promise<string> {
    const base64Audio = await this.blobToBase64(audioBlob);
    
    const requestBody = {
      model,
      messages: [{
        role: "user",
        content: `Please transcribe the following audio to text. ${language ? `The audio is in ${language}.` : ''} Only return the transcribed text, no explanations.`
      }, {
        role: "user",
        content: [{
          type: "audio",
          audio_data: base64Audio
        }]
      }],
      temperature: parseFloat(process.env.VITE_GROQ_TRANSLATION_TEMPERATURE || '0.3'),
      max_tokens: 1024,
    };

    console.log(`Transcribing audio with ${model}: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    const data: GroqTranscriptionResponse = await response.json();
    
    if (data.error) {
      throw new Error(`${model} API error: ${data.error.message}`);
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`No transcription received from ${model}`);
    }

    const transcription = data.choices[0]?.message?.content;
    
    if (!transcription || transcription.trim().length === 0) {
      throw new Error('No speech detected in the recording. Please speak more clearly and try again.');
    }

    const transcribedText = transcription.trim();
    console.log(`${model} transcription successful: "${transcribedText.substring(0, 50)}..."`);
    
    return transcribedText;
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          await this.handleHttpError(response, attempt);
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Handle specific error types
        if (lastError.name === 'AbortError') {
          throw new Error('Request timed out. Please try with a shorter recording.');
        }
        
        if (lastError.message.includes('Failed to fetch') || lastError.name === 'TypeError') {
          if (attempt === this.maxRetries) {
            throw new Error('Network error. Please check your internet connection and try again.');
          }
        } else {
          // For non-network errors, don't retry
          throw lastError;
        }
        
        // Wait before retrying
        if (attempt < this.maxRetries) {
          console.log(`Request failed (attempt ${attempt}/${this.maxRetries}), retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retry attempts');
  }

  private async handleHttpError(response: Response, attempt: number): Promise<void> {
    let errorMessage = `Groq API error: ${response.status}`;
    let errorDetails = '';
    
    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        errorDetails = errorData.error.message;
        errorMessage += ` - ${errorDetails}`;
      }
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails = errorText;
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Handle specific error cases
    switch (response.status) {
      case 400:
        if (errorDetails.toLowerCase().includes('api key') || errorDetails.toLowerCase().includes('authentication')) {
          throw new Error('Invalid Groq API key. Please check your API keys configuration.');
        }
        if (errorDetails.toLowerCase().includes('model') && errorDetails.toLowerCase().includes('not found')) {
          throw new Error('Model not available. The requested model may not be accessible with your API key.');
        }
        throw new Error('Invalid request format or audio data. Please try again with a different recording.');
        
      case 401:
      case 403:
        throw new Error('Invalid or unauthorized Groq API key. Please check your API keys configuration.');
        
      case 413:
        throw new Error('Audio file too large. Please record shorter segments (max 25MB).');
        
      case 429:
        if (attempt < this.maxRetries) {
          // For rate limits, wait longer before retrying
          await this.delay(5000 * attempt);
          return; // Don't throw, let the retry mechanism handle it
        }
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        
      case 500:
      case 502:
      case 503:
      case 504:
        if (attempt < this.maxRetries) {
          return; // Let retry mechanism handle server errors
        }
        throw new Error('Groq service temporarily unavailable. Please try again later.');
        
      default:
        throw new Error(errorMessage);
    }
  }

  private getWhisperLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'english': 'en',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'russian': 'ru',
      'japanese': 'ja',
      'korean': 'ko',
      'chinese': 'zh',
      'arabic': 'ar',
      'hindi': 'hi',
      'dutch': 'nl',
      'polish': 'pl',
      'turkish': 'tr'
    };
    
    const normalizedLanguage = language.toLowerCase();
    return languageMap[normalizedLanguage] || normalizedLanguage;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          if (!result || !result.includes(',')) {
            throw new Error('Invalid base64 conversion result');
          }
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64 = result.split(',')[1];
          if (!base64) {
            throw new Error('Failed to extract base64 data');
          }
          resolve(base64);
        } catch (error) {
          reject(new Error(`Failed to convert audio to base64: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('FileReader error occurred while converting audio to base64'));
      };
      
      reader.readAsDataURL(blob);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async translateWithLLM(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    if (!text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }

    // Try primary model first, then fallback
    const models = [this.primaryModel, this.fallbackModel];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const requestBody = {
          model,
          messages: [{
            role: "system",
            content: `You are a professional translator. Translate the text from ${fromLanguage} to ${toLanguage}. Only return the translation, no explanations or additional text.`
          }, {
            role: "user",
            content: text
          }],
          temperature: 0.3,
          max_tokens: 1024,
        };

        const response = await this.makeRequest('/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody),
        });

        const data: GroqTranscriptionResponse = await response.json();
        
        if (data.error) {
          throw new Error(`${model} translation error: ${data.error.message}`);
        }
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error(`No translation received from ${model}`);
        }

        const translatedText = data.choices[0]?.message?.content;
        
        if (!translatedText) {
          throw new Error(`No translation content received from ${model}`);
        }

        return translatedText.trim();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Translation failed with ${model}:`, lastError.message);
        
        // If this is the last model, throw the error
        if (model === models[models.length - 1]) {
          break;
        }
      }
    }

    throw lastError || new Error('Failed to translate text with all available models');
  }
}

export default GroqService;