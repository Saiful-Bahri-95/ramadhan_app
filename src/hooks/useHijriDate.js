'use client';

// import dayjs from 'dayjs';

// /**
//  * useHijriDate — menghitung tanggal Hijriah berdasarkan kalender Islam Umal Qura.
//  * Menggunakan offset -1 hari (kemarin) sesuai logika aplikasi.
//  *
//  * @returns {{ hijriDate: string, hijriDay: number }}
//  */
// const useHijriDate = () => {
//   const getHijriDate = () => {
//     try {
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);

//       const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//         timeZone: 'Asia/Jakarta',
//       });

//       const parts = formatter.formatToParts(yesterday);
//       const day = parts.find((p) => p.type === 'day')?.value || '';
//       const month = parts.find((p) => p.type === 'month')?.value || '';
//       const year = parts.find((p) => p.type === 'year')?.value || '';

//       const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
//       return `${day} ${monthCapitalized} ${year} H`;
//     } catch {
//       return 'Ramadhan 1447 H';
//     }
//   };

//   const hijriDate = getHijriDate();
//   const hijriDay = parseInt(hijriDate.split(' ')[0], 10);

//   return { hijriDate, hijriDay };
// };

// export default useHijriDate;

'use client';

import moment from 'moment-hijri';
import 'moment-timezone';

export default function useHijriDate() {
  const getHijriDate = () => {
    try {
      const yesterday = moment()
        .tz('Asia/Jakarta')
        .subtract(1, 'day');

      const day = yesterday.iDate();
      const monthNumber = yesterday.iMonth(); // 0–11
      const year = yesterday.iYear();

      // Mapping manual nama bulan (lebih aman & konsisten)
      const hijriMonths = [
        'MUHARRAM',
        'SAFAR',
        'RABIUL AWAL',
        'RABIUL AKHIR',
        'JUMADAL ULA',
        'JUMADAL AKHIRAH',
        'RAJAB',
        'SYABAN',
        'RAMADAN',
        'SYAWAL',
        'DZULQAIDAH',
        'DZULHIJJAH',
      ];

      const monthName = hijriMonths[monthNumber];

      return `${day} ${monthName} ${year}H`;
    } catch {
      return 'RAMADAN 1447H';
    }
  };

  const hijriDate = getHijriDate();
  const hijriDay = parseInt(hijriDate.split(' ')[0], 10);

  return { hijriDate, hijriDay };
}