// API Keys Configuration
// This file allows you to set your API keys directly in the code
// which will persist between sessions in this environment

export const API_KEYS = {
  // Replace these with your actual API keys
  ELEVENLABS_API_KEY: 'your_elevenlabs_api_key_here',
  GEMINI_API_KEY: 'your_gemini_api_key_here', 
  DEEPL_API_KEY: 'your_deepl_api_key_here',
  NEON_DATABASE_URL: 'your_neon_database_url_here', // Optional
  
  // Voice IDs for ElevenLabs
  ELEVENLABS_VOICE_ID: '1GvTxqTIRSoKAPZZYJJe',
  ELEVENLABS_FEMALE_VOICE: 'EXAVITQu4vr4xnSDxMaL',
  ELEVENLABS_MALE_VOICE: '9PVP7ENhDskL0KYHAKtD',
  
  // DeepL API URL
  DEEPL_API_URL: 'https://api-free.deepl.com/v2'
};

// Helper function to get API keys with fallback to environment variables
export const getApiKey = (key: keyof typeof API_KEYS): string => {
  // First try the direct config
  const directKey = API_KEYS[key];
  if (directKey && !directKey.includes('your_') && !directKey.includes('_here')) {
    return directKey;
  }
  
  // Fallback to environment variables
  const envKey = `VITE_${key}`;
  const envValue = import.meta.env[envKey];
  if (envValue && !envValue.includes('your_') && !envValue.includes('_here')) {
    return envValue;
  }
  
  return '';
};

// Validation function
export const validateApiKeys = (): { valid: boolean; missing: string[] } => {
  const requiredKeys: (keyof typeof API_KEYS)[] = [
    'ELEVENLABS_API_KEY',
    'GEMINI_API_KEY', 
    'DEEPL_API_KEY'
  ];
  
  const missing: string[] = [];
  
  for (const key of requiredKeys) {
    const value = getApiKey(key);
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};