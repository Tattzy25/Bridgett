// Environment Setup Script for Brigitte AI
// Run this script to quickly set up your environment variables

const fs = require('fs');
const path = require('path');

const envTemplate = `# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=1GvTxqTIRSoKAPZZYJJe
VITE_ELEVENLABS_FEMALE_VOICE=EXAVITQu4vr4xnSDxMaL
VITE_ELEVENLABS_MALE_VOICE=9PVP7ENhDskL0KYHAKtD

# DeepL API Configuration
VITE_DEEPL_API_KEY=your_deepl_api_key_here
VITE_DEEPL_API_URL=https://api-free.deepl.com/v2

# Google Gemini API Configuration (for speech-to-text)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Neon Database Configuration
VITE_NEON_DATABASE_URL=your_neon_database_url_here
`;

console.log('🚀 Setting up Brigitte AI environment...');

// Create .env file
fs.writeFileSync('.env', envTemplate);

console.log('✅ .env file created successfully!');
console.log('');
console.log('📝 Next steps:');
console.log('1. Edit the .env file with your actual API keys');
console.log('2. Get your API keys from:');
console.log('   • ElevenLabs: https://elevenlabs.io/api');
console.log('   • Google Gemini: https://makersuite.google.com/app/apikey');
console.log('   • DeepL: https://deepl.com/pro-api');
console.log('3. Replace ALL placeholder values');
console.log('4. Restart the dev server');
console.log('');
console.log('⚠️  Remember: You\'ll need to do this each time you start a new session!');