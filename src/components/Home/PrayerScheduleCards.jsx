'use client';

import { Sunrise, Sun, CloudSun, Sunset, Moon } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * PrayerScheduleCards — 5 kartu kecil jadwal sholat (Subuh, Dzuhur, Ashar,
 * Maghrib, Isya). Sholat berikutnya disorot otomatis berdasarkan waktu saat ini.
 *
 * @param {object|null} prayerTimes - objek timings dari usePrayerTimes
 *        (mis. { Subuh: "04:35", Dzuhur: "11:56", ... })
 * @param {dayjs.Dayjs} [currentTime] - waktu sekarang (opsional)
 */
const PRAYERS = [
  { key: 'Subuh', label: 'Subuh', Icon: Sunrise },
  { key: 'Dzuhur', label: 'Dzuhur', Icon: Sun },
  { key: 'Ashar', label: 'Ashar', Icon: CloudSun },
  { key: 'Maghrib', label: 'Maghrib', Icon: Sunset },
  { key: 'Isya', label: 'Isya', Icon: Moon },
];

const toMinutes = (t) => {
  if (!t || typeof t !== 'string') return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const PrayerScheduleCards = ({ prayerTimes, currentTime }) => {
  // Skeleton saat data belum siap
  if (!prayerTimes) {
    return (
      <div className='grid grid-cols-5 gap-2 md:gap-3'>
        {PRAYERS.map((p) => (
          <div
            key={p.key}
            className='h-[92px] md:h-[104px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse'
          />
        ))}
      </div>
    );
  }

  const now = currentTime || dayjs();
  const nowMin = now.hour() * 60 + now.minute();

  // Tentukan sholat berikutnya (waktu pertama yang masih di depan).
  // Jika semua sudah lewat (setelah Isya), sorot Subuh untuk besok.
  let activeKey =
    PRAYERS.find((p) => {
      const min = toMinutes(prayerTimes[p.key]);
      return min != null && min > nowMin;
    })?.key || 'Subuh';

  return (
    <div className='grid grid-cols-5 gap-2 md:gap-3'>
      {PRAYERS.map(({ key, label, Icon }) => {
        const time = prayerTimes[key] || '--:--';
        const isActive = key === activeKey;

        return (
          <div
            key={key}
            className={[
              'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-3 md:py-4 transition-all duration-300',
              isActive
                ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
            ].join(' ')}
          >
            {/* Penanda "sholat berikutnya" */}
            {isActive && (
              <span className='absolute top-1.5 right-1.5 flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-white' />
              </span>
            )}

            <div
              className={[
                'flex items-center justify-center rounded-xl p-1.5 md:p-2',
                isActive
                  ? 'bg-white/20'
                  : 'bg-blue-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400',
              ].join(' ')}
            >
              <Icon size={18} className='md:hidden' />
              <Icon size={20} className='hidden md:block' />
            </div>

            <span
              className={[
                'text-[10px] md:text-xs font-medium leading-none',
                isActive ? 'text-blue-50' : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            >
              {label}
            </span>

            <span className='text-xs md:text-sm font-bold tabular-nums leading-none'>
              {time}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PrayerScheduleCards;
