# 🧠 AI CV Generator — Agent Build Specification

> \\\*\\\*Untuk AI Agent\\\*\\\*: Baca seluruh dokumen ini sebelum menulis satu baris kode pun.
> Implementasi harus mengikuti urutan fase, spesifikasi stack, dan batasan server.

\---

## 🖥️ Constraint Server (WAJIB DIPATUHI)

```
RAM   : 2 GB
CPU   : 1 Core
Disk  : 45 GB
OS    : Ubuntu Server
```

### Aturan Keras Akibat Constraint Ini

|❌ DILARANG|✅ GUNAKAN SEBAGAI GANTINYA|
|-|-|
|Puppeteer / Playwright (RAM \~300MB/instance)|`pdfkit` (Node.js, ringan)|
|PostgreSQL / MySQL (daemon berat)|**SQLite** via `better-sqlite3`|
|Redis|In-memory + SQLite|
|Next.js SSR|**Vite + React** (SPA, static build)|
|PM2 cluster mode|PM2 single instance|
|Docker (overhead tinggi)|Langsung di host + systemd/PM2|
|`npm install` sembarangan|Audit dependency, minimalkan|

### Target Resource Usage

* **RAM idle**: < 200 MB
* **RAM under load**: < 600 MB
* **Node.js process**: 1 instance saja
* **Nginx**: Serve static frontend, reverse proxy ke backend

\---

## 🏗️ Arsitektur Sistem

```
\\\[Browser / User]
      │
      ▼
\\\[Nginx :80/:443]
 ├── /           → Serve static Vite build (folder dist/)
 └── /api/\\\*      → Reverse proxy → Node.js :3001
                          │
                    \\\[Express Server]
                          │
              ┌───────────┼───────────┐
              │           │           │
         \\\[SQLite DB]  \\\[Google    \\\[pdfkit]
        (sessions,    Gemini API ]  (PDF gen)
         cv\\\_data)
```

\---

## 📁 Struktur Folder Project

```
cv-generator/
├── backend/
│   ├── src/
│   │   ├── index.js              # Entry point Express
│   │   ├── routes/
│   │   │   ├── chat.js           # POST /api/chat
│   │   │   ├── cv.js             # POST /api/cv/generate, GET /api/cv/:id
│   │   │   ├── export.js         # GET /api/export/pdf/:id
│   │   │   ├── roast.js          # POST /api/roast
│   │   │   └── jobmatch.js       # POST /api/jobmatch
│   │   ├── services/
│   │   │   ├── claude.js         # Wrapper Anthropic SDK
│   │   │   ├── cvBuilder.js      # Logika build JSON CV
│   │   │   ├── pdfGenerator.js   # pdfkit → PDF buffer
│   │   │   └── completeness.js   # Cek kelengkapan CV schema
│   │   ├── db/
│   │   │   ├── database.js       # Init SQLite, better-sqlite3
│   │   │   └── migrations.js     # Schema tabel
│   │   └── utils/
│   │       ├── prompts.js        # Semua system prompt Claude
│   │       └── sanitize.js       # Sanitasi input user
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── ChatCV.jsx        # Fitur 1: Chat-to-CV
│   │   │   ├── RoastCV.jsx       # Fitur 2: Roast My CV
│   │   │   ├── JobMatch.jsx      # Fitur 3: Job Match
│   │   │   └── Preview.jsx       # Preview \\\& export CV
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── CVPreview.jsx     # Render JSON → HTML preview
│   │   │   ├── ProgressBar.jsx   # Completeness score
│   │   │   ├── VariantSelector.jsx
│   │   │   └── UploadZone.jsx
│   │   ├── store/
│   │   │   └── cvStore.js        # Zustand store (ringan, bukan Redux)
│   │   └── styles/
│   │       └── globals.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── nginx/
│   └── cv-generator.conf
│
└── README.md
```

\---

## ⚙️ Tech Stack

### Backend

