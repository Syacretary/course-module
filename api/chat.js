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
  const prompt = messages.map(m => `${m.role === 'system' ? 'Instruction' : m.role}: ${m.content}`).join("\n\n");
  const result = await googleModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callGroq(messages, model = "llama-3.3-70b-versatile") {
  console.log(`[Vercel] Calling Groq (${model})...`);
  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
}

async function callHuggingFace(messages) {
  console.log(`[Vercel] Calling Hugging Face (Llama-3-8B)...`);
  const response = await hf.chatCompletion({
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

// Vercel Serverless Handler
export default async function handler(req, res) {
  // CORS Handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { messages, tier } = req.body;

  try {
    let result;

    // --- STRATEGY: FAST TIER ---
    if (tier === 'fast') {
      try {
        result = await callGroq(messages, "llama-3.1-8b-instant");
      } catch (err) {
        try {
          result = await callHuggingFace(messages);
        } catch (err2) {
          throw new Error("All Fast Tier providers failed");
        }
      }
    } 
    // --- STRATEGY: POWERFUL TIER ---
    else {
      try {
        result = await callGroq(messages, "llama-3.3-70b-versatile");
      } catch (err) {
        try {
          result = await callOpenRouter(messages);
        } catch (err2) {
          try {
            result = await callGoogle(messages);
          } catch (err3) {
            throw new Error("All Powerful Tier providers failed");
          }
        }
      }
    }

    res.status(200).json({ content: result });

  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({ error: "AI Service Unavailable. Please try again." });
  }
}