# NATRA Mobile - Panduan Maintenance & Clean Architecture

Dokumen ini adalah standar penulisan kode untuk aplikasi NATRA Mobile. Tujuannya adalah untuk memastikan kode tetap rapi, mudah dibaca, dan mudah diperbarui di masa mendatang, terutama saat kita mulai mengimplementasikan fitur-fitur kompleks seperti HRIS (Payroll, Cuti, dll).

---

## 1. Arsitektur CSS & Styling

Kita menggunakan pendekatan **Atomic & Modular CSS** (didukung oleh Tailwind dan Custom CSS).
Hindari menambahkan gaya baru di `pages.css` jika itu bisa digunakan kembali di halaman lain.

### Struktur Folder (`src/styles/`)
*   `main.css` — Reset global, variabel warna, root styles.
*   `input.css` — Tempat integrasi Tailwind dan base layer.
*   `pages.css` — **Hanya untuk layouting spesifik halaman** (contoh: margin halaman dashboard, padding spesifik). *Jangan masukkan gaya komponen (card, button) ke sini!*
*   `components.css` — File *barrel* (pengelompokan) yang hanya berisi perintah `@import`.
*   `ui/` — Folder berisi komponen yang sudah dipecah. Jika Anda membuat Toggle atau Button jenis baru, masukkan kemari!
    *   `cards.css`
    *   `buttons.css`
    *   `forms.css`
    *   `ios-widgets.css` (Gaya khusus iOS 18+)

### Tips Menambah Fitur Baru
Jika Anda menambahkan fitur besar (misal: `payroll.html`):
1. **Dilarang** memasukkan 500 baris CSS Payroll ke `pages.css`.
2. Buat file baru: `src/features/payroll/payroll.styles.css`.
3. Panggil CSS tersebut di `payroll.html` secara langsung. Ini mencegah *styling* saling bertabrakan dengan halaman lain.

---

## 2. Shared UI Templates (UI-as-Code)

Saat membuat halaman HTML, usahakan struktur "Kosong" lalu biarkan JavaScript yang mengisinya, terutama untuk daftar/urutan.
Gunakan `src/core/ui/templates.js` untuk menyimpan kerangka HTML.

**Kenapa harus begini?**
Jika desain "Card Karyawan" berubah, Anda cukup ubah di *satu file JS*, dan otomatis semua halaman yang menampilkan Card Karyawan akan ikut berubah. Tanpa ini, Anda harus cari dan ubah manual satu-persatu di puluhan file HTML.

---

## 3. Pemisahan Controller dan Service

Kita menggunakan versi ringan dari arsitektur MVC (Model-View-Controller) / Service-Repository.

### 🔴 Larangan Keras:
*   **Service** (`tasks.service.js`): Dilarang menulis sintaks DOM (`document.getElementById`, `innerHTML`, `classList.add`). Service murni bekerja untuk koneksi API/Database, algoritma data, dan logika bisnis.
*   **Controller** (`tasks.controller.js`): Dilarang menulis logika *fetch* panjang atau memanipulasi *endpoint* API. Controller murni bekerja sebagai jembatan: Dia mengeklik tombol, memanggil fungsi Service, lalu mencetak hasilnya ke layar HTML.

---

## 4. Keamanan & Performa Native (Capacitor)

Karena ini pada akhirnya adalah aplikasi Native Android/iOS:
1.  Selalu bungkus pengecekan fitur native dengan:
    ```javascript
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        // Native Only (GPS Latar Belakang, dll)
    }
    ```
2.  Gunakan `CapacitorHttp` untuk semua Fetch ke Backend jika dirasa pengiriman di latar belakang sering diblokir (`bg-tracking-manager.js`).
3.  Gunakan **Storage Class** (`Storage.getToken()`) daripada memanggil `localStorage` secara manual agar tipe data terkontrol.

---

> [!NOTE]
> Panduan ini hidup dan akan bertambah seiring berjalannya project. Sebelum memulai perbaikan atau penambahan fitur di fitur sebelumnya, **wajib** baca standar arsitektur di atas agar selaras.
