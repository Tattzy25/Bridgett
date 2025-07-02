import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

function getGeminiApiKey(): string {
  return process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
}

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  
  try {
    const apiKey = getGeminiApiKey();
    
    if (!apiKey) {
      console.error('❌ No Gemini API key found');
      return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: 'Say "Gemini API test successful" - return only this phrase.'
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 100,
      }
    };
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );
    
    if (!response.ok) {
      console.error('❌ Gemini API request failed:', response.status);
      return false;
    }
    
    const data: GeminiResponse = await response.json();
    const responseText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    console.log('✅ Gemini API working!');
    console.log('📝 Response:', responseText?.trim());
    return true;
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testGeminiAPI();
}

export { testGeminiAPI };