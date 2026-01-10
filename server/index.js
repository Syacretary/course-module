import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- CLIENTS ---
const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const googleModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- PROVIDERS LOGIC ---

async function callOpenRouter(messages, model = "meta-llama/llama-3.1-405b-instruct:free") {
  console.log(`[Proxy] Calling OpenRouter (${model})...`);
  const completion = await openrouter.chat.completions.create({
    model,
    messages,
    extraHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Course Module Local",
    },
  });
  return completion.choices[0].message.content;
}

async function callGoogle(messages) {
  console.log(`[Proxy] Calling Google AI (Gemini 2.0)...`);
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const chat = googleModel.startChat({
    history: userMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    systemInstruction: systemMessage?.content,
  });

  const result = await chat.sendMessage(userMessages[userMessages.length - 1].content);
  return result.response.text();
}

async function callGroq(messages, model = "llama-3.3-70b-versatile") {
  console.log(`[Proxy] Calling Groq (${model})...`);
  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
}

async function callHuggingFace(messages) {
  console.log(`[Proxy] Calling Hugging Face (Llama-3-8B)...`);
  const response = await hf.chatCompletion({
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

// Helper for fallback logic
async function withFallback(providers) {
  const errors = [];
  for (const provider of providers) {
    try {
      return await provider();
    } catch (err) {
      console.warn(`Provider failed: ${err.message}`);
      errors.push(err.message);
    }
  }
  throw new Error(`All providers failed: ${errors.join(" | ")}`);
}

// --- ROUTER LOGIC ---

app.post('/api/chat', async (req, res) => {
  const { messages, tier } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    let content;
    if (tier === 'fast') {
      content = await withFallback([
        () => callGroq(messages, "llama-3.1-8b-instant"),
        () => callHuggingFace(messages)
      ]);
    } else {
      content = await withFallback([
        () => callGroq(messages, "llama-3.3-70b-versatile"),
        () => callOpenRouter(messages),
        () => callGoogle(messages)
      ]);
    }

    res.json({ content });
  } catch (error) {
    console.error("CRITICAL PROXY ERROR:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Proxy Server running on http://localhost:${PORT}`);
  console.log(`   - Priority: Groq > OpenRouter > Google > HF`);
});