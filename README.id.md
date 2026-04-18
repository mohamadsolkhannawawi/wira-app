# WIRA

WIRA adalah Decision Support System (DSS) berbasis data yang membantu UMKM memilih lokasi usaha secara lebih yakin, lebih hemat biaya riset, dan lebih terukur.

Bahasa:

- Inggris (utama): [README.md](README.md)
- Indonesia: file ini

## Identitas Proyek

| Item                    | Detail                                     |
| ----------------------- | ------------------------------------------ |
| Program                 | Coding Camp 2026 powered by DBS Foundation |
| ID Tim Capstone Project | CC26-PSU364                                |
| Tema Capstone           | Future-Ready Work and Economy              |
| Nama Proyek             | WIRA                                       |

## Mengapa WIRA

Banyak pelaku UMKM masih menentukan lokasi bisnis berdasarkan intuisi atau survei manual yang mahal dan memakan waktu. WIRA hadir untuk menutup kesenjangan tersebut dengan mengubah data geospasial terbuka menjadi rekomendasi yang praktis dan dapat dijelaskan.

WIRA memadukan:

- sinyal geospasial OpenStreetMap (OSM)
- logika clustering dan scoring
- insight naratif berbasis AI
- antarmuka web interaktif

Tujuan utamanya adalah mendemokratisasi location intelligence agar bisa diakses pelaku usaha lokal, bukan hanya perusahaan besar.

## Ringkasan Eksekutif

WIRA dirancang untuk wilayah Kota Semarang sebagai platform rekomendasi lokasi usaha end-to-end. Sistem memproses data OSM menjadi indikator potensi pasar, mengelompokkan wilayah berdasarkan pola aktivitas ekonomi, lalu menampilkan hasil dalam bentuk visual peta dan narasi yang mudah dipahami.

Nilai utama WIRA:

- menurunkan waktu dan biaya screening awal lokasi
- mendorong ekspansi berbasis bukti data
- menghadirkan rekomendasi yang transparan bagi pengguna non-teknis

## Cakupan dan Batas Proyek

### Cakupan Utama

- DSS rekomendasi lokasi usaha untuk Semarang
- Sumber data utama tunggal: OpenStreetMap
- Pipeline fitur dengan 5 variabel inti:
  - competitor count
  - competition ratio
  - poi score
  - residential density
  - transit count
- K-Means clustering untuk segmentasi wilayah
- Generasi insight naratif berbasis AI

### Batas Luar

- Tidak mencakup data transaksi finansial real-time
- Tidak mencakup integrasi proses perizinan usaha
- Tidak mencakup analitik lalu lintas berbasis sensor fisik

## Arsitektur Solusi

WIRA dibangun sebagai sistem kolaboratif multi-divisi:

- Data Science Layer: akuisisi data, feature engineering, clustering, dan scoring
- AI Layer: generasi narasi kontekstual dan komparasi antarwilayah
- Full Stack Layer: API, peta interaktif, dan platform web untuk pengguna akhir

Alur kerja tingkat tinggi:

1. Data OSM dan geospasial dikumpulkan lalu dibersihkan
2. Fitur diekstrak dan dinormalisasi
3. Wilayah dikelompokkan dan diberi skor
4. AI engine menerjemahkan metrik ke insight naratif
5. Frontend menampilkan klaster dan rekomendasi pada peta interaktif

## Tim dan Tanggung Jawab

| Learning Path | Anggota                                   | Fokus Tanggung Jawab                                               |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| AI            | CACC200D6Y0591 - Cipta Fikri Wiratama     | Insight Generator, narrative engine, komparasi wilayah             |
| Data Science  | CDCC200D6X0976 - Bintang Vandini          | Pipeline OSM, feature engineering, clustering, scoring             |
| Data Science  | CDCC200D6X1538 - Elsa Ika Rahmani         | Pipeline OSM, normalisasi, dukungan model, output JSON terstruktur |
| Full Stack    | CFCC200D6Y0422 - Mohamad Solkhan Nawawi   | API backend, integrasi frontend, peta interaktif                   |
| Full Stack    | CFCC200D6Y2777 - Bramantyo Kunni Nurrisqi | Integrasi platform, alur UI, dukungan deployment                   |

## Milestone Pengerjaan (5 Minggu)

| Minggu   | Fokus                                | Luaran Utama                                                                     |
| -------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| Minggu 1 | Data Acquisition and Discovery       | Dokumen parameter, raw data POI/fasilitas, GeoJSON kelurahan, cleaned dataset    |
| Minggu 2 | Feature Engineering and Aggregation  | Tabel agregasi, dataset densitas, tabel fitur lengkap, normalized dataset        |
| Minggu 3 | Modeling and AI Narrative Logic      | Model klaster, scoring dan ranking, confidence indicator, kontrak JSON           |
| Minggu 4 | Platform Development and Integration | Narrative engine, map interface, sistem backend terintegrasi, prototipe UI       |
| Minggu 5 | Validation, Testing, and Delivery    | Laporan validasi, optimasi performa, dokumen final, video demo, final submission |

## Rencana Tech Stack

### Bahasa dan Framework

