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

// Agent 3: Chapter planner - creates 8-12 chapter titles based on neuroscience
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

  const systemPrompt = `Anda adalah seorang ahli kurikulum dan desainer pembelajaran dengan keahlian mendalam dalam neurosains kognitif dan pedagogi modern. Tugas Anda adalah menyusun struktur bab-bab untuk buku pembelajaran berdasarkan topik yang diminta pengguna.

### PRINSIP PENYUSUNAN BAB:

1. **NEUROPLASTISITAS & PROGRESSIVE COMPLEXITY**
   - Mulai dengan konsep konkret sebelum abstrak. Bangun dari familiar ke unfamiliar.
   - Tingkatkan kompleksitas secara bertahap (scaffolding).

2. **DOPAMINE-DRIVEN LEARNING**
   - Bab awal: quick wins untuk memicu motivasi. Bab tengah: tantangan sedang. Bab akhir: proyek integrasi yang memuaskan.

3. **COGNITIVE LOAD THEORY**
   - Pecah topik kompleks menjadi chunks yang manageable. Berikan "rest points" dengan bab praktis.

4. **INTERLEAVING & SPACED REPETITION**
   - Susun bab agar konsep penting muncul kembali dalam konteks berbeda. Kombinasikan teori dan praktik secara bergantian.

5. **MULTISENSORY INTEGRATION**
   - Variasikan jenis pembelajaran: konseptual, visual, praktis, reflektif.

### JIKA PENGGUNA MEMBERIKAN MULTIPLE TOPIK:
- Identifikasi benang merah yang menghubungkan semua topik.
- Susun bab dengan pendekatan spiral: perkenalkan semua topik secara ringan di awal, kemudian dalami secara bertahap.
- Jangan pisahkan topik per bab, tapi weave them together secara organik.

### FORMAT OUTPUT JSON:
Anda WAJIB memberikan output dalam format JSON yang valid dengan skema berikut:
{
  "chapters": [
    {
      "number": 1,
      "title": "Judul Bab yang Engaging",
      "description": "Tujuan: [Apa yang dikuasai]\\n\\nRasional: [Mengapa di posisi ini berdasarkan neurosains]\\n\\nIntegrasi: [Bagaimana topik-topik dianyam di sini]"
    }
  ]
}

Total bab: 8-12 bab. Gunakan bahasa Indonesia yang approachable dan menimbulkan curiosity.`;

  const userPrompt = `Topik: ${topicsStr}\n\nInformasi Personalisasi:\n${personalization}${roadmapContext}`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], GROQ_MODELS.POWERFUL, 0.6);

  const parsed = parseJSON<{ chapters: Array<{ number: number; title: string; description: string }> }>(response);
  return parsed.chapters;
}

// Agent 4: Generate sub-materials for a chapter based on micro-learning principles
export async function generateSubMaterialTitles(
  chapterTitle: string,
  chapterNumber: number,
  topics: string[],
  totalChapters: number
): Promise<Array<{ id: string; title: string }>> {
  const systemPrompt = `Anda adalah seorang instructional designer dengan spesialisasi dalam micro-learning dan chunking strategies. Tugas Anda adalah menyusun 6 submateri (subtopik) dalam sebuah bab.

### PRINSIP PENYUSUNAN SUBMATERI:

1. **CHUNKING PRINCIPLE**: Maksimal 6 submateri. Setiap submateri adalah satu "unit pemikiran" yang lengkap.
2. **FLOW STATE ARCHITECTURE**: 
   - Sub 1: Hook & Foundation.
   - Sub 2-3: Core Concepts.
   - Sub 4-5: Application & Deepening.
   - Sub 6: Integration & Bridge (jembatan ke bab berikutnya).
3. **COGNITIVE SEQUENCING**: Ikuti pola What → Why → How → Practice → Mastery.
4. **ACTIVE LEARNING**: Campurkan teori dengan submateri yang meminta refleksi atau eksperimen.

### FORMAT OUTPUT JSON:
Anda WAJIB memberikan output JSON valid dengan skema:
{
  "subMaterials": [
    { 
      "id": "ch${chapterNumber}-sub1", 
      "title": "Judul Actionable - [Metode: Konseptual/Praktis/dll] ([Durasi] min)" 
    }
  ]
}

Total submateri: HARUS 6. Gunakan bahasa Indonesia yang clear dan tidak mengintimidasi.`;

  const userPrompt = `Bab: ${chapterTitle}\nTopik: ${topics.join(", ")}\nBab ini adalah bab ke-${chapterNumber} dari total ${totalChapters} bab.`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], GROQ_MODELS.FAST, 0.6);

  const parsed = parseJSON<{ subMaterials: Array<{ id: string; title: string }> }>(response);
  return parsed.subMaterials;
}

