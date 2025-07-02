import { getApiKey } from '../config/apiKeys';

interface GeminiTranscriptionResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = getApiKey('GEMINI_API_KEY');
    
    if (!this.apiKey || 
        this.apiKey === 'your_gemini_api_key_here' || 
        this.apiKey.includes('your_') ||
        this.apiKey.includes('_here') ||
        this.apiKey.trim() === '') {
      throw new Error('Google Gemini API key is required and must be properly configured. Please check your API keys configuration.');
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

    try {
      // Convert audio blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Prepare the request payload for Gemini
      const requestBody = {
        contents: [{
          parts: [{
            text: `Please transcribe the following audio to text. ${language ? `The audio is in ${language}.` : ''} Only return the transcribed text, no explanations.`
          }, {
            inline_data: {
              mime_type: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          }]
        }],
        generationConfig: {
          temperature: parseFloat(process.env.VITE_GEMINI_TRANSCRIPTION_TEMPERATURE || '0.1'),
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      };

      console.log(`Transcribing audio with Gemini: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        let errorMessage = `Gemini API error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }

        // Handle specific error cases
        if (response.status === 400) {
          if (errorMessage.includes('API key')) {
            throw new Error('Invalid Gemini API key. Please check your API keys configuration.');
          }
          throw new Error('Invalid audio format or request. Please try again.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid or unauthorized Gemini API key. Please check your API keys configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 413) {
          throw new Error('Audio file too large. Please record shorter segments.');
        }

        throw new Error(errorMessage);
      }

      const data: GeminiTranscriptionResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No transcription received from Gemini');
      }

      const transcription = data.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No speech detected in the recording. Please speak more clearly and try again.');
      }

      const transcribedText = transcription.trim();
      console.log(`Gemini transcription successful: "${transcribedText.substring(0, 50)}..."`);
      
      return transcribedText;
    } catch (error) {
      console.error('Error transcribing audio with Gemini:', error);
      
      if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        // Handle timeout errors
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          throw new Error('Transcription timed out. Please try with a shorter recording.');
        }
        
        // Re-throw known errors
        if (error.message.includes('Audio') || 
            error.message.includes('speech') || 
            error.message.includes('API') ||
            error.message.includes('Rate limit') ||
            error.message.includes('Network') ||
            error.message.includes('Invalid') ||
            error.message.includes('unauthorized')) {
          throw error;
        }
      }
      
      throw new Error('Failed to transcribe audio with Gemini. Please try again.');
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
      reader.readAsDataURL(blob);
    });
  }

  async translateWithLLM(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    if (!text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: `Translate the following text from ${fromLanguage} to ${toLanguage}. Only return the translation, no explanations or additional text:\n\n${text}`
          }]
        }],
        generationConfig: {
          temperature: parseFloat(process.env.VITE_GEMINI_TRANSLATION_TEMPERATURE || '0.3'),
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini translation error: ${response.status} - ${errorText}`);
      }

      const data: GeminiTranscriptionResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No translation received from Gemini');
      }

      const translatedText = data.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!translatedText) {
        throw new Error('No translation content received from Gemini');
      }

      return translatedText.trim();
    } catch (error) {
      console.error('Error translating with Gemini:', error);
      throw new Error('Failed to translate text with Gemini');
    }
  }
}

export default GeminiService;