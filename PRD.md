# Product Requirements Document (PRD) - Kasbon App

**Versi:** 1.0  
**Tanggal:** 7 Agustus 2026  
**Status:** Approved / Draft Implementation  
**Project:** Kasbon - Personal Debt & Receivable Tracker  
**Target Platform:** Web (Desktop & Mobile Responsive)  

---

## 1. Executive Summary & Objective

**Kasbon** adalah aplikasi web pencatatan utang-piutang pribadi (*personal debt and receivable tracker*) yang dirancang untuk membantu pengguna mengelola transaksi keuangan informal dengan teman, keluarga, maupun kolega. Aplikasi ini memungkinkan pengguna untuk mencatat siapa yang berutang ("Saya Dihutang"), siapa yang diutangi ("Saya Hutang"), memantau total saldo (*net position*), menandai pelunasan, serta menganalisis riwayat transaksi secara *real-time*.

### Tujuan Utama
1. **Kemudahan Pencatatan:** Pengguna dapat menambahkan atau mengedit catatan utang/piutang kurang dari 10 detik.
2. **Keamanan & Privasi Data:** Data transaksi diisolasi sepenuhnya per pengguna menggunakan Supabase Row Level Security (RLS).
3. **Pengalaman Pengguna (UX) Premium:** Responsif (Mobile-first), tampilan bersih, dukungan visualisasi chart, serta format angka & tanggal sesuai konteks lokal Indonesia.

---

## 2. Target User & Persona

| Attribute | Detail |
|---|---|
| **User Profile** | Individu yang sering melakukan pinjam-meminjam uang informal (kolega kantor, teman patungan makan, keluarga). |
| **Main Need** | Mengingat siapa yang belum bayar, berapa sisa utang/piutang pribadi, dan riwayat pembayaran tanpa kerumitan spreadsheet. |
| **Tech Literacy** | Menengah hingga tinggi, terbiasa memakai aplikasi mobile/web modern. |

---

## 3. Technology Stack & Constraints

### 3.1 Core Stack
* **Framework:** Next.js 16 (App Router) + TypeScript (`strict` mode, tidak boleh ada `any`).
* **Styling:** Tailwind CSS v4.
* **Database & Auth:** Supabase (PostgreSQL + Auth + `@supabase/ssr`).
* **Icons:** Lucide React.
* **Utility Libraries:** `date-fns` (untuk format tanggal relatif Bahasa Indonesia), `recharts` / custom SVG (untuk diagram perbandingan), `zod` (untuk validasi skema input).

### 3.2 Key Constraints
1. **Bahasa UI:** Bahasa Indonesia casual ("Saya dihutang", "Saya hutang", "Tandai Lunas", "Kemarin", "3 hari lalu").
2. **Format Mata Uang:** Wajib format Rupiah Indonesia sesuai locale `id-ID` (contoh: `Rp 1.234.000`, bukan `Rp 1234000` atau `IDR 1,234,000`).
3. **Format Tanggal:** Format waktu relatif (e.g., *"Hari ini"*, *"Kemarin"*, *"3 hari lalu"*).
4. **Isolasi Data Strict:** RLS Supabase wajib aktif untuk `SELECT`, `INSERT`, `UPDATE`, `DELETE`. Mencegah kebocoran data antar user via REST API Supabase.
5. **No Hardcoded Data:** Semua transaksi bersumber langsung dari Supabase Database.

---

## 4. Feature Specifications

