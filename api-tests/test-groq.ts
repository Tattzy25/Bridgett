import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

function getGroqApiKey(): string {
  return process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
}

async function testGroqAPI() {
  console.log('🧪 Testing Groq API...');
  
  try {
    const apiKey = getGroqApiKey();
    
    if (!apiKey) {
      console.error('❌ No Groq API key found');
      return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    
    const requestBody = {
      messages: [{
        role: 'user',
        content: 'Say "Groq API test successful" - return only this phrase.'
      }],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 50
    };
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      console.error('❌ Groq API request failed:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;
    
    console.log('✅ Groq API working!');
    console.log('📝 Response:', responseText?.trim());
    return true;
    
  } catch (error) {
    console.error('❌ Groq test failed:', error);
    return false;
  }
}

testGroqAPI();

export { testGroqAPI };