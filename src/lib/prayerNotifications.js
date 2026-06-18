// Penjadwalan notifikasi lokal pengingat waktu sholat (khusus aplikasi native
// Android/iOS via Capacitor). Di web, semua fungsi ini menjadi no-op agar tidak
// mengganggu PWA.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Sholat yang diberi pengingat + id notifikasi tetap (agar bisa dijadwal ulang).
const PRAYERS = [
  { key: 'Subuh', id: 1001 },
  { key: 'Dzuhur', id: 1002 },
  { key: 'Ashar', id: 1003 },
  { key: 'Maghrib', id: 1004 },
  { key: 'Isya', id: 1005 },
];

const isNative = () =>
  typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

/** Minta izin notifikasi. Mengembalikan true bila diizinkan. */
export async function ensureNotificationPermission() {
  if (!isNative()) return false;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch (e) {
    console.error('Gagal meminta izin notifikasi:', e);
    return false;
  }
}

/**
 * Menjadwalkan notifikasi harian berulang untuk tiap waktu sholat.
 * @param {object} prayerTimes - mis. { Subuh:"04:35", Dzuhur:"11:56", ... }
 */
export async function schedulePrayerNotifications(prayerTimes) {
  if (!isNative() || !prayerTimes) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  try {
    // Hapus jadwal lama agar tidak menumpuk saat jadwal diperbarui.
    await LocalNotifications.cancel({
      notifications: PRAYERS.map((p) => ({ id: p.id })),
    });

    const toSchedule = [];
    for (const { key, id } of PRAYERS) {
      const time = prayerTimes[key];
      if (!time || typeof time !== 'string') continue;
      const [h, m] = time.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;

      toSchedule.push({
        id,
        title: `Waktu ${key}`,
        body: `Saatnya menunaikan sholat ${key}. Semoga Allah menerima ibadahmu 🤍`,
        // schedule.on dengan jam & menit → berulang setiap hari pada waktu itu.
        schedule: { on: { hour: h, minute: m }, allowWhileIdle: true },
        smallIcon: 'ic_launcher',
        channelId: 'prayer-reminders',
      });
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }
  } catch (e) {
    console.error('Gagal menjadwalkan notifikasi sholat:', e);
  }
}

/** Membatalkan semua pengingat sholat. */
export async function cancelPrayerNotifications() {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({
      notifications: PRAYERS.map((p) => ({ id: p.id })),
    });
  } catch (e) {
    console.error('Gagal membatalkan notifikasi sholat:', e);
  }
}
