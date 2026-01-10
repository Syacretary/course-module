import { callGroq, GROQ_MODELS, parseJSON } from "./groq";

// --- Types ---
export interface ResearchResult {
  source: "wikipedia" | "arxiv" | "web" | "roadmap";
  title: string;
  url: string;
  snippet: string;
}

// --- Wikipedia Tool ---
export async function searchWikipedia(query: string, limit: number = 3): Promise<ResearchResult[]> {
  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=${limit}&srsearch=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data.query || !data.query.search) return [];

    return data.query.search.map((item: any) => ({
      source: "wikipedia",
      title: item.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      snippet: item.snippet.replace(/<[^>]*>/g, '') // Remove HTML tags
    }));
  } catch (error) {
    console.error("Wikipedia search failed:", error);
    return [];
  }
}

// --- ArXiv Tool (Scholarly) ---
export async function searchArxiv(query: string, limit: number = 3): Promise<ResearchResult[]> {
  try {
    // Use HTTPS and add a better query structure
    const endpoint = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) throw new Error(`ArXiv API error: ${response.status}`);
    
    const text = await response.text();

    const results: ResearchResult[] = [];
    // More robust regex for entry matching
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(text)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "No Title";
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "No Summary";
      const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1] || "";

      results.push({
        source: "arxiv",
        title: title.trim().replace(/\s+/g, ' '),
        url: id.trim(),
        snippet: summary.trim().replace(/\s+/g, ' ').slice(0, 400) + "..."
      });
    }
    return results;
  } catch (error) {
    console.error("ArXiv search failed:", error);
    return [];
  }
}

import { searchGoogle } from "./google-search";

// --- Synthesizer Agent ---
// Aggregates research from multiple sources into a coherent context
export async function synthesizeResearch(topic: string, isAcademic: boolean = false): Promise<string> {
  console.log(`[Research Agent] Synthesizing data for: ${topic}`);

  const promises: Promise<any>[] = [
    searchWikipedia(topic, 2),
    searchGoogle(topic),
  ];

  if (isAcademic) {
    promises.push(searchArxiv(topic, 2));
  }

  const results = (await Promise.all(promises)).flat();

  if (results.length === 0) return "";

  // Summarize findings using LLM
  const contextStr = results.map(r => `[${(r.source || 'web').toUpperCase()}] ${r.title}: ${r.snippet || r.content} (${r.url || r.link})`).join("\n\n");
  
  const prompt = `You are a Research Assistant. Summarize the following raw research data about "${topic}" into a concise Key Concepts list for a curriculum designer.
  
  Raw Data:
  ${contextStr.slice(0, 5000)}
  
  Output Format:
  - Key Concept (Source)
  - Key Concept (Source)`;

  const summary = await callGroq([
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.5);

  return summary;
}
