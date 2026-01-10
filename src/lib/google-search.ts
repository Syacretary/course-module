const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_SEARCH_KEY || "";
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX || "";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  if (!GOOGLE_KEY || !GOOGLE_CX) {
    console.warn("Google Search API Key or CX is missing. Search will be disabled.");
    return [];
  }
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
  } catch (error) {
    console.error("Google Search Error:", error);
    return [];
  }
}
