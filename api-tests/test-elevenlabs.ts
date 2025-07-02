import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

function getElevenLabsApiKey(): string {
  return process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || '';
}

function getElevenLabsVoiceId(): string {
  return process.env.VITE_ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || '1GvTxqTIRSoKAPZZYJJe';
}

async function testElevenLabsAPI() {
  console.log('🧪 Testing ElevenLabs API...');
  
  try {
    const apiKey = getElevenLabsApiKey();
    const voiceId = getElevenLabsVoiceId();
    
    if (!apiKey) {
      console.error('❌ No ElevenLabs API key found');
      return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🎤 Voice ID:', voiceId);
    
    const requestBody = {
      text: 'ElevenLabs API test successful',
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      console.error('❌ ElevenLabs API request failed:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    console.log('✅ ElevenLabs API working!');
    console.log('🎵 Audio generated:', audioBuffer.byteLength, 'bytes');
    return true;
    
  } catch (error) {
    console.error('❌ ElevenLabs test failed:', error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testElevenLabsAPI();
}

export { testElevenLabsAPI };