- Python untuk pipeline Data Science dan AI
- TypeScript untuk full-stack dan keamanan kontrak data
- TensorFlow (Functional API/Subclassing) untuk komponen deep learning
- Express.js untuk RESTful API
- React + Vite untuk frontend web
- Tailwind CSS untuk styling antarmuka
- Anime.js untuk motion ringan dan feedback interaktif

### API dan Library Khusus

- Overpass API (OpenStreetMap) untuk pengumpulan data geospasial
- Generative AI API (Gemini atau OpenAI) untuk insight naratif
- Leaflet.js atau Mapbox GL JS untuk visualisasi peta interaktif
- Axios untuk networking call antara frontend dan backend
- FastAPI atau Flask untuk serving model AI terpisah (jika diperlukan)

### Data dan Penyimpanan

- Dataset OpenStreetMap (POI, jalan, fasilitas, batas administrasi)
- PostgreSQL + PostGIS untuk penyimpanan data geospasial
- Kontrak JSON terstruktur untuk integrasi DS, AI, dan full stack

### Target Deployment

- Vercel atau Netlify untuk frontend
- Streamlit Cloud untuk dashboard Data Science (side deliverable)

## Status Repository Saat Ini

Repository ini saat ini menyediakan fondasi integrasi:

- monorepo npm workspaces
- shared contracts package untuk backend dan frontend
- skeleton backend API (termasuk health dan app info endpoint)
- skeleton frontend routing dan API client

Fondasi ini disiapkan untuk mempercepat fase modeling, integrasi AI narrative, dan pengalaman keputusan berbasis peta.

## Struktur Folder

```text
wira-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # Konfigurasi environment dan aplikasi
│   │   ├── controllers/    # Handler request dan orkestrasi alur bisnis
│   │   ├── middleware/     # Rantai middleware Express
│   │   ├── repositories/   # Abstraksi akses data
│   │   ├── routes/         # Definisi route API
│   │   ├── services/       # Logika bisnis dan domain
│   │   ├── types/          # Definisi tipe backend
│   │   ├── utils/          # Utilitas backend bersama
│   │   └── app.ts          # Entry point backend
│   ├── prisma.config.ts    # Konfigurasi Prisma
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/             # Asset statis
│   ├── src/
│   │   ├── assets/         # Asset visual aplikasi
│   │   ├── components/     # Komponen UI reusable
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Halaman level route
│   │   ├── services/       # Layanan integrasi API
│   │   ├── store/          # Manajemen state client
│   │   ├── types/          # Definisi tipe frontend
│   │   ├── utils/          # Utilitas frontend
│   │   ├── App.tsx         # Shell route aplikasi
│   │   └── main.tsx        # Entry point frontend
│   ├── package.json
│   └── vite.config.ts
├── shared/
│   ├── contracts.ts        # Kontrak API bersama
│   ├── index.ts            # Export shared
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Script workspace root
├── package-lock.json
├── README.id.md
├── README.md
└── .gitignore
```

## Kebutuhan Pengembangan Lokal

Install:

- Node.js 20.x atau lebih baru (LTS direkomendasikan)
- npm 10.x atau lebih baru
- Git
- PostgreSQL 15+ (direkomendasikan)

## Instalasi dan Setup

1. Clone repository:

```powershell
git clone <url-repository-anda>
cd wira-app
```

2. Install dependency dari root project:

```powershell
npm install
```

3. Siapkan file environment:

```powershell
Copy-Item "backend/.env.example" "backend/.env"
Copy-Item "frontend/.env.example" "frontend/.env"
```

4. Sesuaikan environment variable:

- backend/.env: NODE_ENV, APP_NAME, PORT, CORS_ORIGIN, DATABASE_URL
- frontend/.env: VITE_API_BASE_URL, VITE_APP_NAME

5. Jalankan mode development:

```powershell
npm run dev
```

6. Pengecekan opsional:

```powershell
npm run typecheck
npm run build
npm run lint
npm run test
```

## Panduan Kolaborasi

### Aturan Penamaan Branch

- main untuk baseline stabil dan protected
- develop sebagai branch integrasi opsional
- feature/<scope>-<short-description>
- fix/<scope>-<short-description>
- chore/<scope>-<short-description>

### Aturan Format Commit

Format commit wajib:

- type(scope): message

Message wajib berbahasa Inggris.

Type yang direkomendasikan:

- feat
- fix
- refactor
- docs
- chore
- test
- ci
- build
- perf
- style

Contoh:

- feat(frontend): add location recommendation map card
- feat(backend): add scoring endpoint for business category
- fix(shared): align insight contract with ai payload schema
- docs(readme): add capstone milestone and risk sections

### Aturan Pull Request

- Buat PR kecil dan fokus
- Hubungkan setiap PR ke issue atau task
- Tambahkan catatan pengujian (manual atau otomatis)
- Minimal satu approval sebelum merge

## Snapshot Manajemen Risiko

Risiko utama dan mitigasi:

- data OSM tidak lengkap: validasi data dan confidence indicator per wilayah
- kualitas model bervariasi: tuning dan evaluasi iteratif
- keterlambatan integrasi antar divisi: kontrak JSON dikunci lebih awal dan type safety ketat
- performa peta interaktif: optimasi bundling dan motion UI tetap ringan
- deployment tidak stabil: uji deployment bertahap mulai Minggu 4

## Lisensi

Lisensi ISC.