```json
{
  "runtime": "Node.js v20 LTS",
  "framework": "Express.js v4",
  "ai": "Google Gemini API, Model Gemini 2.5 Flash" API Key akan ditaruh di file .env,
  "database": "better-sqlite3",
  "pdf": "pdfkit",
  "upload": "multer (disk storage, bukan memory)",
  "validation": "zod",
  "security": "helmet, cors, express-rate-limit"
}
```

### Frontend

```json
{
  "bundler": "Vite v5",
  "framework": "React v18",
  "state": "zustand (bukan Redux, lebih ringan)",
  "routing": "react-router-dom v6",
  "styling": "Tailwind CSS v3",
  "icons": "lucide-react",
  "http": "axios"
}
```

\---

## 🗄️ Database Schema (SQLite)

```sql
-- Tabel sessions percakapan
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,          -- UUID
  created\\\_at  INTEGER NOT NULL,          -- Unix timestamp
  updated\\\_at  INTEGER NOT NULL,
  messages    TEXT NOT NULL,             -- JSON array of {role, content}
  cv\\\_json     TEXT,                      -- JSON CV hasil ekstraksi
  completeness\\\_score INTEGER DEFAULT 0, -- 0-100
  is\\\_complete INTEGER DEFAULT 0         -- boolean
);

-- Tabel CV tersimpan
CREATE TABLE IF NOT EXISTS cvs (
  id          TEXT PRIMARY KEY,
  session\\\_id  TEXT,
  variant     TEXT DEFAULT 'general',    -- internship|corporate|startup|scholarship|general
  cv\\\_data     TEXT NOT NULL,             -- JSON lengkap CV
  created\\\_at  INTEGER NOT NULL,
  FOREIGN KEY (session\\\_id) REFERENCES sessions(id)
);

-- Index agar query cepat
CREATE INDEX IF NOT EXISTS idx\\\_sessions\\\_updated ON sessions(updated\\\_at);
CREATE INDEX IF NOT EXISTS idx\\\_cvs\\\_session ON cvs(session\\\_id);
```

\---

## 🤖 Sistem Prompt Claude (Lengkap)

### 1\. System Prompt: CV Interviewer (Chat-to-CV)

```
SYSTEM PROMPT — CV\\\_INTERVIEWER:

Kamu adalah recruiter profesional senior bernama "Kai" yang sedang melakukan sesi
wawancara ringan untuk membantu user membuat CV terbaik mereka.

TUGASMU:
1. Tanyakan informasi CV secara natural, satu pertanyaan per pesan
2. Jangan pernah tampil seperti form atau daftar pertanyaan
3. Setelah setiap jawaban user, ekstrak informasi ke dalam JSON internal
4. Jika jawaban kurang spesifik, gali lebih dalam dengan pertanyaan follow-up
5. Jika informasi sudah cukup untuk field tertentu, lanjut ke topik berikutnya

URUTAN TOPIK (fleksibel, sesuai alur percakapan):
- Identitas: nama lengkap, email, nomor HP, kota domisili, LinkedIn/portfolio
- Pendidikan: universitas, jurusan, tahun lulus, IPK (opsional), prestasi akademik
- Pengalaman Kerja: perusahaan, posisi, periode, tanggung jawab, pencapaian terukur
- Project: nama project, deskripsi singkat, teknologi/tools, dampak/hasil
- Skills: hard skills (teknis), soft skills (interpersonal), level kemampuan
- Sertifikasi \\\& Penghargaan: nama, penerbit/institusi, tahun
- Informasi Tambahan: bahasa yang dikuasai, kegiatan organisasi, minat relevan

ATURAN PENTING:
- Selalu respons dalam Bahasa Indonesia kecuali user menulis dalam bahasa lain
- Jika user menyebut pencapaian, SELALU tanya angka/metrik: "Berapa % peningkatannya?"
- Jangan tanya lebih dari 1 pertanyaan dalam satu pesan
- Tone: hangat, profesional, seperti mentor yang supportif
- Jika user ingin skip topik tertentu, hormati dan lanjutkan

PADA AKHIR PERCAKAPAN:
Ketika completeness\\\_score >= 70, katakan:
"Saya rasa informasi yang kamu berikan sudah cukup bagus untuk membuat CV yang solid!
Mau saya generate sekarang? Kamu juga bisa memilih variannya: General, Internship,
Corporate, Startup, atau Scholarship."

FORMAT OUTPUT JSON (ekstrak setiap giliran, kembalikan di field cv\\\_json):
{
  "personal": {
    "name": "", "email": "", "phone": "", "city": "",
    "linkedin": "", "portfolio": "", "summary": ""
  },
  "education": \\\[
    { "institution": "", "degree": "", "field": "", "year\\\_start": "",
      "year\\\_end": "", "gpa": "", "achievements": \\\[] }
  ],
  "experience": \\\[
    { "company": "", "position": "", "start": "", "end": "", "current": false,
      "responsibilities": \\\[], "achievements": \\\[] }
  ],
  "projects": \\\[
    { "name": "", "description": "", "tech\\\_stack": \\\[], "impact": "", "url": "" }
  ],
  "skills": {
    "technical": \\\[], "soft": \\\[], "languages": \\\[]
  },
  "certifications": \\\[
    { "name": "", "issuer": "", "year": "" }
  ],
  "awards": \\\[
    { "name": "", "issuer": "", "year": "" }
  ],
  "organizations": \\\[
    { "name": "", "role": "", "period": "" }
  ]
}
```

