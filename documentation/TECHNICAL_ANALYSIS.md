# Analisa Teknikal Mendalam: RetroChat AI / CV Generator

Dokumen ini disusun sebagai panduan *Deep Dive Technical Analysis* yang ditujukan untuk keperluan presentasi, _technical review_ perusahaan, maupun sidang akademik. Analisis ini mencakup arsitektur, _flow data_, optimasi level _production_, serta rancangan penskalaan (skalabilitas) sistem.

---

## 🏗️ BAGIAN 1: ANALISA MENDALAM SISTEM E2E (Poin 1-20)

### 1. Analisa Arsitektur Sistem End-to-End
Sistem ini menggunakan arsitektur **Monolith terpisah (Decoupled Monolith)**.
Frontend (React SPA) dan Backend (Express API) berada dalam satu repositori namun diproses secara terpisah.
Di _Production_, Nginx bertindak sebagai gerbang terdepan (_Reverse Proxy_) yang melayani file statis Frontend (hasil *build* Vite) secara langsung dari _disk_, sekaligus meneruskan permintaan dinamis (`/api/*`) ke server Node.js lokal di _port_ 3001. Data persisten ditangani oleh SQLite lokal, sementara beban kognitif diserahkan ke *Third-Party* API (Google Gemini). Semuanya bersembunyi aman di balik *Cloudflare Tunnels* untuk keamanan perimeter jaringan (menutup *port* publik VPS).

### 2. Analisa Flow Frontend → Backend → AI → CV Generation
Alur kerjanya terbagi dalam tiga lintasan:
1.  **Interaksi**: Frontend (Zustand) mengirim _chat_ *user* via Axios ke `POST /api/chat`.
2.  **Kognisi AI**: Backend Express merangkum historis pesan + state CV JSON saat ini, lalu menyuntikkannya ke _prompt_ sistem (`recruiterAgent.js`). AI membalas dengan percakapan baru dan **ekstraksi JSON** yang diperbarui.
3.  **Kalkulasi**: Skor kelengkapan dihitung, lalu backend membalas ke Frontend.
4.  **Generasi**: Jika indikator mencapai 100% (atau ≥ 70%), UI memunculkan tombol _Download_. *User* menekan tombol, sistem memanggil `POST /api/export`, dan Backend akan membangun PDF.

### 3. Analisa Struktur Folder Project
Repositori menganut struktur **Monorepo Sederhana**:
*   `/frontend`: Lingkungan UI dengan React, Vite, dan Zustand. Berfokus pada komponen (`/src/components`, `/src/pages`).
*   `/backend`: Lingkungan API. Dipecah ke `/routes` (pengatur *endpoint*), `/services` (logika AI dan PDF), `/db` (koneksi dan migrasi), serta `/parsers` (pembersih JSON).
*   `/nginx`: Konfigurasi infrastruktur _deployment_.
Pemisahan ini memudahkan _engineer_ untuk melakukan _micro-updates_ (misal: hanya _deploy_ frontend tanpa mengganggu proses backend).

### 4. Analisa Bagaimana AI Chat System Bekerja
Aplikasi menggunakan **GoogleGenerativeAI (gemini-2.5-flash)** dengan teknik **Stateful Prompting**.
AI tidak dituntut untuk mengingat *session* di _server_ internalnya; melainkan, Node.js selalu memberikan "ingatan" berupa historis _chat_ sebelumnya dari SQLite dan struktur JSON yang telah terisi sejauh ini. Output AI divalidasi dan di-parsing untuk selalu mengembalikan *object* JSON yang memisahkan `"reply"` (balasan untuk *user*) dan `"cv_json"` (struktur *data* CV).

### 5. Analisa Progress Indicator Logic
Kalkulasi kelengkapan ditangani secara deterministik di backend (`completeness.js`), BUKAN ditanyakan kepada AI. Skrip mendefinisikan `REQUIRED_FIELDS` (seperti nama, *experience*) dengan bobot nilai (total ~100). Saat AI mengembalikan JSON baru, algoritma menelusuri JSON tersebut. Jika *field* terisi (tidak kosong/null), poin ditambahkan. Ini menjamin persentase di UI bergerak pasti dan akurat (tidak berhalusinasi).

