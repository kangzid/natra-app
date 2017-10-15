# Pengelolaan Aset & Ikon NATRA Mobile

Dokumen ini menjelaskan cara memperbarui logo aplikasi, splash screen, dan aset visual lainnya agar tetap konsisten di semua platform.

## 🎨 Sumber Aset Utama
Selalu gunakan file sumber berkualitas tinggi (minimal 1024x1024 px) di folder berikut:
- **Logo**: `assets/icon.png`
- **Splash**: `assets/splash.png` (disarankan rasio 1:1 di tengah kanvas besar)

---

## 📱 Memperbarui Ikon Android (Adaptive Icons)
Android 8.0+ menggunakan sistem **Foreground** dan **Background**. Untuk memperbaruinya secara otomatis:

1. Letakkan logo baru Anda di `assets/icon.png`.
2. Jalankan perintah:
   ```bash
   npx @capacitor/assets generate --android
   ```
3. Script ini akan otomatis memperbarui folder `android/app/src/main/res/mipmap-*` termasuk file `ic_launcher_foreground.png`.

---

## 🖼️ Memperbarui Splash Screen
Splash screen adalah layar yang muncul saat aplikasi sedang memuat.
1. Pastikan file `assets/splash.png` sudah benar.
2. Jalankan perintah yang sama:
   ```bash
   npx @capacitor/assets generate --android
   ```
3. Aset akan diperbarui di folder `drawable`, `drawable-night` (untuk dark mode), dan varian resolusi lainnya.

---

## ⚠️ Catatan Penting
- **Format**: Gunakan selalu `.png` tanpa transparansi untuk ikon utama Android (jika ingin background warna solid).
- **Safe Zone**: Pastikan bagian penting logo berada di tengah "Safe Zone" (radius 66% dari tengah) agar tidak terpotong oleh launcher yang memiliki bentuk berbeda (lingkaran/kotak/squircle).
- **Keystone**: Lokasi keystore pengamanan build ada di `android/app/natra-release.jks`. Jangan menghapus file ini karena diperlukan untuk update aplikasi di Play Store.

---

*Terakhir diperbarui: 18 April 2026*
