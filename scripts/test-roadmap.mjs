async function getRoadmapContent(topic) {
  try {
    let slug = topic.toLowerCase()
      .replace(/\.js$/, "js") 
      .replace(/\s+/g, "-") 
      .replace(/[^a-z0-9-]/g, "");

    const overrides = {
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

    console.log(`\n--- Testing Topic: ${topic} (Slug: ${slug}) ---`);
    console.log(`Fetching from: ${targetUrl}`);

    const start = Date.now();
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status}`);
        return null;
    }

    const data = await response.json();
    const html = data.contents;

    if (!html) {
        console.error("❌ No contents found in proxy response.");
        return null;
    }

    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                  .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");
    
    text = text.replace(/<[^>]+>/g, " "); 
    text = text.replace(/\s+/g, " ").trim(); 

    const duration = Date.now() - start;
    console.log(`✅ Success (${duration}ms)`);
    console.log(`Preview: ${text.slice(0, 300)}...`);
    console.log(`Length: ${text.length} characters`);

    return text;

  } catch (error) {
    console.error("❌ Failed:", error.message);
    return null;
  }
}

async function runTests() {
  const topics = [
    "React", 
    "Node.js", 
    "Python", 
    "Docker", 
    "Machine Learning", 
    "Frontend"
  ];

  console.log("=== STARTING ROADMAP SCRAPER TEST ===");
  
  for (const topic of topics) {
    await getRoadmapContent(topic);
    // Delay to be nice to the proxy
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n=== TEST COMPLETED ===");
}

runTests();
