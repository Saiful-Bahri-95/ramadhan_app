// Pembungkus server untuk rute dinamis /quran/surah/[number].
// generateStaticParams diperlukan agar bisa di-export statis (build mobile).
import SurahReader from './SurahReader';

export function generateStaticParams() {
  // Surah 1–114
  return Array.from({ length: 114 }, (_, i) => ({ number: String(i + 1) }));
}

export default function Page() {
  return <SurahReader />;
}