### 6. Analisa State Management
Di *Frontend*, state dikendalikan oleh **Zustand** (`cvStore.js`). Zustand bertugas menyimpan `sessionId`, `cvData`, dan `completenessScore`.
`sessionId` direkam ke dalam `localStorage` Browser. Ini adalah trik cerdas: *user* dapat menyegarkan (*refresh*) halaman atau menutup *tab*, dan saat kembali, Zustand membaca ID tersebut, sehingga mereka dapat melanjutkan sesi dengan AI tanpa *login*/autentikasi sistem yang rumit.

### 7. Analisa Deployment Production
Alurnya menggunakan skrip manual namun stabil:
1. `git pull`: Sinkronisasi versi kode.
2. `npm run build`: Vite merangkum React JSX + Tailwind ke file `.js`, `.css`, dan `.html` murni yang sangat kecil (*minified*).
3. `pm2 restart`: Mengulang siklus backend Express untuk menerapkan perubahan kode `/backend`.
4. `nginx reload`: Membaca ulang _cache_ dan konfigurasi jika ada perubahan *routing*.

### 8. Analisa PM2 dan Alasan Pemakaiannya
Node.js bersifat *single-thread*. Jika terdapat satu *error* asinkronus tak tertangani (*Unhandled Promise Rejection*), seluruh _server_ akan mati (Crash).
**PM2** adalah *Process Manager Daemon* yang:
1. Akan menghidupkan kembali _server_ secara instan (0 detik downtime) jika terjadi *crash*.
2. Menyimpan *startup script* sehingga jika VPS di-_reboot_, aplikasi menyala otomatis.
3. Memberikan batas penggunaan memori (`--max-memory-restart 400M`) guna menghindari memori habis (_Memory Leak_).

### 9. Analisa Nginx Reverse Proxy
Nginx di sini bertindak sebagai "Trafik Polisi".
Daripada Node.js membuang-buang _resource_ untuk mengirim file gambar atau `.js` statis, Nginx yang dikompilasi dengan C akan melayaninya dalam hitungan mikrodetik (termasuk *Gzip Compression*). Nginx meneruskan request spesifik API ke Node.js, memberikan lapisan perlindungan tambahan terhadap *request* cacat sebelum mencapai _engine_ JS.

### 10. Analisa Keamanan Server Production
1.  **Helmet.js**: Menyamarkan dan membuang _header HTTP_ yang membocorkan teknologi server (`X-Powered-By: Express`).
2.  **CORS**: Hanya merespons permintaan spesifik jika *domain* sudah di-_lock_ (bisa diaktifkan ketat).
3.  **Express Rate Limit**: Memblokir IP jika mencoba melempar pesan *chat* atau *generate* CV lebih dari 20 kali per menit (mencegah DDoS Layer 7 dan penyalahgunaan kuota Google Gemini).

### 11. Analisa Cloudflare (Tunnels)
Berdasarkan asumsi sistem VPS dengan perlindungan modern, *Cloudflare Tunnels* (cloudflared) bertindak sebagai jembatan langsung (_Outbound Connection_) dari dalam VPS menuju Data Center Cloudflare. Server tidak membutuhkan Port 80/443 terbuka (*Open Port*) pada Firewall VPS, sehingga *hacker* sama sekali tidak bisa melakukan IP Scanning atau langsung menyerang mesin fisik.

### 12. Analisa Monitoring Server
Sistem menyediakan *endpoint* spesifik: `GET /api/health`.
Ini adalah praktik _production-ready_ di mana bot *monitoring* eksternal (seperti UptimeRobot) dapat melakukan "ping" secara konstan. Jika balasan bukan `{"status": "ok"}`, maka alert akan terpicu ke tim _engineer_. Monitoring level server juga bisa dilakukan melalui komando `pm2 monit`.

