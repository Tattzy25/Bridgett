import { getApiKey } from '../config/apiKeys';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface ElevenLabsSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId: string;

  constructor() {
    this.apiKey = getApiKey('ELEVENLABS_API_KEY');
    
    if (!this.apiKey || 
        this.apiKey === 'your_elevenlabs_api_key_here' || 
        this.apiKey.includes('your_') ||
        this.apiKey.includes('_here') ||
        this.apiKey.trim() === '') {
      throw new Error('ElevenLabs API key is required and must be properly configured. Please check your API keys configuration.');
    }
    
    this.defaultVoiceId = getApiKey('ELEVENLABS_VOICE_ID');
    
    if (!this.defaultVoiceId || 
        this.defaultVoiceId === 'your_elevenlabs_voice_id_here' || 
        this.defaultVoiceId.includes('your_') ||
        this.defaultVoiceId.includes('_here') ||
        this.defaultVoiceId.trim() === '') {
      throw new Error('ElevenLabs Voice ID is required and must be properly configured. Please check your API keys configuration.');
    }
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `ElevenLabs API error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.detail?.message) {
            errorMessage += ` - ${errorData.detail.message}`;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid or unauthorized ElevenLabs API key. Please check your API keys configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      
      if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        
        // Re-throw known errors
        if (error.message.includes('API') || 
            error.message.includes('Rate limit') ||
            error.message.includes('Network') ||
            error.message.includes('Invalid') ||
            error.message.includes('unauthorized')) {
          throw error;
        }
      }
      
      throw new Error('Failed to fetch available voices');
    }
  }

  async synthesizeSpeech(
    text: string,
    voiceId?: string,
    settings: ElevenLabsSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    }
  ): Promise<ArrayBuffer> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    const selectedVoiceId = voiceId || this.defaultVoiceId;
    
    if (!selectedVoiceId) {
      throw new Error('Voice ID is required for speech synthesis');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `ElevenLabs TTS error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.detail?.message) {
            errorMessage += ` - ${errorData.detail.message}`;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorMessage.includes('voice')) {
            throw new Error('Invalid voice ID. Please check your voice configuration.');
          }
          throw new Error('Invalid request. Please check your text and settings.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid or unauthorized ElevenLabs API key. Please check your API keys configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 422) {
          throw new Error('Invalid text or voice settings. Please check your input.');
        }
        
        throw new Error(errorMessage);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      
      if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Speech synthesis timed out. Please try with shorter text.');
        }
        
        // Re-throw known errors
        if (error.message.includes('API') || 
            error.message.includes('Rate limit') ||
            error.message.includes('Network') ||
            error.message.includes('Invalid') ||
            error.message.includes('unauthorized') ||
            error.message.includes('voice') ||
            error.message.includes('Text cannot be empty')) {
          throw error;
        }
      }
      
      throw new Error('Failed to synthesize speech');
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferDecoded;
      source.connect(audioContext.destination);
      
      return new Promise((resolve, reject) => {
        source.onended = () => resolve();
        source.addEventListener('error', () => reject(new Error('Audio playback failed')));
        source.start(0);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Failed to play synthesized audio');
    }
  }
}

export default ElevenLabsService;