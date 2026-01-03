async function testProxy() {
  console.log("Testing Proxy Endpoint (http://localhost:3001/api/chat)...");
  
  const payload = {
    messages: [{ role: "user", content: "Test connection to AI provider" }],
    tier: "powerful" 
  };

  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
    
    if (response.ok) {
      console.log("✅ Proxy works!");
    } else {
      console.log("❌ Proxy returned error.");
    }

  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testProxy();