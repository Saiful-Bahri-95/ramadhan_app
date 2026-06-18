# Panduan Build Android (Capacitor) — Sahabat Ibadah

Dokumen ini menjelaskan cara mengubah aplikasi web (PWA) ini menjadi aplikasi
Android via **Capacitor**, dengan konten **di-bundle offline** dan fitur
**notifikasi pengingat sholat**.

> Catatan: build native (Gradle/Android) **harus** dijalankan di komputpermu
> dengan Android Studio terpasang. Langkah-langkah di bawah dijalankan di folder
> proyek.

---

## 0. Prasyarat (sekali saja)

- **Node.js** 18+ (sudah ada, dipakai untuk web).
- **Android Studio** (termasuk Android SDK & emulator). Unduh dari
  https://developer.android.com/studio
- **JDK 17** (biasanya sudah dibundel Android Studio).
- Akun **Google Play Developer** (biaya sekali $25) — hanya untuk rilis ke Store.

---

## 1. Install dependency

```bash
npm install
```

Ini akan memasang Capacitor (`@capacitor/core`, `@capacitor/android`,
`@capacitor/cli`) dan plugin notifikasi (`@capacitor/local-notifications`) yang
sudah ditambahkan ke `package.json`.

---

## 2. Rute dinamis untuk export statis — *Tahap 2 (SUDAH DITERAPKAN ✅)*

Export statis (`output: 'export'`) mewajibkan setiap rute dinamis punya daftar
parameter via `generateStaticParams`. Keempat rute dinamis berikut sudah dipecah
menjadi **pembungkus server `page.js`** (berisi `generateStaticParams`) **+
komponen client** (kode lama, kini di file `*Reader.jsx` / `*Detail.jsx` /
`WriteJournal.jsx`):

- `src/app/quran/juz/[number]` → `JuzReader.jsx` (juz 1–30)
- `src/app/quran/surah/[number]` → `SurahReader.jsx` (surah 1–114)
- `src/app/study/[day]` → `StudyDetail.jsx` (hari 1–30)
- `src/app/jurnal/write/[type]` → `WriteJournal.jsx` (tipe dari `journalPrompts`)

Tidak ada perubahan perilaku di web; pembungkus hanya merender komponen client
yang sama. Lanjut ke langkah 3.

---

## 3. Build web menjadi statis (folder `out/`)

```bash
npm run build:mobile
```

Script `scripts/mobile-build.mjs` otomatis:

1. menyingkirkan sementara folder `src/app/api` (Route Handlers tidak didukung
   export statis — di mobile, API dipanggil ke server Vercel),
2. menjalankan `next build` dengan `MOBILE_BUILD=true` dan
   `NEXT_PUBLIC_API_BASE` menunjuk ke server produksimu,
3. mengembalikan folder `api` setelah selesai.

> **Ganti URL API bila domainmu berbeda.** Default-nya
> `https://ramadhan-app-nine.vercel.app` (lihat `scripts/mobile-build.mjs`).
> Atau set saat menjalankan:
> `NEXT_PUBLIC_API_BASE=https://domainmu.vercel.app npm run build:mobile`

Hasilnya ada di folder `out/`.

---

## 4. Tambahkan platform Android (sekali saja)

```bash
npx cap add android
```

Capacitor membaca `capacitor.config.json` (appId `com.sahabatibadah.app`,
appName "Sahabat Ibadah", webDir `out`) dan membuat folder `android/`.

---

## 5. Sinkron & buka di Android Studio

```bash
npm run cap:sync     # salin out/ + plugin ke proyek Android
npm run cap:open     # buka Android Studio
```

Atau sekaligus: `npm run android` (build + sync + open).

Di Android Studio, pilih emulator/perangkat lalu tekan **Run** ▶.

Setiap kali kode web berubah, ulangi: `npm run build:mobile && npm run cap:sync`.

---

## 6. Notifikasi pengingat sholat

- Sudah terpasang lewat `@capacitor/local-notifications` dan dijadwalkan otomatis
  dari jadwal sholat (lihat `src/lib/prayerNotifications.js`). Di web ia no-op;
  di Android ia menjadwalkan notifikasi harian berulang untuk Subuh–Isya.
- **Android 13+** butuh izin `POST_NOTIFICATIONS`. Plugin akan memintanya saat
  pertama dijadwalkan. Pastikan permission ini ada di
  `android/app/src/main/AndroidManifest.xml` (Capacitor menambahkannya otomatis;
  cek bila perlu).
- Uji: buka aplikasi, biarkan jadwal sholat termuat, lalu cek notifikasi
  terjadwal muncul pada waktunya.

---

## 7. Rilis ke Google Play Store

1. Di Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**.
2. Buat **keystore** (simpan baik-baik — dibutuhkan untuk semua update berikutnya).
3. Daftar/masuk **Google Play Console**, buat aplikasi baru, unggah `.aab`.
4. Lengkapi: ikon, screenshot, deskripsi, **kebijakan privasi** (wajib — aplikasi
   memakai lokasi GPS), penilaian konten, dan kuesioner data.
5. Kirim untuk review.

---

## ⚠️ Penting sebelum rilis publik

Endpoint `/api/ramatalk` saat ini **terbuka tanpa rate limiting/autentikasi**.
Saat aplikasi tersebar luas di Play Store, siapa pun bisa memanggilnya dan
menghabiskan kuota/biaya Groq-mu. Tambahkan rate limiting + batas panjang input
sebelum publikasi.
