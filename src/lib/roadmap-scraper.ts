export async function getRoadmapContent(topic: string): Promise<string | null> {
  try {
    // Normalize topic to slug (e.g., "React.js" -> "react", "Node.js" -> "nodejs")
    let slug = topic.toLowerCase()
      .replace(/\.js$/, "js") // node.js -> nodejs
      .replace(/\s+/g, "-") // machine learning -> machine-learning
      .replace(/[^a-z0-9-]/g, ""); // remove special chars

    // Manual overrides for common mismatches
    const overrides: Record<string, string> = {
      "c++": "cpp",
      "c#": "csharp",
      ".net": "dotnet",
      "vue.js": "vue",
      "angular": "angular",
    };

    if (overrides[topic.toLowerCase()]) {
      slug = overrides[topic.toLowerCase()];
    }

    const targetUrl = `https://roadmap.sh/${slug}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    console.log(`Fetching roadmap context for: ${slug}`);

    const response = await fetch(proxyUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const html = data.contents;

    if (!html) return null;

    // Simple HTML to Text stripper
    // 1. Remove scripts and styles
    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                  .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");
    
    // 2. Extract text from body (naive)
    // We try to find the main content. Roadmap.sh usually puts content in specific blocks, 
    // but just stripping tags is a good start for a "context dump".
    text = text.replace(/<[^>]+>/g, " "); // Strip tags
    text = text.replace(/\s+/g, " ").trim(); // Normalize whitespace

    // 3. Limit length to avoid token explosion (take the first 3000 chars)
    // Roadmap.sh pages often list topics early on.
    return text.slice(0, 3000) + "...";

  } catch (error) {
    console.warn("Failed to fetch roadmap context:", error);
    return null;
  }
}
