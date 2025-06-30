# 🤖 Brigitte AI - Intelligent Real-time Translation

Break language barriers with Brigitte AI's intelligent real-time speech translation powered by Google Gemini, DeepL AI, and ElevenLabs.

## 🚀 Quick Start

### **IMPORTANT: Environment Setup Required Each Session**

Due to WebContainer limitations, you'll need to set up your API keys each time you start working:

```bash
# Quick setup (recommended)
npm run quick-start

# Or manual setup
npm run setup-env
# Then edit .env with your actual API keys
npm run dev
```

### **Required API Keys**

1. **ElevenLabs API Key** - Get from [elevenlabs.io/api](https://elevenlabs.io/api)
2. **Google Gemini API Key** - Get from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
3. **DeepL API Key** - Get from [deepl.com/pro-api](https://deepl.com/pro-api)
4. **Neon Database URL** (optional) - Get from [neon.tech](https://neon.tech)

### **Setup Process**

1. Run the setup script:
   ```bash
   npm run setup-env
   ```

2. Edit the generated `.env` file with your actual API keys:
   ```env
   VITE_ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_key
   VITE_GEMINI_API_KEY=AIzaSy_your_actual_gemini_key
   VITE_DEEPL_API_KEY=your_actual_deepl_key
   VITE_NEON_DATABASE_URL=postgresql://your_neon_url
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Features

- **Intelligent Speech Recognition** - Powered by Google Gemini
- **Professional Translation** - DeepL AI for accurate translations
- **Natural Voice Synthesis** - ElevenLabs for realistic speech output
- **Real-time Conversation** - Seamless back-and-forth translation
- **Multi-language Support** - 30+ languages supported
- **Session Persistence** - Optional database storage with Neon
- **Beautiful UI** - Modern, responsive design

## 🔧 Troubleshooting

### **"API Keys Required" Error**
- Make sure you've created the `.env` file
- Verify all placeholder values are replaced with real API keys
- Restart the dev server after updating `.env`

### **"Failed to transcribe audio" Error**
- Check your Gemini API key is valid
- Ensure microphone permissions are granted
- Try speaking more clearly and for longer

### **Translation Errors**
- Verify your DeepL API key is active
- Check your DeepL usage limits
- Ensure you have internet connectivity

## 📱 Usage

1. **Configure Languages**: Click the settings gear to select languages for each speaker
2. **Choose Voices**: Select preferred voices for each speaker
3. **Start Conversation**: Click the microphone button to start recording
4. **Speak Naturally**: Talk normally - Brigitte AI will handle the rest
5. **Listen to Translation**: The AI will automatically play the translation

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Speech-to-Text**: Google Gemini AI
- **Translation**: DeepL AI API
- **Text-to-Speech**: ElevenLabs API
- **Database**: Neon PostgreSQL (optional)
- **Build Tool**: Vite

## 🔒 Privacy & Security

- All API keys are stored locally in your environment
- Audio is processed in real-time and not stored
- Optional database storage for conversation history
- No data is shared with third parties

## 📄 License

This project is for educational and personal use. Please respect the terms of service of all integrated APIs.

---

**Note**: Remember to set up your environment variables each time you start a new development session due to WebContainer limitations.