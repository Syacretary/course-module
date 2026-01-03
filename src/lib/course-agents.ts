import { callGroq, parseJSON, GROQ_MODELS } from "@/lib/groq";
import { PersonalizationQuestion, Chapter, SubMaterial } from "@/types/course";
import { getRoadmapContent } from "@/lib/roadmap-scraper";

// Agent 1: Generate personalization questions
export async function generatePersonalizationQuestions(
  topics: string[]
): Promise<PersonalizationQuestion[]> {
  const topicsStr = topics.join(", ");
  
  const prompt = `Kamu adalah AI yang membantu membuat pertanyaan personalisasi untuk course generator.
Topik yang dipilih pengguna: ${topicsStr}

Buatkan 4-5 pertanyaan personalisasi untuk menyesuaikan course dengan kebutuhan pengguna.
Pertanyaan harus fokus pada:
1. Tujuan belajar (untuk apa mempelajari topik ini)
2. Level pengalaman saat ini
3. Latar belakang teknis yang sudah dimiliki
4. Preferensi cara belajar
5. Waktu yang tersedia untuk belajar

Format output JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Pertanyaan disini?",
      "suggestedAnswers": ["Jawaban 1", "Jawaban 2", "Jawaban 3", "Jawaban 4", "Jawaban 5"]
    }
  ]
}

Pastikan jawaban yang disarankan relevan dan mencakup berbagai kemungkinan.`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah AI assistant yang membantu membuat pertanyaan personalisasi dalam bahasa Indonesia. Output harus dalam format JSON yang valid." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.7);

  const parsed = parseJSON<{ questions: PersonalizationQuestion[] }>(response);
  return parsed.questions;
}

// Agent 2: Generate suggested answers for questions
export async function generateSuggestedAnswers(
  question: string,
  topics: string[]
): Promise<string[]> {
  const prompt = `Berikan 5 rekomendasi jawaban untuk pertanyaan berikut dalam konteks pembelajaran ${topics.join(", ")}:

Pertanyaan: "${question}"

Format output JSON:
{
  "answers": ["jawaban 1", "jawaban 2", "jawaban 3", "jawaban 4", "jawaban 5"]
}

Pastikan jawaban bervariasi dan mencakup berbagai kemungkinan respons pengguna.`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah AI assistant yang membantu membuat rekomendasi jawaban dalam bahasa Indonesia. Output harus dalam format JSON yang valid." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.8);

  const parsed = parseJSON<{ answers: string[] }>(response);
  return parsed.answers;
}

// Agent 3: Chapter planner - creates 6 chapter titles
export async function generateChapterPlan(
  topics: string[],
  answers: Array<{ question: string; answer: string }>
): Promise<Array<{ number: number; title: string; description: string }>> {
  const topicsStr = topics.join(", ");
  const personalization = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");

  // Fetch roadmap context for the primary topic
  const primaryTopic = topics[0];
  let roadmapContext = "";
  if (primaryTopic) {
    const context = await getRoadmapContent(primaryTopic);
    if (context) {
      roadmapContext = `\n\nREFERENSI ROADMAP TERBARU (${primaryTopic}):\n${context}\n\nGunakan referensi di atas untuk memastikan urutan materi up-to-date.`;
    }
  }

  const prompt = `Kamu adalah AI penyusun struktur course untuk topik: ${topicsStr}

Informasi personalisasi pengguna:
${personalization}${roadmapContext}

Buatkan rencana 6 bab course yang:
1. Mengikuti urutan pembelajaran yang efektif (dari dasar ke lanjutan)
2. Disesuaikan dengan level dan kebutuhan pengguna berdasarkan jawaban personalisasi
3. Mencakup semua aspek penting dari topik
4. MENGUTAMAKAN materi terkini (state-of-the-art)

Format output JSON:
{
  "chapters": [
    {
      "number": 1,
      "title": "Judul Bab",
      "description": "Deskripsi singkat isi bab"
    }
  ]
}`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah AI course architect yang ahli menyusun kurikulum pembelajaran modern. Kamu mengutamakan praktik industri terkini. Output dalam format JSON yang valid dan bahasa Indonesia." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.POWERFUL, 0.6);

  const parsed = parseJSON<{ chapters: Array<{ number: number; title: string; description: string }> }>(response);
  return parsed.chapters;
}

