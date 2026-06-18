// Pembungkus server untuk rute dinamis /quran/juz/[number].
// generateStaticParams diperlukan agar bisa di-export statis (build mobile).
import JuzReader from './JuzReader';

export function generateStaticParams() {
  // Juz 1–30
  return Array.from({ length: 30 }, (_, i) => ({ number: String(i + 1) }));
}

export default function Page() {
  return <JuzReader />;
}
