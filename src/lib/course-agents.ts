import { callGroq, parseJSON, GROQ_MODELS } from "@/lib/groq";
import { PersonalizationQuestion, Chapter, SubMaterial } from "@/types/course";
import { getRoadmapContent } from "@/lib/roadmap-scraper";

// Agent 2: Personalization Questioner - generates 3 deep context-aware questions
export async function generatePersonalizationQuestions(
  topics: string[]
): Promise<PersonalizationQuestion[]> {
  const topicsStr = topics.join(", ");
  const prompt = `Kamu adalah AI Mentor yang sangat cerdas dan empatik. 
Seorang pengguna ingin belajar tentang: ${topicsStr}

Tugasmu adalah merancang 3 pertanyaan wawancara singkat untuk memahami latar belakang dan tujuan mereka agar kurikulum yang dibuat sangat personal (custom-tailored).

Setiap pertanyaan harus memiliki:
1. Pertanyaan yang ramah dan suportif.
2. 3-4 opsi jawaban cepat (chips) yang paling relevan untuk topik tersebut.

CONTOH (Jika topik Desain UI/UX):
Q1: "Apa statusmu saat ini?" (Pelajar/Mahasiswa, Profesional ingin switch career, Entrepreneur)
Q2: "Seberapa familiar kamu dengan tools desain seperti Figma atau Adobe XD?" (Benar-benar baru, Tahu dasar-dasarnya, Sudah sering pakai)
Q3: "Tujuan utamamu apa?" (Buat nambah portofolio, Belajar buat kerjaan sekarang, Iseng eksplor hobi)

Format output JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Teks pertanyaan",
      "suggestedAnswers": ["Opsi 1", "Opsi 2", "Opsi 3"]
    }
  ]
}`;

  const response = await callGroq([
    { role: "system", content: "Kamu adalah AI Mentor Kurikura yang ahli dalam merancang pengalaman belajar personal. Kamu menggunakan bahasa Indonesia yang ramah, profesional, dan cerdas. Output harus JSON valid." },
    { role: "user", content: prompt }
  ], GROQ_MODELS.POWERFUL, 0.7);

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

import { Chapter, SubMaterial, Module } from "@/types/course";
import { performQualityCheck } from "./qa-agent";
import { synthesizeResearch } from "./research-agents";

// Agent 4: Generate modules for a chapter
export async function generateModules(
  chapterTitle: string,
  chapterNumber: number,
  topics: string[]
): Promise<Array<{ id: string; title: string }>> {
  const systemPrompt = `Anda adalah seorang curriculum architect. Tugas Anda adalah membagi sebuah bab menjadi 2-3 modul logis.
  
  FORMAT OUTPUT JSON:
  {
    "modules": [
      { "id": "ch${chapterNumber}-m1", "title": "Judul Modul" }
    ]
  }`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Bab: ${chapterTitle}\nTopik: ${topics.join(", ")}` }
  ], GROQ_MODELS.FAST, 0.6);

  const parsed = parseJSON<{ modules: Array<{ id: string; title: string }> }>(response);
  return parsed.modules || [];
}

// Agent 5: Generate sub-material titles for a module
export async function generateSubMaterialTitles(
  moduleTitle: string,
  moduleId: string,
  topics: string[]
): Promise<Array<{ id: string; title: string }>> {
  const systemPrompt = `Anda adalah seorang instructional designer. Bagi modul ini menjadi 2 submateri (unit belajar kecil).
  
  FORMAT OUTPUT JSON:
  {
    "subMaterials": [
      { "id": "${moduleId}-s1", "title": "Judul Submateri" }
    ]
  }`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Modul: ${moduleTitle}\nTopik: ${topics.join(", ")}` }
  ], GROQ_MODELS.FAST, 0.6);

  const parsed = parseJSON<{ subMaterials: Array<{ id: string; title: string }> }>(response);
  return parsed.subMaterials || [];
}

