import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testGoogle() {
  console.log("Testing New Google AI Key...");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const start = Date.now();
    const result = await model.generateContent("Say 'System Online'");
    const response = await result.response;
    const duration = Date.now() - start;

    console.log(`\x1b[32m✔ Google AI Success\x1b[0m (${duration}ms)`);
    console.log(`  Response: ${response.text()}`);
    return true;
  } catch (error) {
    console.log(`\x1b[31m✘ Google AI Failed:\x1b[0m ${error.message}`);
    return false;
  }
}

testGoogle();
