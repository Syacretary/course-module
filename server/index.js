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

const PORT = 3001;

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
  console.log(`[Provider] Calling OpenRouter (${model})...`);
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
  console.log(`[Provider] Calling Google AI (Gemini 2.0 Flash)...`);
  const prompt = messages.map(m => `${m.role === 'system' ? 'Instruction' : m.role}: ${m.content}`).join("\n\n");
  const result = await googleModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callGroq(messages, model = "llama-3.3-70b-versatile") {
  console.log(`[Provider] Calling Groq (${model})...`);
  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
}

async function callHuggingFace(messages) {
  console.log(`[Provider] Calling Hugging Face (Llama-3-8B)...`);
  const response = await hf.chatCompletion({
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

// --- ROUTER LOGIC ---

app.post('/api/chat', async (req, res) => {
  const { messages, tier } = req.body;
  
  console.log(`[Request] Incoming request for tier: ${tier}`);

  try {
    let result;
    let errors = [];
    
    // --- STRATEGY: FAST TIER ---
    if (tier === 'fast') {
      // 1. Groq 8B (Fastest & Reliable) -> 2. HF (Free Backup)
      try {
        result = await callGroq(messages, "llama-3.1-8b-instant");
      } catch (err) {
        console.warn("Groq 8B Failed, trying HF...", err.message);
        errors.push(`Groq 8B: ${err.message}`);
        try {
          result = await callHuggingFace(messages);
        } catch (err2) {
          console.error("HF Failed:", err2.message);
          errors.push(`HF: ${err2.message}`);
          throw new Error("Fast Tier failed: " + errors.join(" | "));
        }
      }
    } 
    
    // --- STRATEGY: POWERFUL TIER ---
    else {
      // 1. Groq 70B (Most Reliable currently) 
      // 2. OpenRouter (High Potential but flaky)
      // 3. Google (Currently limited)
      
      try {
        result = await callGroq(messages, "llama-3.3-70b-versatile");
      } catch (err) {
        console.warn("Groq 70B Failed, trying OpenRouter...", err.message);
        errors.push(`Groq 70B: ${err.message}`);
        
        try {
          result = await callOpenRouter(messages);
        } catch (err2) {
          console.warn("OpenRouter Failed, trying Google...", err2.message);
          errors.push(`OpenRouter: ${err2.message}`);
          
          try {
            result = await callGoogle(messages);
          } catch (err3) {
            console.error("Google Failed:", err3.message);
            errors.push(`Google: ${err3.message}`);
            // Last resort fallback to Groq 8B if everything powerful fails?
            // result = await callGroq(messages, "llama-3.1-8b-instant");
            throw new Error("All Powerful Tier providers failed. " + errors.join(" | "));
          }
        }
      }
    }

    res.json({ content: result });

  } catch (error) {
    console.error("CRITICAL PROXY ERROR:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Proxy Server running on http://localhost:${PORT}`);
  console.log(`   - Priority: Groq > OpenRouter > Google > HF`);
});