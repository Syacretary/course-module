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
      "go": "golang",
      "full-stack": "full-stack",
      "software-architect": "software-architect",
      "ai-data-scientist": "ai-data-scientist",
      "qa-engineer": "qa",
      "ux-design": "ux-design",
      "server-side-game-dev": "server-side-game-dev"
    };

    if (overrides[slug]) {
      slug = overrides[slug];
    }

    const targetUrl = `https://roadmap.sh/${slug}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) return { topic, slug, status: "❌ HTTP Error" };

    const data = await response.json();
    const html = data.contents;

    if (!html || html.includes("404: Not Found") || html.length < 500) {
      return { topic, slug, status: "⚠️ 404 / No Content" };
    }

    return { topic, slug, status: "✅ SUCCESS", length: html.length };

  } catch (error) {
    return { topic, slug: "err", status: `❌ Fail: ${error.message}` };
  }
}

async function runFullTest() {
  const topics = [
    "Frontend", "React", "Vue.js", "Angular",
    "Backend", "Node.js", "Python", "Go", "Full Stack", "Software Architect", "PostgreSQL", "MongoDB",
    "Data Analyst", "Data Engineer", "AI & Data Scientist", "AI Engineer", "Machine Learning", "BI Analyst",
    "DevOps", "DevSecOps", "Cyber Security", "MLOps",
    "Android", "iOS", "React Native", "Flutter",
    "Blockchain", "QA Engineer", "UX Design", "Technical Writer", "Game Developer", "Server Side Game Dev", "Product Manager", "Engineering Manager", "Developer Relations"
  ];

  console.log(`=== TESTING ALL ${topics.length} TOPICS ===\n`);
  
  // We process in batches of 5 to avoid overwhelming the proxy but keep speed
  const results = [];
  for (let i = 0; i < topics.length; i += 5) {
    const batch = topics.slice(i, i + 5);
    console.log(`Processing batch ${Math.floor(i/5) + 1}...`);
    const batchResults = await Promise.all(batch.map(t => getRoadmapContent(t)));
    results.push(...batchResults);
  }

  console.log("\n=== TEST SUMMARY ===");
  console.log("TOPIC".padEnd(25) | "SLUG".padEnd(20) | "STATUS");
  console.log("-".repeat(60));
  
  results.forEach(r => {
    const statusColor = r.status.includes("✅") ? "\x1b[32m" : r.status.includes("⚠️") ? "\x1b[33m" : "\x1b[31m";
    console.log(`${r.topic.padEnd(25)} | ${r.slug.padEnd(20)} | ${statusColor}${r.status}\x1b[0m`);
  });

  const successCount = results.filter(r => r.status.includes("✅")).length;
  console.log(`\nFinal result: ${successCount}/${topics.length} Roadmaps synchronized.`);
}

runFullTest();
