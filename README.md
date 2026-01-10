# 🎓 Kurikura: AI-Powered Personalized Learning Architect

**Kurikura** adalah platform pembelajaran cerdas yang merancang jalur belajar (learning path) yang sepenuhnya personal untuk setiap pengguna. Menggunakan arsitektur Multi-Agent AI, Kurikura tidak hanya memberikan daftar materi, tetapi menyusun kurikulum mendalam yang divalidasi dan berbasis riset terbaru.

---

## ✨ Fitur Utama

### 🧠 1. Personalization Engine
Kurikura memahami bahwa setiap orang memiliki latar belakang berbeda. AI akan mewawancarai Anda secara singkat untuk memahami tujuan, tingkat keahlian, dan preferensi belajar Anda sebelum menyusun materi.

### 🏗️ 2. Syllabus Architect
Menghasilkan silabus terstruktur (biasanya 6-8 minggu) yang progresif—mulai dari fundamental hingga proyek akhir—disesuaikan dengan profil unik Anda.

### 🕵️ 3. Intelligent Research Agents
Konten yang dihasilkan bukan sekadar halusinasi AI. Kurikura memiliki agen riset yang mampu:
- 🗺️ **Roadmap Scraper**: Mengambil referensi dari *roadmap.sh* untuk standar industri.
- 🔍 **Web Search**: Mencari kurikulum dan panduan terbaru dari Google.
- 📚 **Academic & Knowledge Search**: Mengintegrasikan data dari *Wikipedia* dan *ArXiv* untuk kedalaman materi.

### ✍️ 4. Educator Master & QA System
- **Educator Agent**: Menulis konten edukasi yang engaging, menggunakan prinsip neurosains untuk memudahkan pemahaman.
- **QA Agent**: Setiap materi yang dihasilkan melewati proses validasi otomatis untuk memastikan akurasi teknis, koherensi, dan kualitas format markdown.

### 📖 5. Immersive Learning Experience
- **Immersive Reader**: Antarmuka baca yang bersih dengan fokus pada konten.
- **Progress Locking**: Sistem manajemen belajar yang memastikan Anda benar-benar memahami satu bagian sebelum pindah ke bagian lain.
- **AI Tutor Integration**: Butuh penjelasan lebih lanjut? Anda bisa menyorot teks dan bertanya langsung pada AI Tutor di dalam aplikasi.

---

## 🛠️ Tech Stack

### Frontend
- **React (TypeScript)** & **Vite**: Untuk performa dan pengalaman developer yang optimal.
- **Tailwind CSS** & **Shadcn UI**: Antarmuka modern, responsif, dan elegan.
- **Framer Motion**: Animasi transisi yang halus dan interaktif.
- **Firebase Auth & Firestore**: Autentikasi pengguna dan penyimpanan data kurikulum secara real-time.

### Backend & AI Proxy
- **Node.js (Express)** & **Vercel Functions**: Sebagai jembatan (proxy) yang aman ke penyedia AI.
- **Load Balanced AI Providers**: Menggunakan strategi fallback antar provider untuk keandalan maksimal:
  - **Groq (Llama 3.1 & 3.3)**: Untuk generasi cepat.
  - **Google Gemini 2.0 Flash**: Untuk pemrosesan konteks tinggi.
  - **OpenRouter & Hugging Face**: Sebagai penyedia cadangan.

---

## 🚀 Cara Menjalankan Project

### Prasyarat
- Node.js (versi 18 atau terbaru)
- Akun Firebase (untuk database dan auth)
- API Keys untuk Groq/Gemini (jika ingin menjalankan proxy sendiri)

### Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/Syacretary/course-module.git
   cd course-module
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables:
   Buat file `.env` di root folder dan isi dengan konfigurasi Firebase serta API Keys Anda (lihat `src/lib/firebase.ts` untuk referensi key).

4. Jalankan server pengembangan:
   ```bash
   # Terminal 1: Menjalankan Proxy Server (Opsional untuk lokal)
   npm run server

   # Terminal 2: Menjalankan Frontend
   npm run dev
   ```

---

## 📄 Lisensi
Project ini dibuat untuk tujuan edukasi dan pengembangan personal.

---
*Dibuat dengan ❤️ oleh [Syacretary](https://github.com/Syacretary)*