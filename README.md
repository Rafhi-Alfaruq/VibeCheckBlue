# 🚀 VibeCheck.
**Conquer your day, completely offline.**

VibeCheck adalah aplikasi produktivitas berbasis *Progressive Web App* (PWA) cerdas yang dirancang untuk membantu Anda mengatur jadwal, melacak kebiasaan, mencatat jurnal harian, dan membangunkan Anda dengan alarm video motivasi (Hype Alarm). Sepenuhnya berjalan secara lokal (Offline-First) tanpa bergantung pada koneksi internet.

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Fitur Utama

*   📅 **Smart Quests & Calendar:** Manajemen jadwal harian dengan sistem *auto-template* cerdas. Dilengkapi kalender komprehensif yang mencakup integrasi libur nasional dan event khusus.
*   🚨 **Hype Video Vault (Alarm):** Bukan alarm biasa. Unggah video motivasi atau TikTok favorit Anda secara lokal (maksimal 50MB) yang akan otomatis berputar sebagai alarm pengingat jadwal.
*   📖 **Daily Reflections (Jurnal):** Catat fokus utama, persiapkan hambatan, ukur sisa baterai energi (pagi & malam), lacak *mood*, dan abadikan memori harian dengan foto.
*   📊 **Advanced Analytics:** Pantau konsistensi dan penyelesaian tugas harian Anda melalui grafik performa 30-hari dan 12-bulan yang interaktif.
*   🖨️ **PDF Log Export:** Unduh seluruh catatan jurnal beserta lampiran foto Anda ke dalam bentuk dokumen PDF dengan satu klik.
*   ⚡ **Offline-First PWA:** Instal langsung ke *Home Screen* HP atau PC Anda. Data Anda 100% aman tersimpan secara lokal di *device* Anda sendiri.

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan teknologi web modern dan ringan tanpa framework yang rumit:

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   **Database:** IndexedDB (Penyimpanan lokal yang cepat dan kapasitas besar)
*   **Icons:** [Lucide Icons](https://lucide.dev/)
*   **Charts:** [Chart.js](https://www.chartjs.org/)
*   **PDF Generation:** [jsPDF](https://parall.ax/products/jspdf)

## 📁 Struktur Repositori

Proyek ini menerapkan *Separation of Concerns* untuk memudahkan pemeliharaan kode:

```text
📦 VibeCheck
 ┣ 📂 assets/              # Ikon PWA dan gambar default
 ┣ 📂 css/                 # File desain dan animasi utama
 ┃ ┗ 📜 style.css
 ┣ 📂 js/                  # Logika aplikasi modular
 ┃ ┣ 📜 alarm-media.js     # Mesin alarm & pengelola video vault
 ┃ ┣ 📜 calendar-events.js # Rendering kalender & notifikasi H-X
 ┃ ┣ 📜 db.js              # Inisialisasi database & variabel global
 ┃ ┣ 📜 journal.js         # Logika jurnal harian & konversi foto (Blob)
 ┃ ┣ 📜 main.js            # Trigger utama (window.onload)
 ┃ ┣ 📜 stats-export.js    # Chart.js render & Ekspor jsPDF
 ┃ ┣ 📜 tasks.js           # Sistem tugas harian & auto-template
 ┃ ┗ 📜 ui.js              # Navigasi tab & status offline
 ┣ 📜 index.html           # Kerangka UI utama
 ┣ 📜 manifest.json        # Konfigurasi instalasi PWA
 ┗ 📜 sw.js                # Service Worker untuk dukungan offline