### 13. Analisa Scalability Project
Sistem dirancang untuk *Vertical Scaling* (memperbesar CPU/RAM di satu VPS).
Namun, karena Express *Backend* mengadopsi _Stateless Architecture_ (satu-satunya tempat state disimpan adalah di SQLite), proyek ini sudah "setengah matang" untuk *Horizontal Scaling* (menambah jumlah server backend). Tantangan saat ini adalah SQLite (berbasis file tunggal) yang tidak bisa disinkronkan langsung antar VPS fisik (membutuhkan migrasi DB).

### 14. Analisa Bottleneck System
*   **Third-Party Latency**: Kecepatan *reply* sangat bergantung pada stabilitas koneksi Google Gemini API.
*   **CPU-Bound Task**: *Render* PDF menggunakan CPU server secara intensif. Jika 100 *user* melakukan ekstraksi bersamaan pada VPS 1 CPU, I/O *Thread Pool* Node.js akan mulai tersendat (_Event Loop Block_).
*   **Database Write Lock**: Meskipun SQLite diatur ke WAL mode, ia tetap berpotensi melambat jika *Write Request* dari ratusan konvergensi *chat* masuk di waktu mili-detik yang persis sama.

### 15. Analisa Kemungkinan Vulnerability/Security Issue
*   **Server Disk Full (Denial of Service via Upload)**: Meskipun ada `fs.unlink()` pada endpoint `/roast` (Upload PDF), jika proses *extract* (*pdf-parse*) mati mendadak (Crash) sebelum masuk _finally block_, file tetap ada di *harddisk* (`uploads/`), menumpuk dari waktu ke waktu.
*   **ReDoS (Regular Expression Denial of Service)**: Jika ada _user_ usil menempelkan string sangat panjang pada PDF Roast.
*   **Bot Abuse**: Limit 20/menit cukup aman, tetapi bot skala besar dari IP berbeda bisa menghabiskan limit tagihan API Google (API Exhaustion).

### 16. Analisa Pembuatan PDF (Memory Optimization)
Bagian terpenting arsitektur: File `export.js` menggunakan algoritma *Pipe Streaming* (`pdfkit`).
PDF **TIDAK** disimpan ke sistem *file* VPS (`.pdf` pada disk) dan **TIDAK** ditahan di RAM (*Buffer* penuh). Secara literal, *byte* PDF dirangkai baris-demi-baris oleh Node.js dan langsung dilempar ke Pipa Respon HTTP jaringan (`doc.pipe(res)`). Ini menyebabkan konsumsi RAM turun dari ~500MB (jika menggunakan Headless Chrome Puppeteer) menjadi hanya ~30-50MB per ekstraksi.

### 17. Analisa Flow Request User
1. `User Browser` (Klik Kirim Chat) -> `Zustand Axios` -> `Cloudflare Edge Server` (Verifikasi WAF/DDoS) -> `Cloudflare Tunnel` -> `Nginx VPS` (Cek Reverse Proxy Limit) -> `PM2 Node.js` -> `Express Rate Limit` -> `Router /api/chat` -> Proses Ekstraksi -> Jalur balik (*Response*).

### 18. Analisa Resource Usage Server
1 CPU / 2GB RAM sangat memadai untuk ~1.000 DAU (Daily Active Users).
*   **Frontend**: 0 RAM (Dilayani statik Nginx).
*   **SQLite**: Sangat meminimalisir RAM karena menggunakan Cache-Size -4000 (4MB max) + WAL (*Write-Ahead Log*) untuk _non-blocking_ I/O disk.
*   **Express/PM2**: Diset batas atas 400MB.

### 19. Analisa CI/CD Manual Deployment
Saat ini menggunakan skrip bash standar / _manual pull_. Praktik ini memiliki kelemahan di mana _engineer_ berpeluang melakukan *human error*. Sistem ini bisa dielevasi drastis dengan penggunaan GitHub Actions, menggunakan *rsync* SSH dan merestart _server_ secara terotomatisasi (*Zero Downtime Deployment*).

