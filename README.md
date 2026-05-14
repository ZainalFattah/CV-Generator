# 🧠 AI CV Generator - Dokumentasi Lengkap Proyek

AI CV Generator adalah aplikasi *full-stack* berbasis web yang dirancang untuk merevolusi cara pengguna membuat, mengevaluasi, dan mengoptimalkan *Curriculum Vitae* (CV). Dengan memanfaatkan teknologi **Google Gemini 2.5 Flash**, aplikasi ini menyajikan pengalaman interaktif layaknya berbicara dengan seorang *Tech Recruiter* secara langsung.

Proyek ini dibangun dengan mempertimbangkan efisiensi memori yang ketat, dikhususkan untuk dapat berjalan dengan stabil di atas Virtual Private Server (VPS) Ubuntu dengan spesifikasi 1 CPU dan 2GB RAM.

---

## 🎯 Visi dan Misi Proyek

Banyak *job seeker* merasa kesulitan memformat CV mereka secara ATS-friendly (Applicant Tracking System) atau bingung dalam mendeskripsikan pengalaman mereka. Aplikasi ini hadir untuk:
1.  **Mengurangi friksi pembuatan CV** melalui antarmuka *chat* (Chat-to-CV).
2.  **Meningkatkan kualitas CV** melalui evaluasi instan berbasis AI (Roast My CV).
3.  **Memaksimalkan peluang lolos seleksi** dengan memastikan layout ekspor selalu ramah ATS.

---

## ✨ Fitur Utama Secara Detail

### 1. 💬 Chat-to-CV (AI Recruiter)
Pengguna tidak perlu lagi mengisi *form* panjang yang membosankan. AI akan bertindak sebagai *recruiter* (bernama Kai) yang secara natural mewawancarai pengguna bagian demi bagian (Informasi Personal, Pendidikan, Pengalaman, Proyek, dan *Skill*).
*   **Context-Aware:** AI mengingat seluruh percakapan yang terjadi di sesi (disimpan dalam database SQLite).
*   **Completeness Score:** Terdapat indikator *Extraction Progress* (0-100%).
*   **Auto-Trigger:** Ketika kelengkapan data mencapai batas siap (semua *section* wajib terisi), AI akan mengirim *flag* `is_ready_to_generate` dan antarmuka akan memunculkan tombol *Generate & Download*.

### 2. 🔥 Roast My CV (AI Career Coach)
Pengguna dapat mengunggah CV lama mereka dalam format PDF atau menempelkan teks.
*   **Kritik Konstruktif:** AI akan menganalisis dokumen dan memberikan "roast" (kritik tajam namun membangun) terkait formatting, *keyword*, atau gaya penulisan yang salah kaprah.
*   **Scoring & Actionable Advice:** Memberikan poin-poin yang bisa langsung diperbaiki oleh pengguna.

### 3. 📄 ATS-Friendly PDF Export
Menggunakan modul `pdfkit`, sistem langsung dapat mengubah *JSON object* hasil *chat* menjadi PDF.
*   **Single-Column Layout:** Dirancang khusus agar sangat *parseable* oleh mesin ATS. Menghindari format multi-kolom yang sering merusak struktur data.
*   **Premium Typography:** Menggunakan margin lebar (45px) dan *font* profesional sans-serif (`Helvetica`).
*   **Stream-based Download:** Proses PDF dirender secara *on-the-fly* ke aliran respons HTTP (Stream) tanpa menulis banyak *buffer* di memori RAM—sehingga VPS 2GB tidak akan mengalami *Out Of Memory* (OOM).

---

## 🏗️ Arsitektur & Teknologi

Proyek ini menggunakan pola arsitektur *Client-Server* standar (SPA - Single Page Application).

### Backend (Express.js)
*   **Node.js v20+** dengan **Express.js v4**.
*   **Google Gemini SDK (`@google/generative-ai`)**: Menangani LLM orchestration (Chat & Roast).
*   **Database**: SQLite (`better-sqlite3`). Memanfaatkan *Write-Ahead Logging (WAL)* untuk performa optimal di disk berkecepatan rendah.
*   **PDF Pipeline**: `pdfkit` untuk rendering grafis vektor ke dokumen PDF, dan `pdf-parse` untuk ekstraksi teks dari PDF yang diunggah pengguna.
*   **Keamanan & Stabilitas**: `helmet` (header security), `cors`, dan `express-rate-limit` (mencegah DDoS atau *API key abuse*).

