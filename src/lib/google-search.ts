
const GOOGLE_KEY = "AIzaSyBSY49ZrSKY7lRs9bX3V1Sd11jYuntScBw";
const GOOGLE_CX = "40d5fbdf4db1945d9";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
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
