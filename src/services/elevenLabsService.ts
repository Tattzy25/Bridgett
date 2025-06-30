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
    this.defaultVoiceId = getApiKey('ELEVENLABS_VOICE_ID') || '1GvTxqTIRSoKAPZZYJJe';
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
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

    try {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error synthesizing speech:', error);
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