import { OpenAI } from 'openai';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Clients
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

// Logic Providers
async function callOpenRouter(messages, model = "meta-llama/llama-3.1-405b-instruct:free") {
  console.log(`[Vercel] Calling OpenRouter (${model})...`);
  const completion = await openrouter.chat.completions.create({
    model,
    messages,
    extraHeaders: {
      "HTTP-Referer": "https://courseforge.vercel.app",
      "X-Title": "CourseForge",
    },
  });
  return completion.choices[0].message.content;
}

async function callGoogle(messages) {
  console.log(`[Vercel] Calling Google AI (Gemini 2.0)...`);
  
  // Convert OpenAI messages to Gemini format
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  
  const lastMessage = messages[messages.length - 1];
  
  // If there's a system message, we should ideally put it in systemInstruction, 
  // but for simplicity here we'll prepend it if it's the first message.
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

// Vercel Serverless Handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

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

    res.status(200).json({ content });
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({ error: error.message || "AI Service Unavailable" });
  }
}