\---

### 2\. System Prompt: CV Roaster

```
SYSTEM PROMPT — CV\\\_ROASTER:

Kamu adalah career coach yang sangat jujur dan tidak segan mengkritik CV dengan
pedas tapi konstruktif. Gaya kamu seperti Simon Cowell tapi supportif di akhir.

INPUT: Teks CV yang sudah di-parse dari PDF/DOCX user.

OUTPUT FORMAT (WAJIB dalam JSON):
{
  "overall\\\_score": 65,
  "grade": "C+",
  "verdict": "Kalimat satu baris verdict keseluruhan",
  "roast\\\_points": \\\[
    {
      "section": "Nama bagian CV",
      "severity": "critical|warning|suggestion",
      "issue": "Apa masalahnya (pedas, spesifik)",
      "fix": "Saran perbaikan konkret"
    }
  ],
  "strengths": \\\["Hal baik 1", "Hal baik 2"],
  "priority\\\_fixes": \\\["Fix paling penting 1", "Fix paling penting 2", "Fix paling penting 3"],
  "improved\\\_summary": "Rewrite summary/objective yang lebih baik"
}

KRITERIA PENILAIAN:
- Impact \\\& Metrics (25%): Apakah pencapaian terukur? Ada angka?
- Clarity \\\& Conciseness (20%): Apakah jelas, padat, tidak bertele-tele?
- Relevance (20%): Apakah konten relevan dengan target karir?
- ATS Friendliness (15%): Keyword density, format struktur
- Professional Tone (10%): Bahasa profesional, tidak ada typo
- Completeness (10%): Apakah semua section penting ada?

TONE: Jujur, spesifik, berani. Jangan soft-pedal masalah nyata.
Contoh roast yang bagus: "Section skills kamu seperti kartu nama semua orang —
ada sedikit dari segalanya, tapi tidak ada yang benar-benar spesifik."
```

\---

### 3\. System Prompt: Job Match Analyzer

