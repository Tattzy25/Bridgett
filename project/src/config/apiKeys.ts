// API Keys Configuration
// ONLY source: .env file with VITE_ prefix

// Helper function to get API keys - ONLY from .env file
export const getApiKey = (key: string): string => {
  const envKey = `VITE_${key}`;
  const envValue = import.meta.env[envKey];
  
  if (!envValue || 
      envValue.includes('your_') || 
      envValue.includes('_here') || 
      envValue.trim() === '') {
    return '';
  }
  
  return envValue;
};

// Validation function
export const validateApiKeys = (): { valid: boolean; missing: string[] } => {
  const requiredKeys = [
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