// Agent 4: Generate sub-materials for a chapter
export async function generateSubMaterialTitles(
  chapterTitle: string,
  chapterNumber: number,
  topics: string[],
  totalChapters: number
): Promise<Array<{ id: string; title: string }>> {
  const prompt = `Kamu adalah AI penyusun submateri untuk Bab ${chapterNumber}: "${chapterTitle}"
Topik utama: ${topics.join(", ")}

Buatkan 5-7 judul submateri yang:
1. Sesuai dengan judul bab
2. Urutan pembelajaran yang efisien
3. Mencakup semua konsep penting di bab ini

Format output JSON:
{
  "subMaterials": [
    { "id": "ch${chapterNumber}-sub1", "title": "Judul Submateri 1" },
    { "id": "ch${chapterNumber}-sub2", "title": "Judul Submateri 2" }
  ]
}`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah AI curriculum designer. Output dalam format JSON yang valid dan bahasa Indonesia." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.6);

  const parsed = parseJSON<{ subMaterials: Array<{ id: string; title: string }> }>(response);
  return parsed.subMaterials;
}

// Agent 5: Generate content for a sub-material
export async function generateSubMaterialContent(
  subMaterialTitle: string,
  chapterTitle: string,
  topics: string[]
): Promise<string> {
  const prompt = `Kamu adalah Senior Developer yang sedang menulis dokumentasi teknis (cheatsheet).
JANGAN berikan: Sejarah, definisi kamus, basa-basi "apa itu", atau filosofi.
LANGSUNG berikan: Implementasi teknis, Syntax, dan Contoh Kode.

Konteks:
Bab: ${chapterTitle}
Submateri: ${subMaterialTitle}
Topik: ${topics.join(", ")}

Struktur Materi Wajib:
1. **Syntax & Signature**: Tampilkan bentuk dasar/rumus kodenya.
2. **Technical Breakdown**: Jelaskan parameter, argumen, tipe data, dan return value.
3. **Live Code Example**: Contoh kode riil yang bisa di-copy paste dan jalan. Berikan komentar di dalam kode untuk menjelaskan baris penting.
4. **Common Pitfalls**: Kesalahan teknis yang sering terjadi (error handling, memory leak, dll).
5. **Best Practice**: Cara penulisan yang standar di industri.

Gunakan bahasa Indonesia yang lugas, teknis, dan to-the-point. Anggap pembaca sudah paham konsep dasar dan ingin tahu "cara pakainya".`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah Technical Lead yang benci basa-basi. Kamu hanya peduli pada code correctness, syntax, dan implementasi. Output Markdown." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.FAST, 0.5); // Lower temperature for more precise technical output

  return response;
}

// Master function to generate full course
export async function generateFullCourse(
  topics: string[],
  answers: Array<{ question: string; answer: string }>,
  onProgress: (phase: string, current: number, total: number) => void
): Promise<{ title: string; description: string; chapters: Chapter[] }> {
  // Step 1: Generate chapter plan
  onProgress("Menyusun struktur bab...", 0, 6);
  const chapterPlan = await generateChapterPlan(topics, answers);
  
  const chapters: Chapter[] = [];
  
  // Step 2-7: Generate sub-materials for each chapter
  for (let i = 0; i < chapterPlan.length; i++) {
    const chapter = chapterPlan[i];
    onProgress(`Menyusun Bab ${chapter.number}: ${chapter.title}`, i + 1, chapterPlan.length);
    
    // Get sub-material titles
    const subMaterialTitles = await generateSubMaterialTitles(
      chapter.title,
      chapter.number,
      topics,
      chapterPlan.length
    );
    
    // Generate content for each sub-material
    const subMaterials: SubMaterial[] = [];
    for (const subTitle of subMaterialTitles) {
      // Add a delay to prevent rate limiting (TPM) - increased to 10s for safety
      await new Promise(resolve => setTimeout(resolve, 10000));

      const content = await generateSubMaterialContent(
        subTitle.title,
        chapter.title,
        topics
      );
      subMaterials.push({
        id: subTitle.id,
        title: subTitle.title,
        content
      });
    }
    
    chapters.push({
      id: `chapter-${chapter.number}`,
      number: chapter.number,
      title: chapter.title,
      subMaterials
    });
  }
  
  // Generate course title and description
  const courseTitle = `Panduan Lengkap ${topics.join(" & ")}`;
  const courseDescription = `Course komprehensif untuk mempelajari ${topics.join(", ")} dari dasar hingga mahir. Disesuaikan dengan kebutuhan dan level Anda.`;
  
  return {
    title: courseTitle,
    description: courseDescription,
    chapters
  };
}