```
SYSTEM PROMPT — JOB\\\_MATCH:

Kamu adalah ATS (Applicant Tracking System) analyzer profesional.

INPUT:
- cv\\\_text: Teks lengkap CV user
- jd\\\_text: Teks job description yang di-upload/paste user

OUTPUT FORMAT (WAJIB JSON):
{
  "match\\\_score": 72,
  "verdict": "Kalimat singkat penilaian kecocokan",
  "matched\\\_keywords": \\\["keyword1", "keyword2"],
  "missing\\\_keywords": \\\["keyword3", "keyword4"],
  "keyword\\\_analysis": {
    "technical\\\_skills\\\_match": 65,
    "soft\\\_skills\\\_match": 80,
    "experience\\\_match": 70,
    "education\\\_match": 90
  },
  "gap\\\_analysis": \\\[
    {
      "gap": "Nama gap/kekurangan",
      "importance": "high|medium|low",
      "suggestion": "Cara menutup gap ini"
    }
  ],
  "cv\\\_improvements": \\\[
    "Tambahkan kata '\\\[keyword]' di bagian experience",
    "Quantify pencapaian di posisi \\\[X]"
  ],
  "cover\\\_letter\\\_tips": \\\["Tips 1", "Tips 2"]
}

CATATAN: Jangan pernah menyebut "ATS Score" — gunakan "Match Score" atau
"Relevance Score" untuk akurasi representasi.
```

\---

### 4\. System Prompt: CV Variant Generator

```
SYSTEM PROMPT — VARIANT\\\_GENERATOR:

Kamu akan men-generate ulang CV JSON yang ada menjadi versi yang dioptimalkan
untuk target spesifik.

INPUT: cv\\\_json (JSON CV lengkap), variant (salah satu dari list di bawah)

VARIANT DEFINITIONS:

\\\[internship]
- Tonjolkan: pendidikan, project kuliah, organisasi, soft skills
- Tone: antusias, eager to learn, growth mindset
- Summary: fokus pada potensi dan keinginan belajar
- De-emphasize: pengalaman kerja yang tidak relevan

\\\[corporate]
- Tonjolkan: pengalaman kerja terstruktur, achievement terukur, leadership
- Tone: formal, profesional, achievement-oriented
- Summary: fokus pada value proposition dan track record
- Format: konservatif, traditional section order

\\\[startup]
- Tonjolkan: side projects, adaptability, ownership, impact cepat
- Tone: dinamis, impact-first, menunjukkan inisiatif
- Summary: highlight bias for action dan versatility
- Tambahkan: GitHub, portfolio, project URLs

\\\[scholarship]
- Tonjolkan: prestasi akademik, riset, organisasi, kepemimpinan, kontribusi sosial
- Tone: formal akademis, purpose-driven
- Summary: visi dan alasan membutuhkan beasiswa
- Tambahkan: IPK, ranking, publikasi jika ada

OUTPUT: CV JSON yang sama strukturnya tapi konten disesuaikan dengan variant.
Tambahkan field "variant\\\_notes" berisi tips spesifik untuk variant ini.
```

\---

## 📐 CV JSON Schema (Completeness Checker)

```javascript
// backend/src/services/completeness.js

const REQUIRED\\\_FIELDS = {
  'personal.name':    { weight: 15, label: 'Nama lengkap' },
  'personal.email':   { weight: 10, label: 'Email' },
  'personal.phone':   { weight: 8,  label: 'Nomor telepon' },
  'personal.city':    { weight: 5,  label: 'Kota domisili' },
  'education':        { weight: 20, label: 'Pendidikan (minimal 1)' },
  'experience':       { weight: 20, label: 'Pengalaman kerja' },
  'skills.technical': { weight: 10, label: 'Hard skills' },
  'personal.summary': { weight: 7,  label: 'Ringkasan profil' },
};

const OPTIONAL\\\_FIELDS = {
  'personal.linkedin':    { weight: 3, label: 'LinkedIn' },
  'personal.portfolio':   { weight: 3, label: 'Portfolio/GitHub' },
  'projects':             { weight: 5, label: 'Project (min 1)' },
  'certifications':       { weight: 3, label: 'Sertifikasi' },
  'skills.soft':          { weight: 2, label: 'Soft skills' },
  'organizations':        { weight: 2, label: 'Organisasi' },
};

// Fungsi hitung score 0-100
function calculateCompleteness(cvJson) { ... }
```

