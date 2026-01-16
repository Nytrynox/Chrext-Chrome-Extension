import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { logger } from '../utils/logger.js';
import { jsonFetchWithRetry } from '../utils/http-client.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'ollama';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    this.openrouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
    this.retryOpts = {
      maxRetries: Number(process.env.OUTBOUND_MAX_RETRIES || 3),
      initialBackoffMs: Number(process.env.OUTBOUND_INITIAL_BACKOFF_MS || 500),
    };
    
    logger.info(`AI Provider: ${this.provider}`);
    
    if (this.provider === 'ollama') {
      logger.info(`Using Ollama with model: ${this.ollamaModel}`);
    }
    
    if (this.provider === 'gemini' && process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    
    if (this.provider === 'groq' && process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    
    if (process.env.OPENROUTER_API_KEY) {
      this.openrouterKey = process.env.OPENROUTER_API_KEY;
    }
  }

  async generateStructuredResponse(prompt) {
    try {
      let response;
      
      if (this.provider === 'ollama') {
        response = await this.generateWithOllama(prompt);
      } else if (this.provider === 'openrouter') {
        response = await this.generateWithOpenRouter(prompt);
      } else if (this.provider === 'groq') {
        response = await this.generateWithGroq(prompt);
      } else {
        response = await this.generateWithGemini(prompt);
      }
      
      // Try to extract JSON from response
      // First try to find JSON between curly braces
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Try to clean up common issues
          let cleaned = jsonMatch[0]
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
          return JSON.parse(cleaned);
        }
      }
      
      // If no match, try the raw response
      return JSON.parse(response);
    } catch (error) {
      logger.error('AI parsing error:', error.message);
      throw new Error('Failed to generate AI response: ' + error.message);
    }
  }

  async generateTextResponse(prompt) {
    try {
      if (this.provider === 'ollama') {
        return await this.generateWithOllama(prompt);
      } else if (this.provider === 'openrouter') {
        return await this.generateWithOpenRouter(prompt);
      } else if (this.provider === 'groq') {
        return await this.generateWithGroq(prompt);
      } else {
        return await this.generateWithGemini(prompt);
      }
    } catch (error) {
      logger.error('AI text generation error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateWithOllama(prompt) {
    const data = await jsonFetchWithRetry('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 4000
        }
      })
    }, this.retryOpts);
    return data.response;
  }

  async generateWithOpenRouter(prompt) {
    const payload = (model) => ({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    const makeRequest = async (model) => jsonFetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Job Copilot'
      },
      body: JSON.stringify(payload(model))
    }, this.retryOpts);

    try {
      const data = await makeRequest(this.openrouterModel);
      return data.choices[0].message.content;
    } catch (e) {
      // If rate limited on free model, fallback once to provider auto-router
      const message = e?.message || '';
      const is429 = /(^|\s)429(\s|:)/.test(message) || message.toLowerCase().includes('rate');
      if (is429) {
        logger.warn('OpenRouter free model rate-limited. Falling back to openrouter/auto once.');
        const data = await makeRequest('openrouter/auto');
        return data.choices[0].message.content;
      }
      logger.error('OpenRouter error:', message);
      throw e;
    }
  }

  async generateWithGemini(prompt) {
    const run = async () => {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    };
    return await this._withRetrySDK(run, 'Gemini');
  }

  async generateWithGroq(prompt) {
    const run = async () => {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 4000
      });
      return completion.choices[0].message.content;
    };
    return await this._withRetrySDK(run, 'Groq');
  }

  async _withRetrySDK(fn, label) {
    const maxRetries = Number(process.env.OUTBOUND_MAX_RETRIES || 3);
    const initialBackoffMs = Number(process.env.OUTBOUND_INITIAL_BACKOFF_MS || 500);
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (e) {
        const msg = e?.message?.toLowerCase?.() || '';
        const retriable = msg.includes('rate') || msg.includes('429') || msg.includes('temporar') || msg.includes('timeout') || msg.includes('network');
        if (attempt === maxRetries || !retriable) throw e;
        const delay = Math.floor(Math.random() * (initialBackoffMs * Math.pow(2, attempt)));
        logger.warn(`${label} SDK call failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms. Reason: ${e?.message}`);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
      }
    }
  }
}

export default new AIService();
