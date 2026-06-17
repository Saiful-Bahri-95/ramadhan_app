'use client';

import { useEffect } from 'react';

/**
 * StoragePersist — meminta "persistent storage" ke browser/OS sekali saat
 * aplikasi pertama dibuka.
 *
 * Secara default browser boleh menghapus IndexedDB (tempat data ibadah harian
 * disimpan via localforage) saat memori perangkat menipis. Dengan memanggil
 * navigator.storage.persist(), data ditandai prioritas sehingga TIDAK dihapus
 * otomatis. Setelah aplikasi di-install sebagai PWA, permintaan ini biasanya
 * langsung dikabulkan.
 *
 * Komponen ini tidak merender apa pun.
 */
export default function StoragePersist() {
  useEffect(() => {
    const requestPersistence = async () => {
      try {
        if (
          typeof navigator === 'undefined' ||
          !navigator.storage ||
          !navigator.storage.persist
        ) {
          return; // Browser tidak mendukung Storage API
        }

        // Jika sudah persistent, tidak perlu minta lagi
        const alreadyPersisted = await navigator.storage.persisted();
        if (alreadyPersisted) {
          console.log('[StoragePersist] Penyimpanan sudah persistent.');
          return;
        }

        const granted = await navigator.storage.persist();
        console.log(
          granted
            ? '[StoragePersist] Penyimpanan persistent diaktifkan — data ibadah aman.'
            : '[StoragePersist] Permintaan persistent ditolak (data tetap tersimpan, tapi bisa dihapus browser saat memori penuh).',
        );
      } catch (err) {
        console.error('[StoragePersist] Gagal meminta persistent storage:', err);
      }
    };

    requestPersistence();
  }, []);

  return null;
}