### Frontend (React.js)
*   **React 18** + **Vite**: *Bundler* ultra-cepat.
*   **Tailwind CSS**: Untuk merancang tema "Retro Terminal" (Background gelap, Teks Hijau *Electric*, *Monospace font* untuk data).
*   **Zustand**: *State management* untuk menyimpan *Session ID* (agar *chat* tidak hilang saat di-refresh) dan skor kelengkapan.
*   **Lucide React**: Ikon minimalis vektor.

---

## 📂 Struktur Direktori

```text
cv-generator/
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── assets/           # Gambar & Ikon Statis
│   │   ├── pages/            # View Utama (Home.jsx, ChatCV.jsx, RoastCV.jsx)
│   │   ├── store/            # Zustand store (cvStore.js)
│   │   ├── styles/           # Konfigurasi Tailwind & Global CSS
│   │   ├── App.jsx           # React Router DOM config
│   │   └── main.jsx          # React Entry Point
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                  # Node.js Server
│   ├── src/
│   │   ├── db/               # SQLite Connection & Migrations
│   │   ├── parsers/          # Sanitasi output JSON dari AI Gemini
│   │   ├── prompts/          # System Prompts untuk Recruiter & Roaster
│   │   ├── routes/           # Endpoint Controller (chat.js, roast.js, export.js)
│   │   ├── services/         # Integrasi SDK Gemini & Logika Bisnis
│   │   ├── validators/       # Validasi Skema Objek
│   │   ├── env.js            # Dotenv config loader
│   │   └── index.js          # Express Entry Point (Rate limiter, middleware)
│   ├── uploads/              # Temporary folder untuk file PDF pengguna (Multer)
│   └── package.json
│
└── nginx/                    # Konfigurasi Reverse Proxy Nginx
    └── cv-generator.conf
```

---

## 🔌 API Endpoints Documentation

Aplikasi mengekspos RESTful API di bawah prefiks `/api/`. Berikut adalah dokumentasi lengkapnya:

### 1. `GET /api/health`
Mengecek status apakah *backend server* aktif dan berjalan normal.
*   **Response:** `200 OK`
    ```json
    { "status": "ok" }
    ```

### 2. `POST /api/chat`
*Endpoint* utama untuk berinteraksi dengan AI Recruiter dan membangun state CV.
*   **Body (JSON):**
    ```json
    {
      "session_id": "uuid-optional",
      "message": "Halo, nama saya Budi, saya lulusan UI jurusan Ilmu Komputer."
    }
    ```
*   **Response:**
    ```json
    {
      "session_id": "auto-generated-uuid",
      "reply": "Halo Budi! Senang berkenalan. Boleh ceritakan pengalaman kerjamu?",
      "cv_json": { "personal": { "name": "Budi" }, "education": [{ ... }] },
      "completeness_score": 30,
      "is_ready_to_generate": false,
      "missing_fields": ["experience", "projects", "skills"]
    }
    ```

### 3. `POST /api/export`
Membuat file PDF dari data *JSON* CV secara *real-time*. Dioptimalkan dengan respon *Stream* (tidak ada batasan ukuran Buffer).
*   **Body (JSON):**
    ```json
    {
      "cv_json": { "personal": { "name": "Budi" }, "experience": [...] }
    }
    ```
*   **Response:** `Content-Type: application/pdf` (Binary stream file PDF untuk di-*download*).

### 4. `POST /api/roast`
Mengirim teks atau file PDF untuk dikritik (*roast*) oleh AI Career Coach.
*   **Headers:** `Content-Type: multipart/form-data` (Jika via file)
*   **Body:** `file` (File blob PDF) *atau* `cv_text` (String text).
*   **Response:**
    ```json
    {
      "roast_result": { "score": 60, "critiques": [...], "suggestions": [...] }
    }
    ```