\---

## 🔌 API Endpoints

### Chat-to-CV

```
POST /api/chat
Content-Type: application/json

Request:
{
  "session\\\_id": "uuid-atau-null-jika-baru",
  "message": "Pesan user"
}

Response:
{
  "session\\\_id": "uuid",
  "reply": "Respons AI sebagai Kai",
  "cv\\\_json": { ... },             // CV JSON terbaru hasil ekstraksi
  "completeness\\\_score": 72,
  "is\\\_ready\\\_to\\\_generate": false,
  "missing\\\_fields": \\\["experience", "skills.technical"]
}
```

### Generate CV

```
POST /api/cv/generate
Content-Type: application/json

Request:
{
  "session\\\_id": "uuid",
  "variant": "general|internship|corporate|startup|scholarship"
}

Response:
{
  "cv\\\_id": "uuid",
  "cv\\\_data": { ... },   // Final CV JSON
  "variant": "general"
}
```

### Export PDF

```
GET /api/export/pdf/:cv\\\_id?template=modern

Response: application/pdf (binary)
```

### Roast CV

```
POST /api/roast
Content-Type: multipart/form-data

Body: file (PDF/DOCX, max 5MB)

Response:
{
  "roast\\\_result": { ... }   // JSON sesuai schema roaster
}
```

### Job Match

```
POST /api/jobmatch
Content-Type: application/json

Request:
{
  "cv\\\_id": "uuid",          // CV yang sudah dibuat
  "jd\\\_text": "Teks JD..."   // Paste atau upload JD
}

Response:
{
  "match\\\_result": { ... }   // JSON sesuai schema job match
}
```

\---

## 🎨 UI/UX Specification

### Design System

```css
/\\\* Palette — Dark Professional dengan accent Electric \\\*/
--color-bg:        #0A0A0F;
--color-surface:   #13131A;
--color-border:    #1E1E2E;
--color-accent:    #6C63FF;    /\\\* Electric purple \\\*/
--color-accent-2:  #00D4AA;    /\\\* Teal untuk success \\\*/
--color-warning:   #FF6B35;    /\\\* Orange untuk roast \\\*/
--color-text:      #E8E8F0;
--color-muted:     #6B6B80;

/\\\* Typography \\\*/
--font-display: 'Syne', sans-serif;       /\\\* Bold headers \\\*/
--font-body:    'DM Sans', sans-serif;    /\\\* Body text \\\*/
--font-mono:    'JetBrains Mono', monospace; /\\\* Code/JSON \\\*/
```

### Halaman \& Komponen Wajib

**1. Home (Landing Page)**

* Hero section dengan animated tagline
* 4 feature cards (Chat-to-CV, Roast, Job Match, Variants)
* CTA: "Mulai Gratis" → /chat

**2. Chat-to-CV Page (`/chat`)**

* Layout: split screen — kiri chat, kanan preview CV
* Chat bubble: user (kanan, accent color), AI/Kai (kiri, surface color)
* Progress bar kelengkapan CV (0-100%) di atas preview
* Tombol "Generate CV" muncul saat score ≥ 70
* Variant selector modal sebelum generate

**3. CV Preview (`/preview/:cv\\\_id`)**

* Tampilan CV rendered dari JSON (HTML, bukan iframe PDF)
* Sidebar: tombol Download PDF, pilih variant, Share link
* Tombol "Roast This CV" dan "Job Match"
* Edit mode: klik field untuk edit langsung (opsional, V2)

**4. Roast My CV (`/roast`)**

* Upload zone drag-and-drop PDF/DOCX
* Atau paste teks CV langsung
* Loading state dengan animasi flame 🔥
* Hasil: score card, list roast points dengan severity badge,
section strengths, priority fixes

**5. Job Match (`/jobmatch`)**

