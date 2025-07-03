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
  | 'DEEPL_API_URL'
  | 'ABLY_API_KEY'
  | 'SERVER_URL';

// Default values for non-sensitive configuration only
const DEFAULT_VALUES: Record<string, string> = {
  'DEEPL_API_URL': 'https://api-free.deepl.com/v2',
  'SERVER_URL': process.env.NODE_ENV === 'production' 
    ? process.env.VITE_SERVER_URL || 'https://api.bridgette-ai.com'
    : 'http://localhost:3001'
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
    'ELEVENLABS_VOICE_ID',
    'GROQ_API_KEY', 
    'DEEPL_API_KEY',
    'GEMINI_API_KEY',
    'NEON_DATABASE_URL'
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

// Production environment validation
export const validateProductionEnvironment = (): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Validate all required keys are present
    const { valid, missing } = validateApiKeys();
    if (!valid) {
      issues.push(`Missing required API keys: ${missing.join(', ')}`);
    }
    
    // Check for placeholder values in production
    const allKeys: ApiKeyType[] = [
      'ELEVENLABS_API_KEY', 'DEEPL_API_KEY', 'GROQ_API_KEY', 
      'GEMINI_API_KEY', 'NEON_DATABASE_URL', 'ELEVENLABS_VOICE_ID',
      'ABLY_API_KEY'
    ];
    
    for (const key of allKeys) {
      const value = getApiKey(key);
      if (value && (value.includes('your_') || value.includes('_here') || value.includes('placeholder'))) {
        issues.push(`${key} contains placeholder value in production`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};