### Module 1: Authentication & Session Management
* **Feature:** Signup & Login menggunakan Email + Password.
* **Provider:** Supabase Auth (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`).
* **Session Persistence:** Server-Side Authentication via Next.js Middleware & `@supabase/ssr` cookies.
* **Access Control:** All application routes (`/dashboard`, `/api/debts`, etc.) dilindungi oleh middleware auth. Unauthenticated user di-redirect ke `/login`.

### Module 2: Dashboard & Analytics
* **Header & Summary Cards (3 Cards):**
  1. **Total Dihutang ke Saya (Owed to Me):** Formatted Rp X (Hijau/Neutral).
  2. **Total Saya Hutang (I Owe):** Formatted Rp Y (Merah/Neutral).
  3. **Net Position (Selisih X - Y):** 
     - Jika positif ($X > Y$), angka berwarna **Hijau** (e.g. `+Rp 500.000` surplus).
     - Jika negatif ($X < Y$), angka berwarna **Merah** (e.g. `-Rp 200.000` defisit).
* **Visualisasi Chart (Bonus/Value Add):**
  - Bar chart / Comparison Card perbandingan visual antara total dihutang vs hutang.
* **Quick Stats / Aggregation:**
  - Grouping per nama orang (e.g., "Budi: 3 transaksi, total Rp 450.000").

### Module 3: Debt Management & List
* **Tabel / List Transaksi:**
  - **Nama Orang:** Text nama kolega/teman.
  - **Tipe Transaksi:** Badge indikator ("Dihutang ke saya" vs "Saya hutang").
  - **Jumlah:** In Rupiah (e.g. `Rp 1.234.000`). Stored as `bigint` (Rupiah utuh, bukan desimal).
  - **Tanggal Relatif:** Computed relative date (e.g., "2 hari lalu").
  - **Status:** Badge Status (`Belum Lunas` / `Lunas`).
  - **Aksi:** 
    - `Tandai Lunas` / `Batal Lunas` (Toggle status idempotently via PATCH API).
    - `Edit` (Membuka modal edit).
    - `Hapus` (Konfirmasi hapus via modal/popover, kemudian DELETE API).
* **Filtering & Sorting & Search:**
  - **Filter Status:** Dropdown `Semua` | `Belum Lunas` | `Lunas`.
  - **Filter Tipe:** Dropdown `Semua` | `Dihutang ke Saya` | `Saya Hutang`.
  - **Search Bar:** Input pencarian real-time berdasarkan nama orang.
  - **Sorting:** Urutkan berdasarkan Tanggal (Terbaru/Terlama) atau Jumlah (Terbesar/Terkecil).

### Module 4: Form Modal (Catat Baru / Edit)
* **Fields:**
  1. **Tipe (Radio Toggle):** `Saya dihutang` (`owed_to_me`) | `Saya hutang` (`i_owe`).
  2. **Nama Orang (Text Input):** Required, max 100 karakter.
  3. **Jumlah (Number Input):** Required, Rupiah utuh (positif > 0).
  4. **Tanggal (Date Picker):** Default hari ini (`YYYY-MM-DD`).
  5. **Catatan / Note (Textarea):** Optional, max 200 karakter.
* **Validation:** Validasi ganda pada Client Side (Zod / React Hook Form) dan Server Side (Next.js Route Handlers).

---

## 5. API Architecture & REST Contracts

Semua API response menggunakan format standar dengan Bahasa Indonesia untuk pesan error.

| Method | Endpoint | Fungsi | Query Params / Payload |
|---|---|---|---|
| `GET` | `/api/debts` | Mengambil daftar utang user | `?status=all\|unsettled\|settled&type=all\|owed_to_me\|i_owe&search=&sort=` |
| `POST` | `/api/debts` | Menambah transaksi baru | Body: `{ type, counterpart_name, amount, due_date, note }` |
| `PATCH` | `/api/debts/[id]` | Mengedit / Tandai lunas | Body: Partial update / `{ settled_at }` |
| `DELETE` | `/api/debts/[id]` | Menghapus transaksi | Path param: `id` |

---

## 6. Database Schema & RLS Security

### Data Model: `debts`

```sql
CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

CREATE TABLE public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type debt_type NOT NULL,
    counterpart_name TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    note TEXT,
    due_date DATE DEFAULT CURRENT_DATE,
    settled_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Row Level Security (RLS) Policies

```sql
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat melihat utang milik sendiri" 
ON public.debts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "User dapat menambah utang untuk diri sendiri" 
ON public.debts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User dapat mengupdate utang milik sendiri" 
ON public.debts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "User dapat menghapus utang milik sendiri" 
ON public.debts FOR DELETE 
USING (auth.uid() = user_id);
```

---

## 7. Non-Functional & UI/UX Requirements

1. **Aesthetics & Design System:**
   - Dark/Light mode support dengan visual modern (card shadows, soft gradients, status badges).
   - Glassmorphism & Micro-animations halus pada tombol & modal transitions.
   - Mobile responsive (Mobile-first grid & stack layouts).
2. **State Management & UI States:**
   - State Handling: Loading Skeletons saat memuat data, Empty State visual yang menarik jika tidak ada transaksi, dan Toast Notifications untuk aksi (sukses/gagal).
3. **Performance:**
   - Fast Server Component rendering & client-side optimistic UI updates.

---

## 8. Definition of Done (Submission Criteria)

- [ ] Project Next.js 16 terkonfigurasi dengan Supabase & Tailwind v4.
- [ ] Migration SQL dengan RLS policies yang aman tersimpan di `supabase/migrations/`.
- [ ] Fitur Auth (Login, Signup, Logout, Middleware Guard) berfungsi 100%.
- [ ] Dashboard & Summary calculation presisi tanpa error desimal/locale.
- [ ] CRUD API Endpoints & Form modal tervalidasi client & server.
- [ ] Fitur bonus (Search, Sorting, Grouping, Chart, Responsive UX) terimplementasi.
- [ ] Multi-commit Git history (> 5 commits bermakna).
- [ ] README komprehensif (Setup, Link Vercel Demo, Technical Approach, Trade-offs, Time Spent).
- [ ] Loom Video Recording (Max 3 menit).
