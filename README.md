# 🤖 Bridgit AI - Intelligent Real-time Translation

Break language barriers with Bridgit AI's intelligent real-time speech translation powered by Groq, DeepL AI, and ElevenLabs.

## 🚀 Quick Start

### **Quick Setup**

```bash
# Quick setup (recommended)
npm run quick-start

# Or manual setup
npm run setup-env
npm run dev
```

### **Required API Keys**

1. **ElevenLabs API Key** - Get from [elevenlabs.io/api](https://elevenlabs.io/api)
2. **Groq API Key** - Get from [console.groq.com/keys](https://console.groq.com/keys)
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
   VITE_GROQ_API_KEY=gsk_your_actual_groq_key
   VITE_DEEPL_API_KEY=your_actual_deepl_key
   VITE_NEON_DATABASE_URL=postgresql://your_neon_url
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Features

- **Intelligent Speech Recognition** - Powered by Groq's Agentic Tooling
- **Professional Translation** - DeepL AI for accurate translations with Groq as fallback
- **Natural Voice Synthesis** - ElevenLabs for realistic speech output
- **Real-time Conversation** - Seamless back-and-forth translation
- **Multi-language Support** - 30+ languages supported
- **Session Persistence** - Optional database storage with Neon
- **Beautiful UI** - Modern, responsive design
- **Finite State Machine Architecture** - Robust state management for the translation process

## 🏗️ Architecture

### **FSM Orchestrator Design**
- **No Startup API Tests**: The application uses an orchestrator-based architecture that handles API management without testing connectivity on startup
- **Lazy API Validation**: APIs are validated only when needed during actual translation/transcription requests
- **Graceful Fallbacks**: Services automatically handle API unavailability with built-in fallback mechanisms
- **Efficient Initialization**: Faster startup times by eliminating redundant connectivity checks

## 🔧 Troubleshooting

### **"API Keys Required" Error**
- Make sure you've created the `.env` file
- Verify all placeholder values are replaced with real API keys
- Restart the dev server after updating `.env`

### **"Failed to transcribe audio" Error**
- Check your Groq API key is valid
- Ensure microphone permissions are granted
- Try speaking more clearly and for longer

### **Translation Errors**
- Verify your DeepL API key is active
- Check your DeepL usage limits
- The orchestrator will handle API errors gracefully without requiring restart

## 📱 Usage

1. **Configure Languages**: Click the settings gear to select languages for each speaker
2. **Choose Voices**: Select preferred voices for each speaker
3. **Start Conversation**: Click the microphone button to start recording
4. **Speak Naturally**: Talk normally - Brigitte AI will handle the rest
5. **Listen to Translation**: The AI will automatically play the translation

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Speech-to-Text**: Groq AI with Agentic Tooling
- **Translation**: DeepL AI API with Groq as fallback
- **Text-to-Speech**: ElevenLabs API
- **State Management**: FSM Orchestrator with lazy API validation
- **Database**: Neon PostgreSQL (optional)
- **Build Tool**: Vite
- **Architecture**: Service orchestration without startup API testing

## 🔒 Privacy & Security

- All API keys are stored locally in your environment
- Audio is processed in real-time and not stored
- Optional database storage for conversation history
- No data is shared with third parties

## 📄 License

This project is for educational and personal use. Please respect the terms of service of all integrated APIs.

---

**Note**: Remember to set up your environment variables each time you start a new development session due to WebContainer limitations.