* Input kiri: dropdown pilih CV tersimpan atau upload
* Input kanan: textarea paste job description
* Hasil: gauge chart match score, dua kolom matched/missing keywords,
gap analysis cards

\---

## ⚡ Optimasi Performa (Wajib untuk VM Low-Spec)

### Backend

```javascript
// Rate limiting — jangan biarkan 1 user flood API
const limiter = rateLimit({
  windowMs: 60 \\\* 1000,   // 1 menit
  max: 20,               // max 20 request/menit per IP
  message: 'Terlalu banyak request, coba lagi dalam 1 menit'
});

// Timeout Claude API
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 detik

// Cleanup session lama (jalankan setiap hari via setInterval)
// Hapus sessions yang tidak diupdate > 7 hari
db.prepare(`DELETE FROM sessions WHERE updated\\\_at < ?`)
  .run(Date.now() - 7 \\\* 24 \\\* 60 \\\* 60 \\\* 1000);

// Multer: simpan upload ke disk, BUKAN memory
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 \\\* 1024 \\\* 1024 } });
```

### Frontend

```javascript
// vite.config.js — build optimization
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: \\\['react', 'react-dom', 'react-router-dom'],
          ui: \\\['lucide-react'],
          state: \\\['zustand'],
        }
      }
    },
    minify: 'terser',
    chunkSizeWarningLimit: 500,
  }
}
```

### Nginx Config

```nginx
# nginx/cv-generator.conf

server {
    listen 80;
    server\\\_name yourdomain.com;

    # Gzip compression — hemat bandwidth
    gzip on;
    gzip\\\_types text/plain text/css application/json application/javascript;
    gzip\\\_min\\\_length 1000;

    # Cache static assets
    location /assets/ {
        alias /var/www/cv-generator/dist/assets/;
        expires 30d;
        add\\\_header Cache-Control "public, immutable";
    }

    # Serve React SPA
    location / {
        root /var/www/cv-generator/dist;
        try\\\_files $uri $uri/ /index.html;
    }

    # Proxy ke Express backend
    location /api/ {
        proxy\\\_pass http://127.0.0.1:3001;
        proxy\\\_http\\\_version 1.1;
        proxy\\\_set\\\_header Host $host;
        proxy\\\_set\\\_header X-Real-IP $remote\\\_addr;
        proxy\\\_read\\\_timeout 60s;        # Penting: Claude API bisa lambat
        proxy\\\_send\\\_timeout 60s;
        client\\\_max\\\_body\\\_size 5M;       # Limit upload
    }
}
```

\---

## 🔐 Environment Variables

```bash
# backend/.env.example

# Wajib
ANTHROPIC\\\_API\\\_KEY=sk-ant-xxxxx
NODE\\\_ENV=production
PORT=3001
SESSION\\\_SECRET=random-string-min-32-chars

# Database
DB\\\_PATH=./data/cv\\\_generator.db

# Upload
UPLOAD\\\_DIR=./uploads
MAX\\\_FILE\\\_SIZE\\\_MB=5

# Rate Limiting
RATE\\\_LIMIT\\\_WINDOW\\\_MS=60000
RATE\\\_LIMIT\\\_MAX=20

# Cleanup
SESSION\\\_TTL\\\_DAYS=7
CLEANUP\\\_INTERVAL\\\_HOURS=24
```

\---

## 📦 Package.json (Backend)

```json
{
  "name": "cv-generator-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "helmet": "^7.1.0",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.15.0",
    "pdf-parse": "^1.1.1",
    "uuid": "^10.0.0",
    "zod": "^3.23.8"
  }
}
```

\---

## 📦 Package.json (Frontend)

```json
{
  "name": "cv-generator-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "lucide-react": "^0.390.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}
```

\---

## 🚀 Deployment Steps

