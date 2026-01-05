export async function fetchWebPageContent(url: string): Promise<string> {
  try {
    // Gunakan AllOrigins sebagai proxy untuk bypass CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) return "";

    // Parse HTML string menjadi DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    // Bersihkan script dan style
    const scripts = doc.querySelectorAll('script, style, nav, footer, header, aside');
    scripts.forEach(script => script.remove());

    // Ambil konten utama (coba tebak elemen artikel)
    const contentNodes = doc.querySelectorAll('p, h1, h2, h3, h4, li');
    let textContent = "";

    contentNodes.forEach(node => {
      const text = node.textContent?.trim();
      if (text && text.length > 50) { // Hanya ambil paragraf yang cukup panjang
        textContent += text + "\n\n";
      }
    });

    return textContent.slice(0, 5000); // Batasi 5000 karakter per halaman agar tidak overload token
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return "";
  }
}
