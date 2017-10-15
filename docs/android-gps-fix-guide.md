# Panduan Teknis: Troubleshooting GPS & Konektivitas Capacitor Android

Dokumen ini merangkum tantangan teknis dan solusi yang diterapkan selama pengembangan aplikasi NATRA Mobile untuk membantu proses pembelajaran.

---

## 1. Konektivitas Jaringan (Masalah "CORS")
Seringkali error di Android muncul sebagai "CORS" atau "Network Error", padahal penyebab aslinya adalah kebijakan keamanan Android.

### Masalah: Cleartext Traffic
Secara default, Android (versi 9+) melarang koneksi ke URL `http://` (tanpa S).
**Solusi:**
Di `AndroidManifest.xml`, tambahkan attribute ini pada tag `<application>`:
```xml
<application android:usesCleartextTraffic="true" ...>
```

### Masalah: Localhost vs IP
`localhost` di dalam HP merujuk pada HP itu sendiri, bukan Laptop Anda.
**Solusi:**
- Jalankan Laravel dengan `--host=0.0.0.0` agar bisa diakses dari perangkat lain.
- Gunakan IP LAN Laptop Anda (misal: `192.168.100.50`) di dalam kode aplikasi.

---

## 2. Perizinan Lokasi (Android 13/14)
Android 13 dan 14 sangat ketat soal privasi lokasi.

### Masalah: Izin Tidak Muncul
Jika izin tidak didaftarkan di Manifest, aplikasi tidak akan pernah memunculkan popup permintaan izin ke user.
**Solusi (Minimal):**
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Masalah: Syarat Android 14
Untuk Android 14, jika aplikasi mengambil lokasi di latar depan secara aktif, wajib menambahkan:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

---

## 3. Komunikasi Module (JS Bridge)
Ini adalah masalah teknis yang sempat membuat halaman Beranda/Absensi macet ("Loading" terus).

### Masalah: Bare Module Specifier
Perintah `import { Geolocation } from '@capacitor/geolocation'` hanya bekerja jika Anda menggunakan *bundler* seperti Vite atau Webpack. Pada project Vanilla JS rawan terjadi error `Failed to resolve module specifier`.

**Solusi Aman (Global Capacitor):**
Gunakan objek global yang disediakan oleh Capacitor bridge:
```javascript
// Cara paling aman yang bekerja di Browser & Native
const Geolocation = window.Capacitor.Plugins.Geolocation;
```

---

## 4. Strategi Pengambilan GPS
Agar GPS akurat dan tidak "nyangkut", gunakan strategi berikut:

1. **High Accuracy:** Selalu set `enableHighAccuracy: true` untuk mendapatkan sinyal satelit murni.
2. **Timeout:** Berikan waktu tunggu yang cukup (misal 20 detik) karena sensor hardware butuh waktu untuk "mencari" satelit.
3. **MaximumAge:** Set `maximumAge: 0` agar sistem tidak memberikan koordinat lama yang sudah kadaluarsa.
4. **Error Handling:** Selalu tangkap error sistem (e.g. *Timeout*, *Location Disabled*) dan tampilkan pesan yang detil ke user untuk memudahkan diagnosa.

---

## 💡 Tips Pengembangan Selanjutnya:
- **Chrome Inspect:** Selalu gunakan `chrome://inspect/#devices` lewat kabel data untuk melihat error asli yang terjadi di dalam HP.
- **Capacitor Sync:** Setiap kali mengubah file di folder `src`, jangan lupa jalankan `npx cap sync` agar perubahan tersebut masuk ke dalam folder Android.

Semoga bermanfaat untuk pengembangan aplikasi selanjutnya! 🚀
