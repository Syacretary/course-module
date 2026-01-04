export async function getRoadmapContent(topic: string): Promise<string | null> {
  try {
    // 1. Standarisasi awal (lowercase & ubah spasi/simbol jadi dash)
    let slug = topic.toLowerCase()
      .replace(/\.js$/, "js") // handle .js di akhir
      .replace(/[^a-z0-9]+/g, "-") // ubah semua karakter non-alfanumerik jadi satu dash
      .replace(/^-+|-+$/g, ""); // bersihkan dash di awal/akhir

    // 2. Manual Overrides (Mapping spesifik untuk roadmap.sh)
    const overrides: Record<string, string> = {
      // Language & Frameworks
      "vue-js": "vue",
      "vue": "vue",
      "go": "golang",
      "golang": "golang",
      "angular": "angular",
      "c-plus-plus": "cpp",
      "cpp": "cpp",
      "c-sharp": "csharp",
      "csharp": "csharp",
      "dot-net": "dotnet",
      
      // Data & AI
      "ai-data-scientist": "ai-data-scientist",
      "ai-scientist": "ai-data-scientist",
      "bi-analyst": "business-analyst", // Roadmap.sh uses business-analyst
      
      // Mobile
      "react-native": "react-native",
      "flutter": "flutter",
      
      // Specializations
      "qa-engineer": "qa",
      "qa": "qa",
      "ux-design": "ux-design",
      "game-developer": "game-developer",
      "server-side-game-dev": "server-side-game-development",
      "product-manager": "product-manager",
      "engineering-manager": "engineering-manager",
      "developer-relations": "devrel", // Roadmap.sh uses devrel
    };

    if (overrides[slug]) {
      slug = overrides[slug];
    }

    const targetUrl = `https://roadmap.sh/${slug}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    console.log(`[Scraper] Fetching live roadmap for: ${topic} (slug: ${slug})`);

    const response = await fetch(proxyUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const html = data.contents;

    if (!html || html.includes("404: Not Found")) return null;

    // Simple HTML to Text stripper
    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                  .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");
    
    text = text.replace(/<[^>]+>/g, " "); 
    text = text.replace(/\s+/g, " ").trim(); 

    // Return the first 4000 characters for context
    return text.slice(0, 4000) + "...";

  } catch (error) {
    console.warn("[Scraper] Failed to fetch roadmap context:", error);
    return null;
  }
}