// Agent 6: Generate content for a sub-material using Educator Master principles
export async function generateSubMaterialContent(
  subMaterialTitle: string,
  moduleTitle: string,
  topics: string[],
  researchContext: string
): Promise<string> {
  const systemPrompt = `Anda adalah seorang educator master. Tulis konten edukasi yang mendalam, engaging, dan akurat.
  Gunakan Markdown. Gunakan konteks riset berikut jika tersedia:
  ${researchContext}

### STRUKTUR KONTEN WAJIB:
- **HOOK**: Grab attention.
- **CORE CONTENT**: Breakdown konsep secara mendalam.
- **PRACTICAL APPLICATION**: Actionable steps.
- **KEY TAKEAWAYS**: Bullet points ringkasan materi.
- **BRIDGE**: Teaser selanjutnya.`;

  const response = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Submateri: ${subMaterialTitle}\nModul: ${moduleTitle}\nTopik: ${topics.join(", ")}` }
  ], GROQ_MODELS.POWERFUL, 0.7);

  return response;
}

// Master function to generate full course
export async function generateFullCourse(
  topics: string[],
  answers: Array<{ question: string; answer: string }>,
  onProgress: (phase: string, current: number, total: number) => void,
  onChapterComplete?: (chapter: Chapter) => void,
  syllabusPlan?: Array<{ number: number; title: string; description: string; topics?: string[] }>
): Promise<{ title: string; description: string; chapters: Chapter[] }> {
  
  onProgress("Menyiapkan materi...", 0, 100);
  
  // Use existing syllabus plan if provided, otherwise generate a new one
  let chapterPlan: Array<{ number: number; title: string; description: string; topics?: string[] }>;
  
  if (syllabusPlan && syllabusPlan.length > 0) {
    chapterPlan = syllabusPlan;
  } else {
    onProgress("Menyusun struktur kurikulum...", 0, 100);
    chapterPlan = await generateChapterPlan(topics, answers);
  }
  
  if (!chapterPlan || chapterPlan.length === 0) {
    throw new Error("Gagal menyusun struktur kurikulum.");
  }
  
  // Research key topics once to provide context
  const researchContext = await synthesizeResearch(topics[0], true);
  
  const chapters: Chapter[] = [];
  const totalChapters = chapterPlan.length;
  
  for (let i = 0; i < totalChapters; i++) {
    const chapterPlanItem = chapterPlan[i];
    const progressPercent = Math.round((i / totalChapters) * 100);
    onProgress(`Bab ${i+1}: ${chapterPlanItem.title}`, progressPercent, 100);
    
    // Pass suggested topics from syllabus if available
    const suggestedTopics = chapterPlanItem.topics ? chapterPlanItem.topics.join(", ") : topics.join(", ");
    
    const moduleTitles = await generateModules(chapterPlanItem.title, chapterPlanItem.number, [suggestedTopics]);
    const modules: Module[] = [];
    
    // Process modules in parallel within the chapter with a small stagger
    const modulePromises = moduleTitles.map(async (modTitle, modIdx) => {
      // Stagger start of each module by 500ms
      await new Promise(r => setTimeout(r, modIdx * 500));
      
      const subTitles = await generateSubMaterialTitles(modTitle.title, modTitle.id, [suggestedTopics]);
      const subMaterials: SubMaterial[] = [];
      
      // We still process sub-materials sequentially within a module to avoid hitting rate limits too hard,
      // but modules run in parallel.
      for (const subT of subTitles) {
        onProgress(`Menulis: ${subT.title}`, progressPercent, 100);
        
        let content = await generateSubMaterialContent(subT.title, modTitle.title, [suggestedTopics], researchContext);
        const qaResult = await performQualityCheck(content, chapterPlanItem.title, subT.title, topics);
        
        if (qaResult.passed && qaResult.revisedContent) {
          content = qaResult.revisedContent;
        }

        subMaterials.push({ id: subT.id, title: subT.title, content });
        // Small buffer between sub-materials within the same module
        await new Promise(r => setTimeout(r, 800));
      }
      
      return { id: modTitle.id, title: modTitle.title, subMaterials };
    });

    const completedModules = await Promise.all(modulePromises);
    modules.push(...completedModules);
    
    const finalizedChapter: Chapter = {
      id: `chapter-${chapterPlanItem.number}`,
      number: chapterPlanItem.number,
      title: chapterPlanItem.title,
      modules
    };

    chapters.push(finalizedChapter);
    if (onChapterComplete) onChapterComplete(finalizedChapter);
  }
  
  return {
    title: `Panduan Lengkap ${topics.join(" & ")}`,
    description: `Course komprehensif tentang ${topics.join(", ")}.`,
    chapters
  };
}
