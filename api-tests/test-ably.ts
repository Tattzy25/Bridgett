import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

function getAblyApiKey(): string {
  return process.env.VITE_ABLY_API_KEY || process.env.ABLY_API_KEY || '';
}

async function testAblyAPI() {
  console.log('🧪 Testing Ably API...');
  
  try {
    const apiKey = getAblyApiKey();
    
    if (!apiKey) {
      console.error('❌ No Ably API key found');
      return false;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    
    // Test Ably REST API
    const response = await fetch('https://rest.ably.io/time', {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Ably API request failed:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const timestamp = await response.json();
    
    console.log('✅ Ably API working!');
    console.log('⏰ Server time:', new Date(timestamp[0]).toISOString());
    return true;
    
  } catch (error) {
    console.error('❌ Ably test failed:', error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testAblyAPI();
}

export { testAblyAPI };