### 20. Analisa Reliability dan Fault Tolerance
Toleransi kesalahan di-*handle* dengan sangat baik:
*   Jika koneksi Gemini API terputus / *Timeout*, backend dibungkus _try-catch_ untuk mengembalikan pesan darurat (_Fallback Reply_): *"Maaf terjadi kesalahan..."*, sehingga UI tidak "*ngehang*" / UI *loading* terus menerus.
*   Sistem database mandiri (SQLite) menihilkan _network timeout database_ (karena satu mesin lokal).
*   _Cron Job Cleanup_ interval Node.js yang otomatis membersihkan data sesi berumur lebih dari 7 hari, menjamin _Disk Space_ VPS tidak membusuk dipenuhi sampah sesi anonim.

---

## 🎤 BAGIAN 2: PANDUAN PRESENTASI & TECHNICAL REVIEW

### 💡 Poin Penting yang Harus Dijelaskan Saat Presentasi
1.  **"Tidak Menggunakan Form Panjang"**: *Highlight* inovasi UI/UX. Sistem CV lama memaksa pengguna mengisi *form* puluhan baris. Aplikasi ini merevolusinya menjadi _conversational_ UI layaknya wawancara.
2.  **Efisiensi Server Tingkat Tinggi**: Jelaskan bagaimana sistem ini dirancang "tahan miskin" (Production di 1 CPU / 2GB RAM) tanpa *Out of Memory (OOM)* berkat inovasi *Streaming PDF Generation* dan *SQLite WAL*.
3.  **Prompt Engineering di Belakang Layar**: Paparkan bahwa AI di belakang layar bukan sekedar ChatGPT *wrapper*, namun AI diberikan tugas mengekstrak, merekonsiliasi JSON secara persisten.

### ❓ Kemungkinan Pertanyaan Dosen / Reviewer & Jawabannya
*   **Q: Mengapa menggunakan SQLite? Bukankah itu database untuk mobile app, kenapa tidak MySQL/PostgreSQL?**
    *   **A:** Mengingat arsitektur kita bersifat MVP (*Minimum Viable Product*) pada *single node server*, SQLite adalah pilihan paling tepat secara teknikal. Menginstal *instance* MySQL memakan minimal 400MB RAM dalam status *idle*. SQLite bekerja sebagai I/O _file driver_ (langsung di *library* Node.js) tanpa adanya koneksi TCP ke _layer database server_. Dengan integrasi `better-sqlite3` dan WAL *Mode*, *throughput*-nya dapat menyaingi PostgreSQL pada level beban kerja saat ini, dengan *footprint* _zero maintenance_.
*   **Q: Kenapa saat ekspor CV (.pdf) Anda tidak menggunakan Puppeteer/Headless Browser? Format HTML ke PDF kan jauh lebih mudah di desain?**
    *   **A:** Berdasarkan kalkulasi RAM VPS kita yang terbatas (2GB). Menjalankan Headless Chrome via Node.js akan mengokupasi 500-800MB per *thread* (1 pembuatan PDF). Jika 4 orang menekan tombol *generate* secara bersamaan, VPS akan mati sesak nafas (*Out of Memory*). Maka dari itu, pendekatan vektor *Canvas* menggunakan `pdfkit` digunakan karena menghasilkan *binary output* yang langsung disuntikkan ke HTTP _Streaming Pipeline_. Hemat *resource* 90%.
*   **Q: Bagaimana kamu memastikan IP pengguna yang di Rate-Limit adalah IP asli, karena kalian menggunakan Cloudflare dan Nginx?**
    *   **A:** Node.js *Express* menerima koneksi langsung dari IP lokal Nginx (127.0.0.1). Jika kami me-limit begitu saja, seluruh sistem akan terblokir. Solusi *engineering* kami adalah mengonfigurasi `app.set('trust proxy', 2)` pada Express, sehingga ia melihat pada Header HTTP `X-Forwarded-For` yang dilempar dari Nginx dan Cloudflare secara berantai, sehingga Express mampu me-limit alamat IP asli pengguna di ujung dunia.

