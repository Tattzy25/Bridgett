// Node.js compatible test for Gemini API
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env files in order of priority
dotenv.config({ path: join(__dirname, '.env.local') });
dotenv.config({ path: join(__dirname, '.env.development.local') });
dotenv.config({ path: join(__dirname, '.env') });

interface GeminiTestResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Node.js compatible function to get API key
function getGeminiApiKey(): string {
  // Try different environment variable names
  const apiKey = process.env.VITE_GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 '';
  
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
    return '';
  }
  
  return apiKey;
}

async function testGeminiAPI() {
  try {
    // Get the API key
    const apiKey = getGeminiApiKey();
    
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ No Gemini API key found');
      console.log('💡 Make sure VITE_GEMINI_API_KEY or GEMINI_API_KEY is set in your .env files');
      return;
    }
    
    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    
    // Simple test request
    const requestBody = {
      contents: [{
        parts: [{
          text: 'Say "Hello, Gemini API is working!" - just return this exact phrase.'
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 100,
      }
    };
    
    console.log('🚀 Testing Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      
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
      
      console.error('❌ API Request Failed:', errorMessage);
      
      // Specific error handling
      if (response.status === 400) {
        console.error('💡 This might be an invalid API key or malformed request');
      } else if (response.status === 401 || response.status === 403) {
        console.error('💡 This is likely an authentication issue - check your API key');
      } else if (response.status === 429) {
        console.error('💡 Rate limit exceeded - wait a moment and try again');
      }
      
      return;
    }
    
    const data: GeminiTestResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No response received from Gemini');
      return;
    }
    
    const responseText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('❌ No text content in response');
      return;
    }
    
    console.log('✅ Gemini API is working!');
    console.log('📝 Response:', responseText.trim());
    console.log('🎉 Your Gemini API key is valid and functional!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch is not defined')) {
        console.error('💡 Node.js version might be too old. Try: npm install node-fetch or use Node 18+');
      } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error('💡 Network error - check your internet connection');
      }
    }
  }
}

// Run the test
testGeminiAPI();