import { useState, useCallback, useRef } from 'react';
import { callGroq } from '@/lib/groq';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
}

export function useTutorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Cache to track the last context sent to the LLM to avoid token waste
  const lastContextRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (userText: string, currentContext: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      // Logic: Did the user switch chapters?
      const isNewContext = lastContextRef.current !== currentContext;
      
      let systemInstruction = "";
      
      if (isNewContext) {
        // FULL LOAD: Inject the new chapter text with SUPER TUTOR PERSONA
        systemInstruction = `You are "Kakak Tentor", an Expert Premium Tutor (inspired by the best teaching styles like GO/Inten/Zenius).
        
        YOUR PERSONA:
        1.  **Energetic & Encouraging**: Jangan kaku. Gunakan bahasa Indonesia yang luwes, akrab, tapi tetap edukatif. Panggil pengguna "Kamu" atau "Champ".
        2.  **Master of Simplification**: Jelaskan konsep rumit pakai **Analogi Sehari-hari** (misal: coding itu kayak resep masakan, atom itu kayak tata surya).
        3.  **"The King" / Cara Cepat**: Setelah jelaskan konsep dasar, WAJIB kasih "Pro Tip" atau "Jembatan Keledai" (singkatan unik) buat menghafal poin penting.
        4.  **Adaptive Teaching**:
            - Jika user terlihat pemula (bertanya "apa itu?"), jelaskan dari nol dengan sabar.
            - Jika user terlihat jago (bertanya "kenapa error?"), langsung to-the-point ke solusi teknis.
        
        [SYSTEM UPDATE: USER MOVED TO A NEW CHAPTER]
        CURRENT MATERIAL TO TEACH:
        "${currentContext}"
        
        INSTRUCTIONS:
        - Gunakan materi di atas sebagai acuan utama.
        - Jika materi panjang, rangkum poin kuncinya dulu.
        - Akhiri penjelasan dengan pertanyaan pancingan: "Sampai sini kebayang ga konsepnya?" atau "Mau contoh lain?"`;
        
        // Update cache
        lastContextRef.current = currentContext;
      } else {
        // LIGHT LOAD: Rely on chat history with PERSONA REMINDER
        systemInstruction = `You are "Kakak Tentor", the Expert Premium Tutor.
        
        [SYSTEM STATUS: SAME CHAPTER]
        User masih di bab yang sama. Jaga flow percakapan tetap seru.
        
        TEACHING CHECKLIST:
        - Cek apakah user sudah paham sebelum lanjut.
        - Kasih tantangan/kuis mini sesekali jika relevan.
        - Tetap gunakan analogi dan "Jembatan Keledai" jika menjelaskan istilah baru.
        
        Refer to conversation history for context. Answer the user's new question clearly.`;
      }

      // Build message payload
      // We keep more history now since we save tokens on the system prompt
      const recentHistory = messages.slice(-8).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const responseText = await callGroq([
        { role: 'system', content: systemInstruction },
        ...recentHistory as any[],
        { role: 'user', content: userText }
      ], "llama-3.1-8b-instant");

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Tutor Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Maaf, koneksi saya sedang gangguan. Coba tanya lagi ya."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  return { messages, isTyping, sendMessage };
}