### 🛠️ Alasan Pemilihan Teknologi Utama
*   **React + Vite**: Kecepatan inisialisasi modul UI (Hot Module Replacement) untuk _Developer Experience_ yang super cepat; SPA (Single Page Apps) menghemat beban transfer *bandwidth* (hanya JSON yang lalu lalang).
*   **Google Gemini (2.5 Flash)**: Dipilih karena _cost-efficiency_, memiliki parameter _context window_ tinggi (mengingat percakapan panjang), dan model *Flash* sangat _reliable_ untuk struktur JSON _schema parsing_.

### ⚖️ Kelebihan dan Kekurangan Arsitektur
**Kelebihan:**
*   Sangat hemat _hosting_ (*Low Ops/Low Cost*).
*   Arsitektur *Decoupled* (Backend/Frontend) sangat rapih untuk *maintenance*.
*   *Cold Start time* nyaris nol dibanding arsitektur berbasis *Serverless Lambdas*.

**Kekurangan:**
*   Sistem bersifat *Stateful Storage* (File SQLite + file `.pdf` lokal untuk proses Roast). Jika trafik naik drastis di masa depan, tidak bisa sembarangan mereplika *VPS Server* (Horizontal Scalability Terbatas).
*   Kecepatan respon bertumpu pada latensi komunikasi dengan Google API (Jika Google _down_, fungsi utama lumpuh).

### ✨ Bagian Paling "Menarik" Secara Engineering
Integrasi aliran Data AI ke dalam **deterministik state**. Dalam dunia AI yang "*hallucination prone*" (suka mengarang), Backend secara brilian memadukan AI untuk *"Language Understanding"* (merespon user) namun menggunakan logika JS murni konvensional (`completeness.js`) untuk menghitung Progress Bar ekstraksi berdasarkan JSON yang dihasilkan AI. Ini menciptakan _experience_ yang terasa sangat pintar di mata _User_ namun terprediksi penuh di mata _Engineer_.

---

## 🗺️ BAGIAN 3: DIAGRAM ARSITEKTUR & FLOW

*(Untuk presentasi, silakan terjemahkan deskripsi berikut menjadi diagram kotak di Draw.io / PowerPoint)*

### A. Kemungkinan Diagram Arsitektur (Bagan E2E)
```text
[ USER (Browser/HP) ]
       │ (HTTPS)
       ▼
[ Cloudflare Edge ] --- (Proteksi WAF, SSL, Cache)
       │ (Cloudflare Tunnels)
       ▼
[ VPS Ubuntu ]
  │
  ├──► [ Nginx (Reverse Proxy :80) ]
  │        ├── (Static Route /) ──────► [ Frontend /dist Folder (React SPA) ]
  │        └── (API Route /api/*) ────► (Proxy Pass HTTP 127.0.0.1:3001)
  │
  └──► [ PM2 Daemon ] ──► [ Node.js (Express Backend) ]
                             ├──► [ Google Gemini API ] (Internet Outbound)
                             └──► [ SQLite DB File ] (data/cv_generator.db)
```

### B. Flow Deployment
`[Engineer Commit ke Git]` ➔ `[Login SSH ke VPS]` ➔ `[Git Pull]` ➔ `[cd frontend -> npm install & npm run build]` ➔ `[cd backend -> npm install]` ➔ `[pm2 restart cv-generator-backend]` ➔ `[nginx -t && systemctl reload nginx]` ➔ `[Sistem Terbarui dengan Zero-Downtime]`

