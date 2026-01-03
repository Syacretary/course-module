import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

async function listOpenRouterModels() {
  console.log("Fetching OpenRouter Model List...");
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data;

    console.log(`Found ${models.length} models.`);
    
    // Filter for free models (usually contain 'free' in id or name, or pricing is 0)
    // Note: OpenRouter metadata structure varies, but let's look for likely candidates.
    
    const freeCandidates = models.filter(m => 
      m.id.toLowerCase().includes('free') || 
      (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0')
    );

    console.log("\n=== Potential Free Models ===");
    freeCandidates.forEach(m => console.log(`- ID: ${m.id} | Name: ${m.name}`));

    if (freeCandidates.length === 0) {
      console.log("No explicit 'free' models found via keyword. Listing top 5 cheapest/random:");
      models.slice(0, 5).forEach(m => console.log(`- ${m.id}`));
    }

  } catch (error) {
    console.error("Failed to list models:", error.message);
  }
}

listOpenRouterModels();
