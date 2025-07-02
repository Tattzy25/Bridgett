import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

function getDeepLApiKey(): string {
  return process.env.VITE_DEEPL_API_KEY || process.env.DEEPL_API_KEY || '';
}

function getDeepLApiUrl(): string {
  return process.env.VITE_DEEPL_API_URL || process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2';
}

async function testDeepLAPI() {
  console.log('🧪 Testing DeepL API...');
  
  try {
    const apiKey = getDeepLApiKey();
    const apiUrl = getDeepLApiUrl();
    
    if (!apiKey) {
      console.error('❌ No DeepL API key found');
      return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🌐 API URL:', apiUrl);
    
    const formData = new URLSearchParams();
    formData.append('text', 'Hello, this is a test');
    formData.append('source_lang', 'EN');
    formData.append('target_lang', 'ES');
    
    const response = await fetch(`${apiUrl}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      console.error('❌ DeepL API request failed:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    const translation = data.translations?.[0]?.text;
    
    console.log('✅ DeepL API working!');
    console.log('📝 Translation:', translation);
    return true;
    
  } catch (error) {
    console.error('❌ DeepL test failed:', error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testDeepLAPI();
}

export { testDeepLAPI };