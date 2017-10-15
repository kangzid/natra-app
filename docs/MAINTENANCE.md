# NATRA Mobile - Technical Maintenance Guide

Dokumen ini adalah panduan teknis utama untuk memelihara dan mengembangkan aplikasi **NATRA Mobile**.

## 🚀 Overview
NATRA Mobile adalah aplikasi HRIS (Human Resource Information System) berbasis web-mobile. 
- **Tech Stack**: Vanilla HTML5, CSS3 (Tailwind CSS), Modern JavaScript (ES6+).
- **Native Bridge**: Capacitor 6.x.
- **Build Tool**: Vite.

---

## 🏗️ Folder Structure

```text
/
├── android/             # Proyek asli Android (Capacitor)
├── docs/                # Dokumentasi teknis & API
├── pages/               # File View (HTML)
├── src/
│   ├── core/            # Logika pusat (Auth, Theme Manager)
│   ├── features/        # Modul fitur (Controller & Service)
│   ├── styles/          # File CSS (main, components, tailwind)
│   └── utils/           # Helper UI & Formatters
├── assets/              # Aset gambar & ikon aplikasi (ikon sumber)
└── resources/           # Sumber asli aset (icon, splash)
```

---

## 🔐 Core Systems

### 1. Authentication (src/core/auth)
Menggunakan `localStorage` untuk menyimpan JWT Token.
- `Auth.js`: Manager sesi (login, logout, checkAuth).
- `auth.service.js`: Komunikasi API untuk login.

### 2. Theme Management (src/core/theme)
Mengelola Dark/Light mode secara persisten.
- `theme-manager.js`: Toggle state tema.
- `theme-init.js`: Script anti-flash yang harus ada di setiap `<head>` HTML.

---

## 🛠️ Pengembangan Fitur Baru
Setiap fitur baru harus mengikuti pola **Service-Controller**:

1. **Service (`feature.service.js`)**:
   - Berisi fungsi `async` untuk memanggil API.
   - Menggunakan `fetch` dengan header otorisasi.

2. **Controller (`feature.controller.js`)**:
   - Fungsi `init()` dipanggil saat DOM loaded.
   - `_bindEvents()` untuk menangani klik/submit.
   - Menggunakan `ui-helpers.js` untuk loading/notifikasi.

3. **View (`pages/feature.html`)**:
   - Struktur HTML semantik.
   - Impor script controller di bagian paling bawah.

---

## 📦 Build & Release

### Menjalankan Development Server
```bash
npm run dev
```

### Build Web untuk Produksi
```bash
npm run build
```

### Sync ke Native Android
```bash
npx cap sync android
```

### Menghasilkan APK Release
Lokasi file: `android/app/build/outputs/apk/release/app-release.apk`
Konfigurasi signing ada di `android/signing.properties`.

---

## 🎨 UI Guidelines (iOS Look & Feel)
- Gunakan varian `dark:` di Tailwind untuk dukungan mode malam.
- Gunakan helper `showAlert` dan `showConfirm` untuk dialog interaktif.
- Semua elemen interaktif harus memiliki class native-like (seperti `.ios-switch` atau `.ios-card`).

---

**Dibuat oleh Antigravity (Google Deepmind Team).**
*Terakhir diperbarui: 18 April 2026*
