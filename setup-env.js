// Environment Setup Script for Brigitte AI
// Run this script to quickly set up your environment variables

import fs from 'fs';
import path from 'path';

const envTemplate = `# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=1GvTxqTIRSoKAPZZYJJe
VITE_ELEVENLABS_FEMALE_VOICE=EXAVITQu4vr4xnSDxMaL
VITE_ELEVENLABS_MALE_VOICE=9PVP7ENhDskL0KYHAKtD

# DeepL API Configuration
VITE_DEEPL_API_KEY=your_deepl_api_key_here
VITE_DEEPL_API_URL=https://api-free.deepl.com/v2

# Groq API Configuration (for speech-to-text and translation)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Neon Database Configuration
VITE_NEON_DATABASE_URL=your_neon_database_url_here
`;

console.log('🚀 Setting up Brigitte AI environment...');

// Create .env file
fs.writeFileSync('.env', envTemplate);

console.log('✅ .env file created successfully!');
console.log('');
console.log('✨ Environment setup complete! Starting development server...');