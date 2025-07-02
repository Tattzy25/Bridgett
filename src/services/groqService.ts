import { getApiKey } from '../config/apiKeys';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  text?: string;
  error?: {
    message: string;
  };
}

class GroqService {
  apiKey: string;
  baseUrl = 'https://api.groq.com/openai/v1';
  model = 'llama-3.1-70b-versatile';  // SINGLE MODEL - NO FALLBACKS
  whisperModel = 'whisper-large-v3';

  constructor() {
    this.apiKey = getApiKey('GROQ_API_KEY');
    if (!this.apiKey) {
      throw new Error('GROQ API KEY MISSING');
    }
  }

  // STT - STEP 2 OF YOUR FLOW
  async transcribeAudio(audioBlob: Blob, language?: string): Promise<string> {
    const formData = new FormData();
    const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    formData.append('file', audioFile);
    formData.append('model', this.whisperModel);
    if (language) {
      formData.append('language', language);
    }
    formData.append('response_format', 'json');

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`GROQ STT FAILED: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    
    if (data.error) {
      throw new Error(`GROQ STT ERROR: ${data.error.message}`);
    }
    
    if (!data.text) {
      throw new Error('NO SPEECH DETECTED');
    }

    return data.text.trim();
  }

  // TRANSLATION FALLBACK - STEP 3 OF YOUR FLOW (when DeepL fails)
  async translateWithLLM(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    const requestBody = {
      model: this.model,
      messages: [{
        role: "system",
        content: `Translate from ${fromLanguage} to ${toLanguage}. Return ONLY the translation.`
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.2,
      max_tokens: 1024,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`GROQ TRANSLATION FAILED: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    
    if (data.error) {
      throw new Error(`GROQ TRANSLATION ERROR: ${data.error.message}`);
    }
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('GROQ RETURNED EMPTY TRANSLATION');
    }

    return data.choices[0].message.content.trim();
  }
}

export default GroqService;