import { callGroq, GROQ_MODELS, parseJSON } from "./groq";
import { getRoadmapContent } from "./roadmap-scraper";
import { searchGoogle } from "./google-search";
import { fetchWebPageContent } from "./web-scraper";
import { SyllabusChapter } from "@/types/course";

// Helper: Classifier Agent
async function classifyTopic(topic: string): Promise<"programming" | "general"> {
  const prompt = `Classify the topic "${topic}".
  If it is related to Software Engineering, Programming, DevOps, or Computer Science strictly (where roadmap.sh would have a guide), output "programming".
  Otherwise (History, Biology, Cooking, Business, Math, General Science, etc), output "general".
  Output ONLY the word.`;

  const response = await callGroq([
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.1); // Use fast model for classification

  const clean = response.trim().toLowerCase();
  return clean.includes("programming") ? "programming" : "general";
}

// Helper: General Research Agent
async function performGeneralResearch(topic: string): Promise<string> {
  console.log(`[Research Agent] Searching web for: ${topic}...`);
  
  // 1. Search Google
  const searchResults = await searchGoogle(`${topic} learning curriculum syllabus guide`);
  if (searchResults.length === 0) return "";

  // 2. Select Top 4 URLs to scrape (limit to 4 to save time/bandwidth)
  const topResults = searchResults.slice(0, 4);
  let aggregatedContent = `Web Search Results for "${topic}":

`;

  // 3. Scrape in parallel
  const scrapePromises = topResults.map(async (result) => {
    const content = await fetchWebPageContent(result.link);
    return `Source: ${result.title}\nURL: ${result.link}\nSummary:\n${content.slice(0, 1000)}...\n\n`;
  });

  const scrapedData = await Promise.all(scrapePromises);
  aggregatedContent += scrapedData.join("\n---\n");

  return aggregatedContent;
}

// Main Agent: Syllabus Architect
export async function generateSyllabusBlueprint(
  topic: string,
  answers: Array<{ question: string; answer: string }>
): Promise<SyllabusChapter[]> {
  
  // 1. Classify Topic
  const category = await classifyTopic(topic);
  console.log(`[Syllabus Agent] Topic Category: ${category}`);

  let contextData = "";

  // 2. Fetch Context based on Category
  if (category === "programming") {
    try {
      const roadmap = await getRoadmapContent(topic);
      if (roadmap) contextData = `\nRoadmap.sh Reference:\n${roadmap.slice(0, 2000)}...`;
    } catch (e) {
      console.warn("Roadmap scraper failed, falling back to general logic.");
    }
  } else {
    // General Topic -> Web Search
    try {
      const webResearch = await performGeneralResearch(topic);
      if (webResearch) contextData = `\nWeb Research Data:\n${webResearch}`;
    } catch (e) {
      console.warn("General research failed.");
    }
  }

  const personalization = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
  
  const systemPrompt = `Anda adalah Arsitek Kurikulum Senior. Tugas Anda adalah merancang silabus (daftar bab) yang logis dan progresif berdasarkan profil pengguna dan data riset.

PRINSIP:
1. Mulai dari fundamental.
2. Tingkatkan kompleksitas bertahap.
3. Akhiri dengan proyek/penerapan/studi kasus.
4. Total 6-8 Bab (Minggu).

INPUT PENGGUNA:
Topik: ${topic}
Kategori: ${category}
Profil User:
${personalization}

CONTEXT REFERENCE (Gunakan ini sebagai acuan struktur materi):
${contextData}

OUTPUT JSON:
{
  "chapters": [
    {
      "id": "ch1",
      "number": 1,
      "title": "Judul Bab Menarik",
      "description": "Tujuan belajar bab ini dalam 1 kalimat.",
      "topics": ["Subtopik 1", "Subtopik 2", "Subtopik 3"]
    }
  ]
}`;

  const response = await callGroq([
    { role: "system", content: "Anda ahli kurikulum. Output JSON valid bahasa Indonesia." },
    { role: "user", content: systemPrompt }
  ], GROQ_MODELS.POWERFUL, 0.6);

  const parsed = parseJSON<{ chapters: SyllabusChapter[] }>(response);
  return parsed.chapters;
}