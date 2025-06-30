// API Keys Configuration
// This file manages API keys from environment variables only
// No hardcoded keys for better security

// Define the structure of our API keys for TypeScript
export type ApiKeyType = 
  | 'ELEVENLABS_API_KEY'
  | 'DEEPL_API_KEY'
  | 'GROQ_API_KEY'
  | 'GEMINI_API_KEY'
  | 'NEON_DATABASE_URL'
  | 'ELEVENLABS_VOICE_ID'
  | 'ELEVENLABS_FEMALE_VOICE'
  | 'ELEVENLABS_MALE_VOICE'
  | 'DEEPL_API_URL';

// Default values for non-sensitive configuration
const DEFAULT_VALUES: Record<string, string> = {
  'ELEVENLABS_VOICE_ID': '1GvTxqTIRSoKAPZZYJJe',
  'ELEVENLABS_FEMALE_VOICE': 'EXAVITQu4vr4xnSDxMaL',
  'ELEVENLABS_MALE_VOICE': '9PVP7ENhDskL0KYHAKtD',
  'DEEPL_API_URL': 'https://api-free.deepl.com/v2'
};

// Helper function to get API keys from environment variables only
export const getApiKey = (key: ApiKeyType): string => {
  // Get from environment variables
  const envKey = `VITE_${key}`;
  const envValue = import.meta.env[envKey];
  
  // Return environment variable if it exists and is not a placeholder
  if (envValue && typeof envValue === 'string' && 
      !envValue.includes('your_') && !envValue.includes('_here')) {
    return envValue;
  }
  
  // Return default value for non-sensitive configuration if available
  if (DEFAULT_VALUES[key]) {
    return DEFAULT_VALUES[key];
  }
  
  return '';
};

// Validation function
export const validateApiKeys = (): { valid: boolean; missing: string[] } => {
  const requiredKeys: ApiKeyType[] = [
    'ELEVENLABS_API_KEY',
    'GROQ_API_KEY', 
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