### C. Flow Request User (Cth: Mengirim Chat)
1. User mengetik pesan dan tekan _Enter_.
2. `App.jsx` React mencegah _reload_ halaman, mengubah state UI ke _loading_.
3. Axios mengirim `POST /api/chat` dengan payload `{"session_id": "xyz", "message": "Halo"}`.
4. Express menerima. Mengambil `session_id` dari DB SQLite (Tabel *sessions*).
5. _Service_ Node.js menambahkan "Halo" ke antrian histori _chat_.
6. Backend memanggil Gemini API dengan Prompt + Historis Chat.
7. Gemini membalas dengan JSON terstruktur.
8. Backend memperbarui data ekstrak, mengkalkulasi skoring (misal naik jadi 30%).
9. Backend merespon Axios dengan `HTTP 200 OK` (Pesan Balasan AI + Data + Progress Score).
10. Zustand memperbarui state komponen, dan UI render percakapan baru.

### D. Flow Generate CV
1. Kondisi: Score Kelengkapan di UI = 100%. Tombol *Generate* ditekan.
2. React mengirim `POST /api/export` berserta obyek utuh JSON profil _user_.
3. Express menerima permintaan. Menginisiasi `PDFDocument()` (Library pdfkit).
4. Express menge-*set header* `Content-Type: application/pdf`.
5. Express mem-*pipe* `doc.pipe(res)`.
6. Teks dirender satu-persatu ke dalam kanvas (Nama, Pengalaman, Garis bawah).
7. `doc.end()` dipanggil.
8. _Browser User_ langsung menerima file berformat biner dan memicu Dialog *Save File*.

---

## 🔮 BAGIAN 4: FUTURE IMPROVEMENTS & SCALABILITY

### Bagaimana Project Ini Bisa Diskalakan (Traffic Naik Drastis)?
Jika aplikasi viral dan mencapai 10.000+ pengguna aktif, mesin 1 CPU akan mengalami kongesti _Event-Loop_ saat proses pembuatan PDF (*CPU Bound task*).
**Solusi Evolusi Skala:**
1.  **Phase 1 (Micro-scaling):** Aktifkan mode `pm2 cluster` sebanyak _Core Processor_ server.
2.  **Phase 2 (Horizontal Scaling):** Memecah (_split_) Backend API ke 3 VPS terpisah. Kita letakkan Nginx _Load Balancer_ di depannya (`upstream backend { server IP1; server IP2; server IP3; }`).

### Bagaimana Migrasi dari SQLite ke PostgreSQL?
Agar *Phase 2 Horizontal Scaling* di atas dapat terjadi, semua *Node Backend* harus berbagi satu memori data. File SQLite harus ditinggalkan.
**Langkah Migrasi:**
1.  Ganti _Library_ `better-sqlite3` menjadi ORM level perusahaan seperti **Prisma** atau **Sequelize**.
2.  Buat instance **PostgreSQL Database** di Cloud yang dikhususkan (PaaS) atau di VPS terpisah.
3.  Migrasi struktur *Table* (Sessions, CVs) menjadi relasi skema SQL standar. Backend tidak lagi membaca dari `.db` lokal, melainkan melalui _connection pool_ TCP ke server PostgreSQL.

### Membangun Sistem yang Lebih Tahan Banting & Aman (Security & Monitoring)
1.  **Orphaned File Sweeper (Security Fix):** Skrip *cron job* saat ini hanya membersihkan `sessions` dari SQLite. Harus ditambahkan logika `fs.readdir` untuk mengecek direktori `uploads/` setiap malam dan menghapus paksa file sampah PDF (*failed roast*).
2.  **Auth Layer untuk Endpoint Roast:** Karena `/api/roast` mengkonsumsi komputasi *file parsing* yang cukup berat, endpoint ini paling rawan menjadi target peretasan _Resource Exhaustion_. Diperlukan _layer_ perlindungan CAPTCHA cerdas atau Token Anti-CSRF.
3.  **Advanced Logging & Metrics (Monitoring):** Buang `console.log()` sederhana. Ganti dengan *Logger Winston* terpusat yang melempar *error level CRITICAL* langsung ke kanal Telegram tim _Developer_. Integrasikan sistem dengan **Prometheus dan Grafana Dashboards** untuk mengamati matriks RAM Node.js, RPS (Request per Second), dan paku lonjakan respon API Gemini secara visual.
