import withPWA from 'next-pwa';

// MOBILE_BUILD=true → export statis untuk Capacitor (folder `out/`).
// Build web biasa (Vercel) TIDAK terpengaruh karena flag ini hanya aktif
// saat menjalankan `npm run build:mobile`.
const isMobile = process.env.MOBILE_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // ← ini penting jangan dihapus karena Next.js 14 sudah pakai Turbopack secara default, tapi masih dalam tahap eksperimental. Dengan menambahkan ini, kita bisa memastikan Turbopack tetap aktif walaupun ada fitur lain yang mungkin belum kompatibel.
  // Hanya untuk build mobile: hasilkan situs statis yang bisa dibungkus Capacitor.
  ...(isMobile
    ? { output: 'export', images: { unoptimized: true }, trailingSlash: true }
    : {}),
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Nonaktif saat dev, dan saat build mobile (Capacitor) — service worker tidak
  // diperlukan di dalam webview native dan bisa menimbulkan konflik.
  disable: process.env.NODE_ENV === 'development' || isMobile,
})(nextConfig);