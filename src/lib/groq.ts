// AI Proxy integration
// Replaces direct Groq calls with our custom Load Balanced Proxy

const PROXY_API_URL = "/api/chat";

// We keep these constants to avoid breaking imports in other files,
// but they map to 'tiers' in the backend now.
export const GROQ_MODELS = {
  FAST: "llama-3.1-8b-instant", // Maps to tier: 'fast'
  BALANCED: "llama-3.1-70b-versatile", // Maps to tier: 'powerful'
  POWERFUL: "llama-3.3-70b-versatile", // Maps to tier: 'powerful'
} as const;

type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ProxyResponse {
  content: string;
  error?: string;
}

export async function callGroq(
  messages: ChatMessage[],
  model: GroqModel = GROQ_MODELS.BALANCED,
  temperature: number = 0.7
): Promise<string> {
  
  // Map legacy model names to Proxy Tiers
  let tier = 'powerful';
  if (model === GROQ_MODELS.FAST) {
    tier = 'fast';
  }

  try {
    const response = await fetch(PROXY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        tier,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.statusText}`);
    }

    const data: ProxyResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.content || "";

  } catch (error: any) {
    console.error("AI Proxy Call Failed:", error);
    throw error;
  }
}

export function parseJSON<T>(content: string): T {
  // Try to find JSON in markdown blocks first
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
  
  // If still not valid, try to find the first '{' and last '}'
  if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      jsonString = content.slice(startIdx, endIdx + 1);
    }
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON content:", content);
    // Attempt one last desperate fix: remove any trailing commas or common AI hallucinations
    try {
      const cleaned = jsonString
        .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
        .replace(/(\r\n|\n|\r)/gm, " "); // remove newlines
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error("Failed to parse JSON response from AI: " + (e2 as Error).message);
    }
  }
}
