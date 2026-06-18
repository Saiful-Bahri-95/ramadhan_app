// Pembungkus server untuk rute dinamis /study/[day].
// generateStaticParams diperlukan agar bisa di-export statis (build mobile).
import StudyDetail from './StudyDetail';

export function generateStaticParams() {
  // Materi hari 1–30
  return Array.from({ length: 30 }, (_, i) => ({ day: String(i + 1) }));
}

export default function Page() {
  return <StudyDetail />;
}
