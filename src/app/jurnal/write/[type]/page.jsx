// Pembungkus server untuk rute dinamis /jurnal/write/[type].
// generateStaticParams diperlukan agar bisa di-export statis (build mobile).
import { journalPrompts } from '@/data/journalPrompts';
import WriteJournal from './WriteJournal';

export function generateStaticParams() {
  // Semua tipe jurnal yang tersedia (daily, syukur, ikhlaskan, dst.)
  return Object.keys(journalPrompts).map((type) => ({ type }));
}

export default function Page() {
  return <WriteJournal />;
}
