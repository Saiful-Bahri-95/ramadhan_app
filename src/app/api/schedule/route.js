import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Plugin ini wajib agar bisa membaca format tanggal DD-MM-YYYY dari API Aladhan
dayjs.extend(customParseFormat);

/**
 * GET Handler untuk mengambil jadwal sholat dari API Aladhan (Dinamis)
 * @param {Request} request
 * @returns {NextResponse} JSON jadwal
 */
export async function GET(request) {
  // Mengambil parameter query, default ke Tangerang
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Tangerang';
  const country = 'Indonesia';

  // ─── KONFIGURASI WAKTU DINAMIS ───
  const today = dayjs(); // Hari ini
  const currentYear = today.year();
  const currentMonth = today.month() + 1; // dayjs bulan diindeks dari 0, jadi perlu +1

  // Hitung bulan & tahun depan (jaga-jaga jika butuh data melewati pergantian bulan/tahun)
  const nextMonthDate = today.add(1, 'month');
  const nextMonthYear = nextMonthDate.year();
  const nextMonthNum = nextMonthDate.month() + 1;

  const daysTarget = 30; // Selalu ambil 30 hari ke depan dari hari ini

  try {
    // Ambil data bulan ini dan bulan depan secara paralel agar lebih cepat
    const [res1, res2] = await Promise.all([
      fetch(`http://api.aladhan.com/v1/calendarByCity/${currentYear}/${currentMonth}?city=${city}&country=${country}&method=11`),
      fetch(`http://api.aladhan.com/v1/calendarByCity/${nextMonthYear}/${nextMonthNum}?city=${city}&country=${country}&method=11`)
    ]);

    if (!res1.ok || !res2.ok) {
      throw new Error('Gagal mengambil data dari API Aladhan');
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    // Gabungkan data bulan ini dan bulan depan
    const rawData = [...data1.data, ...data2.data];

    // ─── FILTERING LOGIC ───
    const schedule = [];
    let count = 0;

    for (const item of rawData) {
      if (count >= daysTarget) break;

      const itemDate = dayjs(item.date.gregorian.date, 'DD-MM-YYYY');

      // Mulai masukkan data jika tanggalnya SAMA DENGAN atau SETELAH hari ini
      if (itemDate.isSame(today, 'day') || itemDate.isAfter(today, 'day')) {
        schedule.push({
          date: item.date.readable,
          isoDate: itemDate.toISOString(),
          hijri: `${item.date.hijri.day} ${item.date.hijri.month.en} ${item.date.hijri.year}`,
          timings: {
            Imsak: item.timings.Imsak.split(' ')[0],
            Subuh: item.timings.Fajr.split(' ')[0],
            Sunrise: item.timings.Sunrise.split(' ')[0],
            Dzuhur: item.timings.Dhuhr.split(' ')[0],
            Ashar: item.timings.Asr.split(' ')[0],
            Maghrib: item.timings.Maghrib.split(' ')[0],
            Isya: item.timings.Isha.split(' ')[0],
            Firstthird: item.timings.Firstthird.split(' ')[0],
            Lastthird: item.timings.Lastthird.split(' ')[0],
          },
        });
        count++;
      }
    }

    // ─── RETURN RESPONSE ───
    return NextResponse.json(
      {
        location: city,
        year: currentYear,
        month: currentMonth,
        info: 'Jadwal Sholat Harian (30 Hari ke Depan)',
        schedule,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal memuat jadwal sholat dinamis' },
      { status: 500 },
    );
  }
}