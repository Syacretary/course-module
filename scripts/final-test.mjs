import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

console.log(`${colors.blue}=== FINAL MULTI-PROVIDER HEALTH CHECK ===${colors.reset}\n`);

async function testOpenRouter() {
  console.log("Testing OpenRouter (Llama 405B Free)...");
  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    const start = Date.now();
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-405b-instruct:free",
      messages: [{ role: "user", content: "Hi" }],
      extraHeaders: { "HTTP-Referer": "http://localhost:3000", "X-Title": "Test" }
    });
    console.log(`${colors.green}✔ OpenRouter Success${colors.reset} (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ OpenRouter Failed:${colors.reset} ${error.message}`);
    return false;
  }
}

async function testGoogle() {
  console.log("Testing Google AI (Gemini 2.0 Flash)...");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const start = Date.now();
    const result = await model.generateContent("Hi");
    await result.response;
    console.log(`${colors.green}✔ Google AI Success${colors.reset} (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠ Google AI Note:${colors.reset} ${error.message.includes('429') ? 'Rate Limited (Normal for Free Tier)' : error.message}`);
    return false;
  }
}

async function testGroq() {
  console.log("Testing Groq (Llama 3.3 70B)...");
  try {
    const client = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });
    const start = Date.now();
    await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log(`${colors.green}✔ Groq Success${colors.reset} (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ Groq Failed:${colors.reset} ${error.message}`);
    return false;
  }
}

async function testHuggingFace() {
  console.log("Testing Hugging Face (Llama 3 8B)...");
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    const start = Date.now();
    await hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 10
    });
    console.log(`${colors.green}✔ Hugging Face Success${colors.reset} (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ Hugging Face Failed:${colors.reset} ${error.message}`);
    return false;
  }
}

async function run() {
  const results = {
    OpenRouter: await testOpenRouter(),
    Google: await testGoogle(),
    Groq: await testGroq(),
    HuggingFace: await testHuggingFace()
  };

  console.log(`\n${colors.blue}=== FINAL SUMMARY ===${colors.reset}`);
  Object.entries(results).forEach(([provider, status]) => {
    console.log(`${provider.padEnd(12)}: ${status ? colors.green + 'ONLINE ✅' : colors.red + 'OFFLINE ❌'}${colors.reset}`);
  });
  console.log(`\nServer Proxy siap melakukan rotasi cerdas.`);
}

run();
