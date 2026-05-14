# 📘 Buku Panduan: AI CV Generator

Selamat datang di repositori resmi **AI CV Generator**. Dokumen ini dirancang sebagai buku panduan komprehensif, mengupas tuntas dari arsitektur sistem, fitur, hingga panduan instalasi *production-ready*.

Aplikasi ini adalah solusi *full-stack* modern yang memanfaatkan kecerdasan buatan (LLM Google Gemini 2.5 Flash) untuk membantu pencari kerja membuat dan mengoptimalkan *Curriculum Vitae* (CV) mereka agar ramah terhadap mesin *Applicant Tracking System* (ATS) dan menarik di mata *Recruiter*.

Proyek ini sangat istimewa karena dirancang sedemikian rupa agar dapat berjalan dengan mulus dan stabil di lingkungan server yang memiliki sumber daya sangat terbatas: **Virtual Private Server (VPS) Ubuntu dengan 1 CPU Core dan memori 2GB RAM**.

---

## 📖 DAFTAR ISI

1. [Bab 1: Visi dan Fitur Utama](#bab-1-visi-dan-fitur-utama)
2. [Bab 2: Arsitektur dan Teknologi](#bab-2-arsitektur-dan-teknologi)
3. [Bab 3: Topologi Direktori Server](#bab-3-topologi-direktori-server)
4. [Bab 4: Spesifikasi API Endpoint](#bab-4-spesifikasi-api-endpoint)
5. [Bab 5: Skema Database](#bab-5-skema-database)
6. [Bab 6: Panduan Pengembangan Lokal](#bab-6-panduan-pengembangan-lokal)
7. [Bab 7: Panduan Deployment Server (VPS)](#bab-7-panduan-deployment-server-vps)
8. [Bab 8: Optimasi Memori & Stabilitas](#bab-8-optimasi-memori--stabilitas)

---

## 🌟 BAB 1: VISI DAN FITUR UTAMA

### Latar Belakang Masalah
Banyak pengguna awam yang tidak mengetahui standar penulisan CV yang benar. Format yang terlalu rumit dengan desain grafis berlebihan justru sering ditolak secara otomatis oleh mesin ATS. Selain itu, mengisi *form* registrasi CV satu per satu terasa sangat membosankan dan kaku.

### Solusi Aplikasi
AI CV Generator menawarkan pendekatan **Conversational UX**. Pengguna hanya perlu "mengobrol" dengan AI. AI akan mengekstrak informasi dan merangkainya menjadi data terstruktur (JSON). Data JSON tersebut kemudian di-*render* secara *real-time* menjadi dokumen PDF dengan standar industri.

### Tiga Pilar Fitur:
1.  💬 **Chat-to-CV (AI Recruiter)**
    *   Pengguna diwawancarai oleh AI bernama Kai.
    *   Proses wawancara dikelompokkan per *section* (Personal, Edukasi, Pengalaman, Skill, Proyek) agar tidak membebani memori jangka pendek pengguna.
    *   Adanya "Extraction Progress Bar" (0% hingga 100%).
    *   Jika informasi dirasa cukup (mencapai skor 70%), sistem akan otomatis menawarkan tombol pembuatan CV.
2.  📄 **ATS-Friendly PDF Generator**
    *   Menerapkan standar **Single-Column Layout** (Satu Kolom Top-to-Bottom). Desain multi-kolom sangat dilarang karena sering gagal diparsing oleh ATS.
    *   Menggunakan hierarki tipografi profesional (Sistem *Font* Serif/Sans-Serif tebal untuk nama dan judul).
    *   File *di-stream* seketika kepada *client*, memastikan privasi dan penghematan kapasitas *harddisk* server.
3.  🔥 **Roast My CV (AI Career Coach)**
    *   Pengguna dapat menyerahkan CV lama mereka berupa *file* PDF atau *copy-paste* teks panjang.
    *   AI akan mengevaluasi dan memberikan skor, serta poin-poin kritik (*roasting*) yang sifatnya konstruktif dan *actionable*.

---

## 🛠️ BAB 2: ARSITEKTUR DAN TEKNOLOGI

Proyek ini dibangun di atas pondasi lingkungan JavaScript *Full-Stack* (React + Node.js) dan dipisahkan menjadi dua pilar: **Frontend (Client)** dan **Backend (Server API)**.

### A. Frontend (Client-Side Application)
*   **Engine**: React 18
*   **Bundler**: Vite v5 (dipilih karena waktu *compile* yang jauh lebih cepat dari Webpack atau CRA).
*   **Routing**: React Router DOM v6 untuk navigasi SPA (Single Page Application) tanpa *reload* halaman.
*   **State Management**: Zustand. Sangat ringan dan tidak memerlukan konfigurasi *boilerplate* seperti Redux. Mampu tersinkronisasi dengan *LocalStorage* sehingga data *chat* pengguna tidak hilang walau peramban di-*refresh*.
*   **Styling**: Tailwind CSS v3. Tema khusus diset pada `tailwind.config.js` untuk memunculkan sensasi visual "Retro Terminal" (seperti latar belakang hitam `#0a0a0f`, teks hijau aksen `#00ffcc`, dan gaya ketikan *monospace*).

### B. Backend (Server-Side Application)
*   **Engine**: Node.js v20 LTS
*   **Framework**: Express.js v4. Menangani *routing* HTTP dan penengah keamanan (Middleware).
*   **Database Engine**: SQLite terintegrasi via `better-sqlite3`. Kami memilih SQLite untuk menghindari proses berat aplikasi *database engine* eksternal seperti MySQL atau PostgreSQL yang dapat menguras RAM VPS 2GB. File disatukan sebagai satu *file* `.db` di server.
*   **Core LLM Integration**: `@google/generative-ai` untuk melakukan pemanggilan ke model **Gemini 2.5 Flash**. Model ini dipilih karena sangat responsif untuk sistem berbasis percakapan.
*   **PDF Pipeline**:
    *   `pdfkit` -> Digunakan di dalam skrip `export.js` untuk "menggambar" *resume* satu per satu ke dokumen biner dengan koordinat tata letak.
    *   `pdf-parse` -> Digunakan untuk membaca PDF milik pengguna (fitur *Roast CV*).
*   **Keamanan**: `helmet` (HTTP Headers), `cors` (Cross-Origin Resource Sharing), dan `express-rate-limit` (Pembatasan jumlah trafik yang masuk dari satu IP secara bersamaan).

---

## 📂 BAB 3: TOPOLOGI DIREKTORI SERVER

Berikut merupakan peta direktori di dalam repositori untuk mempermudah pemahaman tim pengembang:

```text
/
├── README.md                     # BUKU PANDUAN INI
├── cv-generator/
│   ├── frontend/                 # KODE APLIKASI WEB
│   │   ├── package.json          # Dependensi Frontend (Zustand, Tailwind, dll)
│   │   ├── tailwind.config.js    # Setup Warna Tema Retro Terminal
│   │   ├── vite.config.js        # Konfigurasi port bundler
│   │   └── src/
│   │       ├── assets/           # File Statis (SVG, PNG)
│   │       ├── pages/            # View Utama (Home.jsx, ChatCV.jsx, RoastCV.jsx)
│   │       ├── store/            # Zustand store (cvStore.js)
│   │       ├── styles/           # Konfigurasi Tailwind & Global CSS
│   │       ├── App.jsx           # Setup React Router
│   │       └── main.jsx          # React Entry Point
│   │
│   ├── backend/                  # KODE APLIKASI SERVER & API
│   │   ├── package.json          # Dependensi Backend (Express, PDFKit, dll)
│   │   ├── src/
│   │   │   ├── index.js          # ENTRY POINT UTAMA (Jantung Aplikasi Server)
│   │   │   ├── env.js            # Dotenv Loader (BACA .env)
│   │   │   ├── db/               # SQLite Connection & Migrations
│   │   │   ├── parsers/          # Sanitasi output JSON dari AI Gemini
│   │   │   ├── prompts/          # System Prompts untuk Recruiter & Roaster
│   │   │   ├── routes/           # Controller untuk Endpoint (chat.js, roast.js, export.js)
│   │   │   └── services/         # Skrip Integrasi dengan Library Google Gemini
│   │   └── uploads/              # FOLDER TEMPORARY UNTUK FITUR ROAST
│   │
│   └── nginx/                    # Konfigurasi Reverse Proxy Nginx
│       └── cv-generator.conf
```

---

## 📡 BAB 4: SPESIFIKASI API ENDPOINT

Aplikasi ini menggunakan komunikasi JSON secara eksklusif.

### 1. Endpoint Percakapan (Wawancara AI)
*   **Path**: `POST /api/chat`
*   **Deskripsi**: Endpoint krusial untuk berinteraksi dengan AI. Mengirimkan masukan pengguna dan menerima kelanjutan percakapan sekaligus ekstrak JSON CV.
*   **Payload Request (Body)**:
    ```json
    {
      "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", // Kosongkan jika chat baru
      "message": "Saya lulusan S1 Sistem Informasi tahun 2023 dengan IPK 3.8."
    }
    ```
*   **Payload Response (Sukses 200)**:
    ```json
    {
      "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "reply": "Bagus sekali! Selanjutnya, apakah kamu punya pengalaman magang atau bekerja?",
      "cv_json": {
          "education": [{ "degree": "S1", "field": "Sistem Informasi", "year_end": "2023", "gpa": "3.8" }]
      },
      "completeness_score": 25,
      "is_ready_to_generate": false,
      "missing_fields": ["experience", "personal"]
    }
    ```
*   **Perilaku Penting**: `is_ready_to_generate` akan diset menjadi `true` oleh *backend prompt* ketika AI merasa seluruh atribut utama telah terkumpul. Frontend bereaksi pada *flag* ini untuk menampilkan tombol *Download*.

### 2. Endpoint Pembuatan Dokumen (Ekspor PDF)
*   **Path**: `POST /api/export`
*   **Deskripsi**: Digunakan oleh sistem *Frontend* untuk merender JSON penuh menjadi PDF ATS-Friendly.
*   **Payload Request (Body)**:
    ```json
    {
      "cv_json": { "personal": { "name": "Budi Rahardjo", "email": "budi@email.com" }, "experience": [...] }
    }
    ```
*   **Payload Response**:
    Sebuah *Binary Stream* (*Content-Type: application/pdf*).
    *Backend tidak mengembalikan URL lokal maupun menyimpan file di memori. Pengkodean langsung disuntikkan ke dalam tabung stream HTTP. Proses ini sangat menyelematkan memori pada VPS terbatas.*

### 3. Endpoint Kritik CV
*   **Path**: `POST /api/roast`
*   **Format HTTP**: *Multipart Form-Data* (Karena menangani *upload file*).
*   **Payload**:
    *   `file`: Berkas PDF (maksimal 5MB)
    *   *atau* `cv_text`: String berupa tempelan dari teks panjang.
*   **Payload Response**: Mengembalikan struktur analisis JSON komprehensif berisikan skor (0-100), daftar pujian, dan daftar kelemahan (*roast points*).

### 4. Endpoint Kesehatan (Health Check)
*   **Path**: `GET /api/health`
*   **Response**: `{"status": "ok"}`
*   Digunakan oleh *Cloudflare Tunnels* atau sistem monitoring (seperti UptimeRobot) untuk memantau apakah *backend Node.js* tewas secara tidak terduga.

---

## 🗄️ BAB 5: SKEMA DATABASE

Kami sengaja menjaga hierarki data sesepele mungkin menggunakan SQLite agar tidak boros tenaga sistem operasi. Database berada di `/backend/data/cv_generator.db`.

**Tabel `sessions`**
Tabel ini merekam komunikasi, ID pengguna *anonymous*, beserta isi ekstraksinya.
*   `id` (TEXT) : Primary Key (UUID v4).
*   `created_at` (INTEGER) : Unix Timestamp saat pertama kali mengobrol.
*   `updated_at` (INTEGER) : Unix Timestamp terakhir pesan masuk.
*   `messages` (TEXT) : String panjang menyimpan Array Of Objects (Histori Percakapan). Misal: `[{"role":"user","content":"Hi"},{"role":"ai","content":"Halo"}]`.
*   `cv_json` (TEXT) : Tempat penyimpanan ekstraksi hasil Gemini sejauh ini.
*   `completeness_score` (INTEGER) : Intejer 0 sampai 100.
*   `is_complete` (INTEGER) : Boolean SQLite (1 jika selesai, 0 jika belum).

Tabel ini secara otomatis akan "membersihkan diri sendiri" setiap 24 jam dengan menghapus sesi *chat* yang tidak aktif lebih dari batas *Time-to-Live* (standar 7 Hari) yang diatur dalam variabel lingkungan.

---

## 💻 BAB 6: PANDUAN PENGEMBANGAN LOKAL

Panduan jika Anda adalah *Software Engineer* yang ingin menjalankan kode ini secara lokal di PC/Macbook Anda.

1.  **Syarat Sistem:** Instal Node.js versi 20 atau ke atas.
2.  **Kloning Proyek:**
    ```bash
    git clone https://github.com/repository-anda/cv-generator.git
    cd cv-generator
    ```
3.  **Pengaturan Variabel (*Environment*) Backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    ```
    Buka file `.env` menggunakan *code editor* favorit Anda. Pastikan memasukkan API Key Google Gemini asli pada isian:
    `GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx`
4.  **Menjalankan Backend:**
    ```bash
    npm run dev &
    ```
    (Log akan bertuliskan *Server running on port 3001*. Biarkan berjalan atau jalankan di *background*).
5.  **Pengaturan Frontend:**
    Buka terminal jendela baru.
    ```bash
    cd cv-generator/frontend
    npm install
    ```
    Buat file `.env` dengan satu baris:
    `VITE_API_URL=http://localhost:3001/api`
6.  **Menjalankan Frontend:**
    ```bash
    npm run dev &
    ```
    Buka tautan `http://localhost:5173` di peramban (Chrome/Firefox/Safari) Anda.

---

## 🚀 BAB 7: PANDUAN DEPLOYMENT SERVER (VPS)

Buku panduan ini mengasumsikan Anda menyewa Cloud VPS Linux berbasis Ubuntu (seperti DigitalOcean, Linode, Contabo) berspesifikasi **1 CPU Core, 2GB RAM**.

### Langkah 1: Kebutuhan Sistem Operasi
*Login* ke VPS menggunakan SSH. Jalankan blok instalasi utama:
```bash
# Update Repo Linux
sudo apt update && sudo apt upgrade -y

# Instalasi NGINX, Git, Curl
sudo apt install curl nginx git -y

# Instalasi Node.js versi LTS 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalasi PM2 (Process Manager Daemon)
sudo npm install -g pm2
```

### Langkah 2: Unduh Source Code ke Server
```bash
# Kita tempatkan pada root servis www
sudo mkdir -p /var/www/cv-generator
sudo chown -R $USER:$USER /var/www/cv-generator
git clone <URL-REPO> /var/www/cv-generator
cd /var/www/cv-generator
```

### Langkah 3: Build & Menjalankan Service Backend
Proses Node.js Backend tidak akan dihentikan secara sepihak jika menggunakan PM2.
```bash
cd backend
npm install --production

# Jangan lupa untuk Setup .env nya di server (Isi NODE_ENV=production, PORT=3001, dan GEMINI_API_KEY)
cp .env.example .env

# Nyalakan PM2 dengan proteksi RAM ketat
pm2 start src/index.js --name cv-generator-backend --max-memory-restart 400M

# Simpan status PM2 agar berjalan lagi otomatis walau server di-reboot
pm2 save
pm2 startup
```

### Langkah 4: Compile & Build Static Frontend
Aplikasi *Frontend React Vite* tidak berjalan sebagai proses *Node.js* di level *production*. Vite akan merubah JSX ke HTML murni untuk dilayani secepat kilat oleh web server (Nginx).
```bash
cd ../frontend
npm install

# Setup rute menuju reverse proxy nginx
echo "VITE_API_URL=/api" > .env

# Jalankan mesin Compile (Minification & Uglification)
npm run build
```
Setelah proses selesai, akan tercipta folder rahasia baru: `/var/www/cv-generator/frontend/dist/`. Inilah folder yang akan disajikan secara publik ke dunia maya.

### Langkah 5: Pengikatan (Binding) dengan NGINX Reverse Proxy
Nginx digunakan untuk:
1. Menyajikan hasil *build* statis React (sebagai wajah).
2. Meneruskan permohonan bersyarat `/api/*` ke dalam pelukan aplikasi PM2 Backend (`localhost:3001`).

```bash
cd /var/www/cv-generator/nginx
sudo cp cv-generator.conf /etc/nginx/sites-available/cv-generator
sudo ln -s /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/

# Verifikasi NGINX lalu Reload Sistemnya
sudo nginx -t
sudo systemctl reload nginx
```
**Selesai!** Aplikasi kini *live*. Jika menggunakan layanan tambahan *Cloudflare Tunnels*, Nginx hanya perlu disambungkan port `80`-nya menuju *Tunnels*.

---

## 🔒 BAB 8: OPTIMASI MEMORI & STABILITAS

Buku panduan tidak akan lengkap tanpa menjelaskan *bagaimana* aplikasi ini didesain. Mengapa ia aman di-hosting pada *budget* termurah?

### A. Kebijakan "Streaming Response" di API Export
Sistem pembangkit PDF konvensional (seperti library Puppeteer yang menggunakan Headless Chrome) akan menguras lebih dari `1GB RAM` dalam sekali pengerjaan PDF saja, hal ini menyebabkan server mati sesak napas (OOM - Out of Memory).

Solusi kami: Menggunakan algoritma vektor kanvas (`pdfkit`). Skrip tidak mencetak data sementara pada *RAM Buffer*, melainkan memompa setiap *byte* dokumen langsung menuju saluran koneksi TCP pengguna yang merespon HTTP:
```javascript
res.setHeader('Content-Type', 'application/pdf');
doc.pipe(res); // Ajaib: Memori terjaga di bawah 60MB sekalipun mengolah 50 PDF bersamaan
```

### B. SQLite Write-Ahead Logging (WAL)
Penulisan database pada *file* `.db` dapat memperlambat proses *thread* Node.js jika disk I/O lambat. Dengan mengaktifkan `WAL Mode` di dalam inisialisasi `better-sqlite3`, penulisan diselipkan dalam antrian jurnal sehingga proses baca dan tulis bisa dilakukan secara non-blocking bersamaan, menjaga *latency* di titik stabil `1-5 milidetik`.

### C. Rate Limiting Terbalik
`express-rate-limit` secara krusial dipasang pada level perantara (*Middleware*). Karena sistem berada di bawah naungan Nginx dan Cloudflare, konfigurasi `app.set('trust proxy', 2)` wajib disetel di dalam file `index.js`. Hal ini memastikan *Limiter* memblokir IP Pengguna asli, bukan memblokir IP dari peladen lokal Nginx tersebut.

### D. File Cleanup Berantai
Setiap file unggahan dari pengguna (pada fitur *Roast*) diamankan ke dalam `disk` (direktori `uploads/`), bukan disimpan ke dalam memori aplikasi *Express Middleware Multer*. Setelah skrip Python via `pdf-parse` sukses mengekstrak, sistem file `fs.unlink()` langsung akan menghapus data tersebut untuk menjaga harddisk VPS agar tidak kehabisan ruang (*disk-space*).
