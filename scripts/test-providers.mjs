import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

console.log(`${colors.blue}=== AI PROVIDER CONNECTION TEST (RETRY) ===${colors.reset}\n`);

async function testOpenRouter() {
  console.log("Testing OpenRouter (DeepSeek R1 Distill)...");
  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    
    // Trying a more standard free model ID if strict R1 failed
    const modelId = "deepseek/deepseek-r1-distill-llama-70b:free"; 
    
    const start = Date.now();
    const completion = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: "Hi" }],
    });
    const duration = Date.now() - start;
    
    console.log(`${colors.green}✔ OpenRouter Success${colors.reset} (${duration}ms)`);
    console.log(`  Model: ${modelId}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ OpenRouter Failed:${colors.reset} ${error.message}\n`);
    return false;
  }
}

async function testGroq() {
  console.log("Testing Groq (Llama 3.3 70B)...");
  try {
    const client = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.VITE_GROQ_API_KEY,
    });
    
    const start = Date.now();
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Updated model ID
      messages: [{ role: "user", content: "Hi" }],
    });
    const duration = Date.now() - start;
    
    console.log(`${colors.green}✔ Groq Success${colors.reset} (${duration}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ Groq Failed:${colors.reset} ${error.message}\n`);
    return false;
  }
}

async function testHuggingFace() {
  console.log("Testing Hugging Face (Chat Completion)...");
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    const start = Date.now();
    // Using chatCompletion instead of textGeneration
    const result = await hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 50
    });
    const duration = Date.now() - start;
    
    console.log(`${colors.green}✔ Hugging Face Success${colors.reset} (${duration}ms)`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✘ Hugging Face Failed:${colors.reset} ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  const r1 = await testOpenRouter();
  const r3 = await testGroq();
  const r4 = await testHuggingFace();

  console.log(`${colors.blue}=== SUMMARY ===${colors.reset}`);
  console.log(`OpenRouter: ${r1 ? '✅' : '❌'}`);
  console.log(`Groq:       ${r3 ? '✅' : '❌'}`);
  console.log(`HuggingFace:${r4 ? '✅' : '❌'}`);
  console.log(`Google AI:  ⚠️ SKIPPED (Key Revoked)`);
}

runTests();