---

## 💾 Skema Database (SQLite)

Hanya terdapat dua tabel utama (menggunakan `better-sqlite3`):

1.  **`sessions`**: Menyimpan status *chat* dan progres pembuatan CV.
    *   `id` (TEXT, Primary Key) - UUID sesi.
    *   `created_at` (INTEGER) - Timestamp.
    *   `updated_at` (INTEGER) - Timestamp.
    *   `messages` (TEXT) - Array riwayat pesan dalam bentuk JSON string.
    *   `cv_json` (TEXT) - Progress objek CV dalam bentuk JSON string.
    *   `completeness_score` (INTEGER) - Angka 0-100.
    *   `is_complete` (INTEGER) - Flag boolean (0/1).

*(Tabel dirancang dengan TTL/Time To Live harian agar tidak membebani storage VPS).*

---

## 🚀 Panduan Instalasi dan Deployment

Target utama deployment adalah **Ubuntu VPS (1 CPU, 2GB RAM)** dengan bantuan **Nginx** sebagai *reverse proxy* dan **PM2** sebagai *process manager*.

### A. Persiapan Environment

Buat file `.env` di folder `/backend` dengan variabel berikut:
```env
PORT=3001
NODE_ENV=production
GEMINI_API_KEY=AIzaSy... # Wajib diisi dari Google AI Studio

# Rate Limit Constraints
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20

# Database & Cleanup
DB_PATH=./data/cv_generator.db
SESSION_TTL_DAYS=7
CLEANUP_INTERVAL_HOURS=24
```

### B. Build Process

1.  **Backend Dependencies:**
    ```bash
    cd backend
    npm install --production
    ```
2.  **Frontend Compilation:**
    ```bash
    cd frontend
    npm install
    # Set URL target api (kosongkan jika satu domain, misal VITE_API_URL=/api)
    echo "VITE_API_URL=/api" > .env
    npm run build
    ```
    *(Hasil kompilasi akan berada di folder `frontend/dist`)*

### C. Menjalankan Server dengan PM2 (Backend)

Sangat penting untuk menetapkan limitasi memori agar Node.js tidak menggunakan terlalu banyak RAM (`--max-memory-restart 400M`).
```bash
cd backend
pm2 start src/index.js --name cv-generator-backend --max-memory-restart 400M
pm2 save
pm2 startup
```

### D. Konfigurasi Nginx (Reverse Proxy & Static Serve)

Nginx bertanggung jawab mengarahkan trafik frontend ke file statis, dan trafik `/api` ke Express.js.

1.  Salin file konfigurasi dari proyek ke folder konfigurasi sistem:
    ```bash
    sudo cp nginx/cv-generator.conf /etc/nginx/sites-available/cv-generator
    ```
2.  Aktifkan konfigurasi Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/
    ```
3.  Pastikan untuk merubah `root /var/www/cv-generator/frontend/dist;` di file konfigurasi jika direktori berbeda.
4.  Muat ulang server Nginx:
    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```

---

## 🛡️ Catatan Optimasi Spesifik (VPS 2GB RAM)

*   **Pencegahan Memori Bocor (OOM):** `pm2` diatur untuk merestart otomatis proses `Node.js` jika menyentuh 400MB RAM. Respon *Download* (`export.js`) dipaksa menggunakan `stream.pipe()` alih-alih `buffer` di dalam memori. File unggahan PDF (`roast.js`) dikonfigurasi melalui multer agar menaruh file *temporary* di disk (`/uploads`) dan langsung dihapus melalui sistem antrian *garbage collector* setelah selesai diparse oleh `pdf-parse`.
*   **Rate Limiting:** Menggunakan `express-rate-limit` membatasi per IP maksimal 20 *requests* per menit. Nginx bertindak di depan `express`, oleh karena itu konfigurasi `app.set('trust proxy', 2)` diberlakukan di backend `index.js`.
*   **Database Write-Ahead Logging:** `db.pragma('journal_mode = WAL');` diaktifkan di `database.js` untuk kecepatan *write* database.

---
