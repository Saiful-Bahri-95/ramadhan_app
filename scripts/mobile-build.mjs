// Build statis untuk Capacitor (Android).
//
// Next.js `output: 'export'` tidak mendukung Route Handlers seperti
// /api/ramatalk (POST) & /api/schedule. Karena di aplikasi mobile kita
// memanggil API itu ke server Vercel (lihat src/lib/apiBase.js), folder
// `src/app/api` cukup disingkirkan sementara selama proses export, lalu
// dikembalikan setelah build selesai.
//
// Jalankan via: npm run build:mobile

import { existsSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const apiDir = join(root, 'src', 'app', 'api');
const apiHidden = join(root, 'src', 'app', '_api_disabled');

let moved = false;

function restore() {
  if (moved && existsSync(apiHidden)) {
    renameSync(apiHidden, apiDir);
    moved = false;
    console.log('↩  Folder src/app/api dikembalikan.');
  }
}

// Pastikan folder api selalu dikembalikan walau build gagal / proses dihentikan.
process.on('exit', restore);
process.on('SIGINT', () => {
  restore();
  process.exit(1);
});

try {
  if (existsSync(apiDir)) {
    renameSync(apiDir, apiHidden);
    moved = true;
    console.log('→  Folder src/app/api disingkirkan sementara untuk export statis.');
  }

  // URL server Vercel tempat API (/api/ramatalk, /api/schedule) berjalan.
  // Ganti jika domain produksimu berbeda, atau set lewat env saat menjalankan.
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || 'https://ramadhan-app-nine.vercel.app';

  console.log(`🏗  Menjalankan next build (MOBILE_BUILD=true, API → ${apiBase})...`);
  const result = spawnSync('npx', ['next', 'build', '--webpack'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      MOBILE_BUILD: 'true',
      NEXT_PUBLIC_API_BASE: apiBase,
    },
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    console.error('\n❌ Build mobile gagal. Lihat error di atas.');
  } else {
    console.log('\n✅ Build statis selesai → folder out/. Lanjut: npm run cap:sync');
  }
} finally {
  restore();
}
