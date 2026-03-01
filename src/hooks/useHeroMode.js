'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/**
 * useHeroMode — menentukan mode tampilan Hero Card berdasarkan waktu saat ini
 * relatif terhadap jadwal sholat (subuh, maghrib, isya).
 *
 * Mode yang mungkin:
 *   - 'berbuka'      → saat waktu maghrib s/d 10 menit setelah isya
 *   - 'tarawih'      → malam hari setelah isya+10 mnt s/d tengah malam
 *   - 'tahajud'      → dini hari jam 01.00–03.59
 *   - 'puasa-dimulai'→ menjelang subuh (jam 04.xx)
 *   - 'buka'         → siang hari, countdown menuju maghrib (default)
 *
 * @param {object|null} prayerTimes  - objek jadwal { Subuh, Maghrib, Isya, ... }
 * @param {dayjs.Dayjs} currentTime  - waktu sekarang (dayjs instance)
 * @returns {object|null} hero config, atau null jika prayerTimes belum tersedia
 */
const useHeroMode = (prayerTimes, currentTime) => {
  if (!prayerTimes) return null;

  const parseTime = (str) => {
    const [h, m] = str.split(':').map(Number);
    return dayjs().hour(h).minute(m).second(0).millisecond(0);
  };

  const formatDur = (diff) => {
    const d = dayjs.duration(diff > 0 ? diff : 0);
    return `${String(d.hours()).padStart(2, '0')}:${String(d.minutes()).padStart(2, '0')}:${String(d.seconds()).padStart(2, '0')}`;
  };

  const subuh = parseTime(prayerTimes.Subuh);
  const dzuhur = parseTime(prayerTimes.Dzuhur);
  const ashar = parseTime(prayerTimes.Ashar);
  const maghrib = parseTime(prayerTimes.Maghrib);
  const isya = parseTime(prayerTimes.Isya);
  const isyaStart = isya.subtract(15, 'minute');
  const tahajudStart = parseTime(prayerTimes.Firstthird);
  const tahajudEnd = parseTime(prayerTimes.Lastthird);
  const subuhPlus5 = subuh.add(5, 'minute');
  const now = currentTime;
  const nowH = now.hour();


  if (now.isAfter(maghrib) && now.isBefore(isyaStart)) {
    return {
      mode: 'berbuka',
      label: 'Waktunya Berbuka! 🎉',
      sublabel: 'Alhamdulillah, puasamu hari ini selesai',
      gradient: 'from-orange-500 via-rose-500 to-pink-600',
      shadow: '0 25px 60px -15px rgba(244,63,94,0.5)',
      accent: 'text-rose-200 drop-shadow-lg',
      countdownLabel: null,
      timeLeft: null,
      progress: null,
    };
  }

  const isLateEvening = nowH >= 19 && now.isAfter(isyaStart);
  const isMidnight = nowH === 0;
  if (isLateEvening || isMidnight) {
    return {
      mode: 'tarawih',
      label: 'Waktu Tarawih 🕌',
      sublabel: 'Semangat sholat tarawih malam ini 🤍',
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-700',
      shadow: '0 25px 60px -15px rgba(147,51,234,0.5)',
      accent: 'text-purple-200 drop-shadow-lg',
      countdownLabel: 'Waktu Tarawih',
      timeLeft: null,
      progress: {
        value: now.isBefore(isya) ? 0 :Math.min((now.diff(isya) / tahajudStart.diff(isya)) * 100, 100),
        startLabel: `Isya ${prayerTimes.Isya}`,
        endLabel: `Tahajud ${prayerTimes.Firstthird}`,
      },
    };
  }

  if (now.isAfter(tahajudStart) && now.isBefore(tahajudEnd)) {
    return {
      mode: 'tahajud',
      label: 'Waktu Tahajud 🌙',
      sublabel: 'Sepertiga malam, waktu terbaik bermunajat',
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      shadow: '0 25px 60px -15px rgba(15,23,42,0.6)',
      accent: 'text-slate-300 drop-shadow-lg',
      countdownLabel: 'Waktu Tahajud',
      timeLeft: null,
      progress: {
        value: now.isBefore(tahajudStart) ? 0 : Math.min((now.diff(tahajudStart) / tahajudEnd.diff(tahajudStart)) * 100, 100),
        startLabel: `Tahajud ${prayerTimes.Firstthird}`,
        endLabel: `Tahajud ${prayerTimes.Lastthird}`,
      },
    };
  }

  if (now.isAfter(tahajudEnd) && now.isBefore(subuhPlus5)) {
    return {
      mode: 'puasa-dimulai',
      label: 'Puasa Segera Dimulai 🌅',
      sublabel: `Subuh pukul ${subuh.format('HH:mm')} — niat puasa dulu!`,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      shadow: '0 25px 60px -15px rgba(22, 94, 249, 0.72)',
      accent: 'text-amber-100 drop-shadow-lg',
      countdownLabel: 'Puasa dimulai dalam',
      timeLeft: now.isBefore(subuh) ? formatDur(subuh.diff(now)) : null,
      progress: null,
    };
  }

  if (now.isBefore(dzuhur)) {    
    return {
      mode: 'dzuhur',
      label: 'Waktu Dzuhur 🌞',
      sublabel: `Dzuhur pukul ${dzuhur.format('HH:mm')}`,
      gradient: 'from-amber-400 via-orange-400 to-red-500',
      shadow: '0 25px 60px -15px rgba(249,115,22,0.5)',
      accent: 'text-slate-900 drop-shadow-lg',
      countdownLabel: 'Menuju Waktu Dzuhur',
      timeLeft: formatDur(dzuhur.diff(now)),
      progress: {
        value: now.isBefore(subuh) ? 0 : Math.min((now.diff(subuh) / dzuhur.diff(subuh)) * 100, 100),
        startLabel: `Subuh ${prayerTimes.Subuh}`,
        endLabel: `Dzuhur ${prayerTimes.Dzuhur}`,
      },
    };
  }

  if (now.isBefore(ashar)) {
    return {
      mode: 'ashar',
      label: 'Waktu Ashar 🌤️',
      sublabel: `Ashar pukul ${ashar.format('HH:mm')}`,
      gradient: 'from-amber-300 via-yellow-300 to-orange-400',
      shadow: '0 25px 60px -15px rgba(248, 232, 91, 0.5)',
      accent: 'text-slate-900 drop-shadow-lg',
      countdownLabel: 'Menuju Waktu Ashar',
      timeLeft: formatDur(ashar.diff(now)),
      progress: {
        value: now.isBefore(dzuhur) ? 0 : Math.min((now.diff(dzuhur) / ashar.diff(dzuhur)) * 100, 100),
        startLabel: `Dzuhur ${prayerTimes.Dzuhur}`,
        endLabel: `Ashar ${prayerTimes.Ashar}`,
      },
    };
  }

  // Default: countdown menuju berbuka (siang hari)
  const diff = maghrib.diff(now);
  const totalDur = maghrib.diff(ashar);
  const passed = now.diff(ashar);

  return {
    mode: 'buka',
    label: 'Menuju Berbuka',
    sublabel: `Maghrib pukul ${maghrib.format('HH:mm')}`,
    gradient: 'from-[#1e3a8a] via-[#312e81] to-[#4c1d95]',
    shadow: '0 25px 60px -15px rgba(79,70,229,0.5)',
    accent: 'text-indigo-200 drop-shadow-lg',
    countdownLabel: 'Menuju Berbuka',
    timeLeft: formatDur(diff),
    progress: {
      value: passed > 0 ? Math.min((passed / totalDur) * 100, 100) : 0,
      startLabel: `Ashar ${prayerTimes.Ashar}`,
      endLabel: `Maghrib ${prayerTimes.Maghrib}`,
    },
  };
};

export default useHeroMode;
