// Penentu base URL untuk panggilan ke API internal (/api/*).
//
// - Build WEB (Vercel): NEXT_PUBLIC_API_BASE kosong → memakai path relatif
//   ("/api/...") yang dilayani oleh Next.js itu sendiri.
// - Build MOBILE (Capacitor, statis): aplikasi tidak punya backend, jadi
//   NEXT_PUBLIC_API_BASE diisi URL server Vercel saat build (lihat
//   scripts/mobile-build.mjs) sehingga panggilan diarahkan ke sana.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

/**
 * Bentuk URL API yang benar untuk lingkungan saat ini.
 * @param {string} path - contoh: "/api/schedule?city=Jakarta"
 */
export const apiUrl = (path) => `${API_BASE}${path}`;
