import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // ← ini penting jangan dihapus karena Next.js 14 sudah pakai Turbopack secara default, tapi masih dalam tahap eksperimental. Dengan menambahkan ini, kita bisa memastikan Turbopack tetap aktif walaupun ada fitur lain yang mungkin belum kompatibel.
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // supaya tidak aktif saat dev
})(nextConfig);