// Agent 5: Generate content for a sub-material using Educator Master principles
export async function generateSubMaterialContent(
  subMaterialTitle: string,
  chapterTitle: string,
  topics: string[],
  subMaterialIndex: number
): Promise<string> {
  const systemPrompt = `Anda adalah seorang educator master dengan kemampuan menjelaskan konsep kompleks dengan cara yang engaging, accessible, dan memorable. Tugas Anda adalah mengisi konten lengkap untuk setiap submateri.

### PRINSIP PENYUSUNAN MATERI:

1. **CONVERSATIONAL TONE**: Tulis seperti mentor, gunakan "Anda/kamu", pertanyaan retoris, dan analogi relatable.
2. **DUAL CODING & ELABORATIVE ENCODING**: Gunakan analogi konkret untuk konsep abstrak. Jelaskan WHY dan HOW.
3. **ACTIVE LEARNING**: Sisipkan "Coba Sekarang", "Pertanyaan Refleksi", atau "Quick Challenge".
4. **FUSION LEARNING**: Untuk multiple topik, tunjukkan bagaimana topik-topik saling memperkuat secara natural.

### STRUKTUR KONTEN WAJIB:
- **HOOK** (100-150 kata): Grab attention.
- **CORE CONTENT** (800-1200 kata): Breakdown konsep secara mendalam & step-by-step.
- **PRACTICAL APPLICATION**: Actionable steps atau mini-project.
- **KEY TAKEAWAYS**: Bullet points ringkasan materi.
- **BRIDGE**: Teaser untuk submateri selanjutnya.

Gunakan format Markdown lengkap dengan subheadings, bold untuk penekanan, dan code blocks yang terdokumentasi dengan baik.`;

  const userPrompt = `
Judul Submateri: ${subMaterialTitle}
Bagian dari Bab: ${chapterTitle}
Urutan: Submateri ke-${subMaterialIndex + 1}
Topik Utama: ${topics.join(", ")}

Mulailah langsung dengan konten Markdown sesuai struktur yang diminta.`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], GROQ_MODELS.POWERFUL, 0.7);

  return response;
}

// Master function to generate full course
export async function generateFullCourse(
  topics: string[],
  answers: Array<{ question: string; answer: string }>,
  onProgress: (phase: string, current: number, total: number) => void,
  onChapterComplete?: (chapter: Chapter) => void
): Promise<{ title: string; description: string; chapters: Chapter[] }> {
  // Step 1: Generate chapter plan
  onProgress("Menyusun struktur bab...", 0, 10); // Updated range for 8-12 chapters
  const chapterPlan = await generateChapterPlan(topics, answers);
  
  const chapters: Chapter[] = [];
  
  // Step 2-N: Generate sub-materials for each chapter
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
    for (let j = 0; j < subMaterialTitles.length; j++) {
      const subTitle = subMaterialTitles[j];
      
      // Add a delay to prevent rate limiting (TPM)
      await new Promise(resolve => setTimeout(resolve, 10000));

      const content = await generateSubMaterialContent(
        subTitle.title,
        chapter.title,
        topics,
        j // Pass index
      );
      subMaterials.push({
        id: subTitle.id,
        title: subTitle.title,
        content
      });
    }
    
    const finalizedChapter: Chapter = {
      id: `chapter-${chapter.number}`,
      number: chapter.number,
      title: chapter.title,
      subMaterials
    };

    chapters.push(finalizedChapter);
    
    if (onChapterComplete) {
      onChapterComplete(finalizedChapter);
    }
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
