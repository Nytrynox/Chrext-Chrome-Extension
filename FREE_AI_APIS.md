# FREE AI API Options

## 🆓 Option 1: Google Gemini (CURRENT - FREE)
✅ Already configured in your project
✅ 1,500 requests/day FREE forever
✅ Get key: https://makersuite.google.com/app/apikey

```bash
GEMINI_API_KEY=your-free-key-here
AI_PROVIDER=gemini
```

## 🚀 Option 2: Groq (FASTER - FREE)
✅ 30 requests/min FREE
✅ 10x faster than OpenAI
✅ Get key: https://console.groq.com/keys

```bash
npm install groq-sdk
```

```bash
GROQ_API_KEY=your-free-groq-key
AI_PROVIDER=groq
```

## 🎯 Option 3: Hugging Face (FREE)
✅ Unlimited FREE tier (rate-limited)
✅ Get token: https://huggingface.co/settings/tokens

```bash
npm install @huggingface/inference
```

```bash
HUGGINGFACE_TOKEN=your-free-token
AI_PROVIDER=huggingface
```

## 💻 Option 4: Ollama (100% FREE - LOCAL)
✅ Completely FREE
✅ Runs on your computer
✅ No API limits
❌ Requires 8GB+ RAM

```bash
# Install Ollama: https://ollama.ai
ollama pull llama3
ollama serve
```

```bash
OLLAMA_URL=http://localhost:11434
AI_PROVIDER=ollama
```

## 📊 Comparison

| Provider | Speed | Free Limit | Best For |
|----------|-------|------------|----------|
| **Gemini** | Fast | 1,500/day | Already setup ✅ |
| **Groq** | Very Fast | 30/min | Speed + Quality |
| **Hugging Face** | Medium | Rate-limited | Backup option |
| **Ollama** | Medium | Unlimited | Complete privacy |

## 🎯 Recommended FREE Setup

**For MVP (Current):**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-free-key
```

**For Production (Fastest):**
```bash
AI_PROVIDER=groq
GROQ_API_KEY=your-free-groq-key
```

**For Privacy (Local):**
```bash
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

## 🔧 How to Switch

### 1. Get FREE API Key

**Gemini (Current):**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy key

**Groq (Faster):**
1. Go to https://console.groq.com
2. Sign up FREE
3. Go to "API Keys"
4. Create new key

### 2. Update .env

```bash
# Choose one:
AI_PROVIDER=gemini  # or 'groq' or 'ollama'
GEMINI_API_KEY=your-key-here
GROQ_API_KEY=your-groq-key-here
```

### 3. Install SDK (if using Groq)

```bash
cd backend
npm install groq-sdk
```

### 4. Restart Server

```bash
npm run dev
```

## ✅ All Options are 100% FREE!

No credit card required for:
- ✅ Google Gemini (1,500/day)
- ✅ Groq (30/min)
- ✅ Hugging Face (rate-limited)
- ✅ Ollama (unlimited local)

## 💡 Cost Comparison

| Provider | Free Tier | After Free |
|----------|-----------|------------|
| Gemini | 1,500/day | Still FREE up to 60 req/min |
| Groq | 30/min | Still FREE (fair use) |
| OpenAI | $5 credit | $0.03 per 1K tokens |
| Claude | Limited | $0.015 per 1K tokens |

**Recommendation: Use Gemini (already setup) or Groq (faster) - both FREE forever!**
