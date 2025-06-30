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
}

class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = getApiKey('GROQ_API_KEY');
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
      
      // Prepare the request payload for Groq's Agentic Tooling
      const requestBody = {
        model: "compound-beta", // Using Groq's agentic model
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
        temperature: 0.1,
        max_tokens: 1024,
      };

      console.log(`Transcribing audio with Groq: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        let errorMessage = `Groq API error: ${response.status}`;
        
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
            throw new Error('Invalid Groq API key. Please check your API keys configuration.');
          }
          throw new Error('Invalid audio format or request. Please try again.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid or unauthorized Groq API key. Please check your API keys configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 413) {
          throw new Error('Audio file too large. Please record shorter segments.');
        }

        throw new Error(errorMessage);
      }

      const data: GroqTranscriptionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No transcription received from Groq');
      }

      const transcription = data.choices[0]?.message?.content;
      
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No speech detected in the recording. Please speak more clearly and try again.');
      }

      const transcribedText = transcription.trim();
      console.log(`Groq transcription successful: "${transcribedText.substring(0, 50)}..."`);
      
      return transcribedText;
    } catch (error) {
      console.error('Error transcribing audio with Groq:', error);
      
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
      
      throw new Error('Failed to transcribe audio with Groq. Please try again.');
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
        model: "compound-beta", // Using Groq's agentic model
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

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq translation error: ${response.status} - ${errorText}`);
      }

      const data: GroqTranscriptionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No translation received from Groq');
      }

      const translatedText = data.choices[0]?.message?.content;
      
      if (!translatedText) {
        throw new Error('No translation content received from Groq');
      }

      return translatedText.trim();
    } catch (error) {
      console.error('Error translating with Groq:', error);
      throw new Error('Failed to translate text with Groq');
    }
  }
}

export default GroqService;