```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup\\\_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Nginx \\\& PM2
sudo apt install nginx -y
npm install -g pm2

# 3. Clone \\\& Setup
git clone <repo> /var/www/cv-generator
cd /var/www/cv-generator

# 4. Backend
cd backend \\\&\\\& npm install --production
mkdir -p data uploads
cp .env.example .env \\\&\\\& nano .env  # Isi ANTHROPIC\\\_API\\\_KEY

# 5. Frontend build
cd ../frontend \\\&\\\& npm install \\\&\\\& npm run build
cp -r dist /var/www/cv-generator/dist

# 6. PM2 — start backend
cd /var/www/cv-generator/backend
pm2 start src/index.js --name cv-generator --max-memory-restart 400M
pm2 save \\\&\\\& pm2 startup

# 7. Nginx
sudo cp nginx/cv-generator.conf /etc/nginx/sites-available/cv-generator
sudo ln -s /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/
sudo nginx -t \\\&\\\& sudo systemctl reload nginx
```

\---

## 📋 Build Checklist untuk Agent

### Phase 1 — Backend Core

* \[ ] Setup Express + Helmet + CORS + Rate Limiter
* \[ ] Init SQLite dengan schema lengkap
* \[ ] Buat `claude.js` wrapper dengan timeout \& error handling
* \[ ] Implement `/api/chat` endpoint dengan session management
* \[ ] Implement `completeness.js` service
* \[ ] Implement `cvBuilder.js` — ekstrak JSON dari percakapan

### Phase 2 — PDF \& Export

* \[ ] Implement `pdfGenerator.js` dengan pdfkit

  * Buat minimal 2 template PDF: Classic dan Modern
* \[ ] Implement `/api/cv/generate` dan `/api/export/pdf/:id`
* \[ ] Test PDF output dengan data lengkap

### Phase 3 — Roast \& Job Match

* \[ ] Setup multer untuk upload PDF/DOCX
* \[ ] Integrate `pdf-parse` untuk extract teks dari PDF upload
* \[ ] Implement `/api/roast` endpoint
* \[ ] Implement `/api/jobmatch` endpoint

### Phase 4 — Frontend

* \[ ] Setup Vite + React + Tailwind + Router
* \[ ] Buat Zustand store untuk CV state + session
* \[ ] Implement semua 5 halaman
* \[ ] Implement `CVPreview` component (JSON → HTML visual)
* \[ ] Responsive design (mobile-friendly)
* \[ ] LocalStorage: simpan session\_id agar tidak hilang saat refresh

### Phase 5 — Integrasi \& Polish

* \[ ] Connect semua frontend ke backend API
* \[ ] Error handling \& loading states di semua halaman
* \[ ] Uji coba alur lengkap: chat → generate → download PDF
* \[ ] Nginx config \& PM2 deployment
* \[ ] Test di VM dengan load simulasi

\---

## ⚠️ Catatan Penting untuk Agent

1. **Jangan gunakan streaming SSE** untuk chat kecuali benar-benar diperlukan
— tambah kompleksitas untuk gain yang kecil di VM ini.
2. **Claude API call** harus selalu dalam `try-catch` dengan fallback message.
3. **Upload file** WAJIB disimpan ke disk (bukan memory buffer) karena RAM terbatas.
4. **SQLite WAL mode** — aktifkan untuk performa lebih baik:

```javascript
   db.pragma('journal\\\_mode = WAL');
   db.pragma('cache\\\_size = -4000'); // 4MB cache max
   ```

5. **Jangan lupa cleanup** file upload setelah diproses:

```javascript
   fs.unlink(req.file.path, () => {});
   ```

6. **Semua prompt Claude** harus ada di satu file `prompts.js` — mudah diupdate.
7. **Tidak ada autentikasi** di V1 — gunakan session ID sebagai identifier.
Jika butuh auth di masa depan, tambah JWT di V2.

\---

*Dokumen ini adalah sumber kebenaran tunggal untuk build project CV Generator.
Setiap keputusan arsitektur yang tidak tercantum di sini, defaultnya adalah:
pilih opsi yang paling hemat RAM dan paling mudah dimaintain.*

