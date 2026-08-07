# Kasbon - Personal Debt & Receivable Tracker

Aplikasi web pencatatan utang-piutang pribadi yang dibangun dengan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, dan **Supabase (PostgreSQL + Auth + RLS)**.

![Kasbon Preview](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop)

---

## 🛠️ Stack & Library
- **Framework:** Next.js 16 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript (`strict` mode)
- **Styling:** Tailwind CSS v4 + Lucide React Icons
- **Backend & Auth:** Supabase (PostgreSQL + Auth + `@supabase/ssr`)
- **Utility:**
  - `date-fns`: Format waktu relatif dalam Bahasa Indonesia ("3 hari lalu", "kemarin").
  - `zod`: Validasi skema input client & server API.
  - `recharts`: Visualisasi grafik perbandingan total piutang vs utang.

---

## 🚀 Fitur Utama & Value Add

1. **Authentication & Security:**
   - Auth email + password via Supabase Auth & `@supabase/ssr`.
   - Middleware Auth Guard untuk memproteksi halaman dashboard & API endpoints.
   - **Row Level Security (RLS) Strict:** Setiap pengguna hanya dapat mengakses dan mengelola data milik sendiri di level database PostgreSQL.

2. **Dashboard & Ringkasan Keuangan:**
   - 3 Kartu Summary: *"Total Dihutang ke Saya"*, *"Total Saya Hutang"*, dan *"Net Balance"* (dengan warna dinamis hijau/merah).
   - Visual Bar Comparison: Diagram komparasi total piutang vs utang.

3. **Manajemen Transaksi & Interaktivitas:**
   - Form modal untuk mencatat baru / mengedit transaksi dengan format Rupiah `id-ID` (`Rp 1.234.000`).
   - Fitur **Tandai Lunas / Batal Lunas** (idempotent toggle via API `PATCH`).
   - Filtering ganda (Status: Semua/Belum Lunas/Lunas + Tipe: Semua/Dihutang/Hutang).
   - Search bar real-time berdasarkan nama orang.
   - Sorting berdasarkan Tanggal (Terbaru/Terlama) & Jumlah (Terbesar/Terkecil).
   - **Grouping Per Orang:** Opsi pengelompokan transaksi dari nama orang yang sama (e.g. *"Budi: 3 transaksi, total net Rp X"*).

---

## 📋 Cara Setup & Jalankan di Lokal

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- npm / pnpm / yarn
- Akun Supabase (Free tier)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/username/kasbon-app.git
cd kasbon-app
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi nilai URL & Anon Key dari dashboard Supabase Project Anda (Project Settings -> API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJKV1Qi...
```

### 4. Eksekusi Migrasi Database & RLS
Buka **SQL Editor** di Dashboard Supabase Anda, lalu salin dan jalankan seluruh isi file migrasi:
```path
supabase/migrations/20260807000000_create_debts_table.sql
```
*Skrip ini akan membuat enum `debt_type`, tabel `debts`, index performa, trigger update timestamp, serta mengaktifkan aturan RLS.*

### 5. Jalankan Server Lokal
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Link Demo Deployment
- **Vercel Live Demo:** [https://kasbon-app.vercel.app](https://kasbon-app.vercel.app) *(Silakan sesuaikan URL live)*

---

## 💡 Technical Approach (Keputusan Teknis yang Dibanggakan)
Salah satu keputusan teknis terbaik dalam arsitektur aplikasi ini adalah pengintegrasian **Supabase Server Side Rendering (`@supabase/ssr`)** yang dipadukan secara konsisten dengan **Next.js 16 Middleware Guard** dan **PostgreSQL Row Level Security (RLS)**. Alih-alih hanya mengandalkan validasi di tingkat aplikasi (API Handlers), pengamanan data dilakukan secara bertingkat (*defense-in-depth*). Seluruh kueri database secara otomatis menyertakan `auth.uid() = user_id`, sehingga meskipun API key publik digunakan langsung melalui Supabase REST Client, kebocoran data antar pengguna tidak mungkin terjadi. Di samping itu, penanganan format mata uang Rupiah (`id-ID`) dan relative date dalam Bahasa Indonesia dienkapsulasi ke dalam utility murni yang teruji.

---

## ⚖️ Trade-offs & Rencana Polish (Jika ada 1 hari lagi)
1. **Optimistic UI Updates:** Saat menandai transaksi lunas atau menghapus, aplikasi saat ini menunggu respon server sebelum me-refresh state data. Jika ada waktu tambahan, saya akan menerapkan Optimistic UI menggunakan React `useOptimistic` hook atau SWR/React Query untuk instant feedback.
2. **Export Data (PDF / CSV):** Menambahkan tombol unduh ringkasan utang-piutang dalam bentuk laporan PDF atau spreadsheet CSV.
3. **Pengingat Jatuh Tempo (Notification / WhatsApp Link):** Fitur pengiriman pesan pengingat langsung via WhatsApp API kepada pihak berutang.

---

## ⏱️ Time Spent
- **Total Waktu Pengerjaan:** ~4.5 jam (Perancangan PRD & Arsitektur: 45m, Migration & Auth: 1j, API & Validasi: 1j, UI Dashboard & Responsive Components: 1.5j, Polish & Docs: 30m).
