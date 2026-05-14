# 🧠 AI CV Generator

AI CV Generator adalah aplikasi full-stack yang memanfaatkan Google Gemini AI untuk membantu Anda membangun, menganalisis (roast), dan mencocokkan CV dengan deskripsi pekerjaan (Job Match) secara interaktif.

## ✨ Fitur Utama

1.  **Chat-to-CV**: Buat CV profesional hanya dengan menjawab pertanyaan dari *AI Recruiter* (Kai) melalui antarmuka chat.
2.  **Roast My CV**: Unggah CV Anda (dalam bentuk teks atau PDF) dan dapatkan kritik konstruktif serta saran perbaikan dari *AI Career Coach*.
3.  **Job Match**: Analisis kecocokan CV Anda terhadap deskripsi pekerjaan (Job Description) tertentu untuk mengoptimalkan *ATS Score*.
4.  **CV Variants**: Hasilkan berbagai variasi CV dari data yang sama (misal: untuk *internship*, korporat, *startup*, atau beasiswa).
5.  **Export to PDF**: Unduh CV Anda dalam format PDF yang rapi dan profesional.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: React 18
*   **Bundler**: Vite v5
*   **Routing**: React Router DOM v6
*   **State Management**: Zustand
*   **Styling**: Tailwind CSS v3
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### **Backend**
*   **Runtime**: Node.js v20 LTS
*   **Framework**: Express.js v4
*   **Database**: SQLite via `better-sqlite3` (In-memory cache & WAL mode diaktifkan)
*   **AI Integration**: Google Generative AI (`@google/generative-ai` - Gemini 2.5 Flash)
*   **PDF Generation**: `pdfkit`
*   **PDF Parsing**: `pdf-parse`
*   **File Uploads**: Multer (Disk storage ke direktori `uploads/`)
*   **Keamanan**: Helmet, CORS, Express Rate Limit

---

## 🚀 Panduan Pengembangan Lokal

### 1. Persyaratan Sistem
Pastikan Anda telah menginstal:
*   Node.js (v20 disarankan)
*   NPM / Yarn

### 2. Kloning Repositori
```bash
git clone <url-repositori-ini>
cd cv-generator
```

### 3. Menjalankan Backend
```bash
cd backend

# Install dependensi
npm install

# Salin file .env
cp .env.example .env
```
> **Penting**: Buka file `.env` dan tambahkan `GEMINI_API_KEY` milik Anda. Jika menggunakan Anthropic sebelumnya, gantilah dengan konvensi API Key dari Gemini atau sesuaikan kode servis AI-nya.

```bash
# Jalankan server mode dev
npm run dev
```
Backend akan berjalan di `http://localhost:3001`. File database (`cv_generator.db`) dan folder `uploads/` akan otomatis terbuat di dalam direktori `backend`.

### 4. Menjalankan Frontend
Buka terminal baru:
```bash
cd frontend

# Install dependensi
npm install

# Buat file .env jika ingin mengatur URL API kustom
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Jalankan server mode dev
npm run dev
```
Frontend akan berjalan, biasanya di `http://localhost:5173`.

---

## 🌍 Panduan Deployment di Server (Ubuntu Linux)

Aplikasi ini dioptimalkan untuk berjalan di Virtual Machine spesifikasi rendah (RAM 2GB, 1 Core CPU).

### 1. Persiapan Server
Akses server Ubuntu Anda melalui SSH dan jalankan perintah berikut untuk menginstal Nginx, Node.js, dan PM2:

```bash
# Update dan Install dependensi dasar
sudo apt update && sudo apt upgrade -y
sudo apt install curl nginx git -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 secara global
sudo npm install -g pm2
```

### 2. Kloning & Pengaturan Source Code
```bash
# Buat direktori aplikasi
sudo mkdir -p /var/www/cv-generator
sudo chown -R $USER:$USER /var/www/cv-generator

# Kloning repositori (ganti dengan URL repo Anda)
git clone <url-repositori-ini> /var/www/cv-generator
cd /var/www/cv-generator
```

### 3. Build & Jalankan Backend
```bash
cd /var/www/cv-generator/backend

# Install dependensi mode production
npm install --production

# Atur Environment Variables
cp .env.example .env
nano .env # Pastikan mengisi GEMINI_API_KEY dan mengatur NODE_ENV=production

# Jalankan dengan PM2 (dibatasi max 400MB memori untuk menjaga stabilitas VPS 2GB)
pm2 start src/index.js --name cv-generator-backend --max-memory-restart 400M

# Simpan konfigurasi PM2 agar otomatis jalan saat server reboot
pm2 save
pm2 startup
```

### 4. Build Frontend
```bash
cd /var/www/cv-generator/frontend

# Install semua dependensi
npm install

# Pastikan URL API mengarah ke Nginx (kosongkan jika API & Frontent satu domain)
# Contoh: echo "VITE_API_URL=/api" > .env

# Build aplikasi React (output ada di folder 'dist')
npm run build
```

### 5. Konfigurasi Nginx
Kita akan menggunakan Nginx untuk melayani file statis React dan mem-proxy permintaan `/api` ke Express.js.

```bash
cd /var/www/cv-generator/nginx
# Salin konfigurasi
sudo cp cv-generator.conf /etc/nginx/sites-available/cv-generator

# (Opsional) Edit file conf jika server_name berbeda
# sudo nano /etc/nginx/sites-available/cv-generator

# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/

# Hapus konfigurasi default nginx (opsional, tapi disarankan jika ini server khusus)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx dan muat ulang
sudo nginx -t
sudo systemctl reload nginx
```

Selesai! Aplikasi Anda sekarang dapat diakses melalui domain atau IP server Anda. Semua route aplikasi web akan ditangani oleh Nginx yang menyajikan folder `dist`, sedangkan panggilan ke rute `/api/*` diteruskan ke backend PM2 Anda di port `3001`.
