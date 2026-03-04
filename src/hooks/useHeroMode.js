'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/**
 * useHeroMode — menentukan mode tampilan Hero Card berdasarkan waktu saat ini
 * relatif terhadap jadwal sholat (subuh, maghrib, isya).
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

  const now = currentTime;

  // 1. Parsing semua jadwal sebagai "Hari Ini" terlebih dahulu
  let subuh = parseTime(prayerTimes.Subuh);
  let terbit = parseTime(prayerTimes.Sunrise);
  let dzuhur = parseTime(prayerTimes.Dzuhur);
  let ashar = parseTime(prayerTimes.Ashar);
  let maghrib = parseTime(prayerTimes.Maghrib);
  let isya = parseTime(prayerTimes.Isya);
  let tahajudStart = parseTime(prayerTimes.Firstthird);
  let tahajudEnd = parseTime(prayerTimes.Lastthird);

  // 2. TIMELINE NORMALIZATION (Menangani jam lintas hari / tengah malam)
  // Memisahkan timeline berdasarkan jam 12 siang (dzuhur)
  const isMorning = now.isBefore(dzuhur);

  if (isMorning) {
    // A. Jika sekarang dini hari (misal jam 02.00 pagi):
    // Maghrib dan Isya yang jadi patokan adalah milik "Kemarin".
    maghrib = maghrib.subtract(1, 'day');
    isya = isya.subtract(1, 'day');
    
    // TahajudStart (Sepertiga awal) biasanya jam 22.xx, jadi itu milik kemarin
    if (tahajudStart.hour() >= 12) tahajudStart = tahajudStart.subtract(1, 'day');
    
    // TahajudEnd (Sepertiga akhir) biasanya jam 01.xx, jadi tetap milik hari ini
    if (tahajudEnd.hour() >= 12) tahajudEnd = tahajudEnd.subtract(1, 'day');
  } else {
    // B. Jika sekarang sore/malam hari (misal jam 22.00 malam):
    // Tahajud dan Subuh yang ditunggu adalah milik "Besok".
    if (tahajudStart.hour() < 12) tahajudStart = tahajudStart.add(1, 'day');
    if (tahajudEnd.hour() < 12) tahajudEnd = tahajudEnd.add(1, 'day');
    subuh = subuh.add(1, 'day');
    terbit = terbit.add(1, 'day');
  }

  // Definisikan waktu transisi setelah normalisasi
  const isyaStart = isya.subtract(15, 'minute');
  const subuhStart = subuh.subtract(10, 'minute');


  // 1. MAGHRIB - ISYA: Langit senja menuju malam
  if (now.isAfter(maghrib) && now.isBefore(isyaStart)) {
    return {
      mode: 'berbuka',
      label: 'Waktunya Berbuka! 🎉',
      sublabel: 'Alhamdulillah, puasamu hari ini selesai',
      gradient: 'from-orange-600 via-rose-700 to-indigo-900',
      shadow: '0 25px 60px -15px rgba(225, 29, 72, 0.5)',
      accent: 'text-rose-200 drop-shadow-lg',
      countdownLabel: null,
      timeLeft: null,
      progress: {
        value: Math.min((now.diff(maghrib) / isya.diff(maghrib)) * 100, 100),
        startLabel: `Maghrib ${prayerTimes.Maghrib}`,
        endLabel: `Isya ${prayerTimes.Isya}`,
      },
    };
  }
  
  // 2. ISYA - TAHAJUD: Tarawih / Malam awal
  if (now.isAfter(isyaStart) && now.isBefore(tahajudStart)) {
    return {
      mode: 'tarawih',
      label: 'Waktu Tarawih 🕌',
      sublabel: 'Semangat sholat tarawih malam ini 🤍',
      gradient: 'from-indigo-950 via-purple-900 to-slate-900',
      shadow: '0 25px 60px -15px rgba(88, 28, 135, 0.5)',
      accent: 'text-purple-200 drop-shadow-lg',
      countdownLabel: 'Masuk Waktu Tarawih',
      timeLeft: null,
      progress: {
        value: now.isBefore(isya) ? 0 : Math.min((now.diff(isya) / tahajudStart.diff(isya)) * 100, 100),
        startLabel: `Isya ${prayerTimes.Isya}`,
        endLabel: `Tahajud ${prayerTimes.Firstthird}`,
      },
    };
  }

  // 3. TAHAJUD: Pertengahan Malam
  if (now.isAfter(tahajudStart) && now.isBefore(tahajudEnd)) {
    return {
      mode: 'tahajud',
      label: 'Waktu Tahajud 🌙',
      sublabel: 'Sepertiga malam, waktu terbaik bermunajat',
      gradient: 'from-gray-900 via-slate-900 to-black',
      shadow: '0 25px 60px -15px rgba(15, 23, 42, 0.8)',
      accent: 'text-slate-300 drop-shadow-lg',
      countdownLabel: 'Masuk Waktu Tahajud',
      timeLeft: null,
      progress: {
        value: Math.min((now.diff(tahajudStart) / tahajudEnd.diff(tahajudStart)) * 100, 100),
        startLabel: `Tahajud ${prayerTimes.Firstthird}`,
        endLabel: `Tahajud ${prayerTimes.Lastthird}`,
      },
    };
  }

  // 4. SAHUR / MENUJU SUBUH
  if (now.isAfter(tahajudEnd) && now.isBefore(subuhStart)) {
    return {
      mode: 'subuh-dimulai',
      label: 'Puasa Segera Dimulai 🌅',
      sublabel: `Subuh pukul ${prayerTimes.Subuh} — niat puasa dulu!`,
      gradient: 'from-blue-950 via-indigo-900 to-slate-800',
      shadow: '0 25px 60px -15px rgba(30, 58, 138, 0.6)',
      accent: 'text-blue-200 drop-shadow-lg',
      countdownLabel: 'Memasuki Waktu Subuh',
      timeLeft: formatDur(subuh.diff(now)),
      progress: {
        value: Math.min((now.diff(tahajudEnd) / subuh.diff(tahajudEnd)) * 100, 100),
        startLabel: `Tahajud ${prayerTimes.Lastthird}`,
        endLabel: `Subuh ${prayerTimes.Subuh}`,
      },
    };
  }

  // 5. SUBUH - TERBIT
  if (now.isAfter(subuh) && now.isBefore(terbit)) {
    return {
      mode: 'puasa-dimulai',
      label: 'Puasa Dimulai',
      sublabel: 'Selamat Menunaikan Ibadah Puasa 🌙',
      gradient: 'from-indigo-700 via-purple-500 to-orange-400',
      shadow: '0 25px 60px -15px rgba(168, 85, 247, 0.6)',
      accent: 'text-orange-100 drop-shadow-lg',
      countdownLabel: 'Puasa sudah dimulai',
      timeLeft: formatDur(terbit.diff(now)),
      progress: {
        value: Math.min((now.diff(subuh) / terbit.diff(subuh)) * 100, 100),
        startLabel: `Subuh ${prayerTimes.Subuh}`,
        endLabel: `Terbit ${prayerTimes.Sunrise}`,
      },
    };
  }

  // 6. PAGI - DZUHUR
  if (now.isAfter(terbit) && now.isBefore(dzuhur)) {    
    return {
      mode: 'dzuhur',
      label: 'Waktu Dzuhur 🌞',
      sublabel: `Dzuhur pukul ${prayerTimes.Dzuhur}`,
      gradient: 'from-sky-400 via-blue-500 to-cyan-500',
      shadow: '0 25px 60px -15px rgba(14, 165, 233, 0.5)',
      accent: 'text-cyan-50 drop-shadow-lg',
      countdownLabel: 'Menuju Waktu Dzuhur',
      timeLeft: formatDur(dzuhur.diff(now)),
      progress: {
        value: Math.min((now.diff(terbit) / dzuhur.diff(terbit)) * 100, 100),
        startLabel: `Terbit ${prayerTimes.Sunrise}`,
        endLabel: `Dzuhur ${prayerTimes.Dzuhur}`,
      },
    };
  }

  // 7. DZUHUR - ASHAR
  if (now.isAfter(dzuhur) && now.isBefore(ashar)) {
    return {
      mode: 'ashar',
      label: 'Waktu Ashar 🌤️',
      sublabel: `Ashar pukul ${prayerTimes.Ashar}`,
      gradient: 'from-blue-500 via-sky-400 to-amber-300',
      shadow: '0 25px 60px -15px rgba(251, 191, 36, 0.5)',
      accent: 'text-amber-50 drop-shadow-lg',
      countdownLabel: 'Menuju Waktu Ashar',
      timeLeft: formatDur(ashar.diff(now)),
      progress: {
        value: Math.min((now.diff(dzuhur) / ashar.diff(dzuhur)) * 100, 100),
        startLabel: `Dzuhur ${prayerTimes.Dzuhur}`,
        endLabel: `Ashar ${prayerTimes.Ashar}`,
      },
    };
  }

  // 8. DEFAULT (ASHAR - MAGHRIB): Countdown Berbuka
  const diff = maghrib.diff(now);
  const totalDur = maghrib.diff(ashar);
  const passed = now.diff(ashar);

  return {
    mode: 'buka',
    label: 'Menuju Berbuka Puasa',
    sublabel: `Maghrib pukul ${prayerTimes.Maghrib}`,
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    shadow: '0 25px 60px -15px rgba(249, 115, 22, 0.6)',
    accent: 'text-amber-100 drop-shadow-lg',
    countdownLabel: 'Menuju Berbuka Puasa',
    timeLeft: formatDur(diff),
    progress: {
      value: passed > 0 ? Math.min((passed / totalDur) * 100, 100) : 0,
      startLabel: `Ashar ${prayerTimes.Ashar}`,
      endLabel: `Maghrib ${prayerTimes.Maghrib}`,
    },
  };
};

export default useHeroMode;