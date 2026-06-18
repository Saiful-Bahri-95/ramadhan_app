'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  LocateFixed,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import useNearbyMosques from '@/hooks/useNearbyMosques';

// Format jarak meter → "320 m" / "1.4 km"
function fmtDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export default function NearbyMosqueDrawer({ isOpen, onClose }) {
  const { status, mosques, coords, errorMsg, findNearby } = useNearbyMosques();

  const poorAccuracy = coords?.accuracy && coords.accuracy > 500;

  // Mulai cari otomatis saat drawer dibuka pertama kali (jika belum ada hasil)
  useEffect(() => {
    if (isOpen && status === 'idle') {
      findNearby();
    }
  }, [isOpen, status, findNearby]);

  const isBusy = status === 'locating' || status === 'loading';

  const openInMaps = (m) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50'
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed bottom-0 left-0 right-0 max-w-[100%] mx-auto h-[75vh] bg-[#F6F9FC] dark:bg-slate-950 rounded-t-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col transition-colors duration-300'
          >
            {/* Header */}
            <div className='bg-white dark:bg-slate-900 px-6 py-4 rounded-t-[2.5rem] border-b border-slate-100 dark:border-slate-800 shrink-0 relative z-10'>
              <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6' />
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 className='text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight'>
                      Masjid Terdekat
                    </h2>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                      Berdasarkan lokasi GPS-mu
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto px-6 py-5 custom-scrollbar pb-10'>
              {/* Loading */}
              {isBusy && (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <div className='w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4'>
                    <LocateFixed size={26} className='animate-pulse' />
                  </div>
                  <p className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                    {status === 'locating'
                      ? 'Mendeteksi lokasimu...'
                      : 'Mencari masjid terdekat...'}
                  </p>
                  <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>
                    Mohon izinkan akses lokasi ya 🙏
                  </p>
                </div>
              )}

              {/* Error / Denied / Empty */}
              {(status === 'denied' ||
                status === 'error' ||
                status === 'empty') && (
                <div className='flex flex-col items-center justify-center py-14 text-center'>
                  <div className='w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center mb-4'>
                    <AlertTriangle size={26} />
                  </div>
                  <p className='text-sm font-bold text-slate-700 dark:text-slate-200 mb-1'>
                    {status === 'empty'
                      ? 'Tidak ada masjid ditemukan'
                      : 'Tidak bisa menampilkan lokasi'}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5'>
                    {status === 'empty'
                      ? 'Tidak ada masjid/musholla terdaftar dalam radius 10 km dari lokasimu.'
                      : errorMsg}
                  </p>
                  <button
                    onClick={findNearby}
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors'
                  >
                    <RefreshCw size={16} />
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Success list */}
              {status === 'success' && (
                <>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
                      {mosques.length} masjid terdekat
                    </p>
                    <button
                      onClick={findNearby}
                      className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      <RefreshCw size={13} />
                      Perbarui
                    </button>
                  </div>

                  {/* Info akurasi lokasi */}
                  {coords?.accuracy != null && (
                    <div
                      className={`mb-4 text-[11px] rounded-xl px-3 py-2 border ${
                        poorAccuracy
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {poorAccuracy ? (
                        <>
                          Akurasi lokasi rendah (±{Math.round(coords.accuracy)} m),
                          jadi jarak bisa kurang tepat. Untuk hasil lebih akurat:
                          aktifkan GPS presisi tinggi, dekati jendela/ruang
                          terbuka, lalu tekan <strong>Perbarui</strong>.
                        </>
                      ) : (
                        <>Akurasi lokasi ±{Math.round(coords.accuracy)} m.</>
                      )}
                    </div>
                  )}

                  <div className='space-y-2.5'>
                    {mosques.map((m, i) => (
                      <div
                        key={m.id}
                        className='bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-all'
                      >
                        <div className='w-11 h-11 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm'>
                          {i + 1}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-slate-800 dark:text-slate-100 truncate'>
                            {m.name}
                          </p>
                          <p className='text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5'>
                            <MapPin size={12} />
                            {fmtDistance(m.distance)} dari lokasimu
                          </p>
                        </div>
                        <button
                          onClick={() => openInMaps(m)}
                          className='shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors'
                        >
                          <Navigation size={14} />
                          Rute
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className='text-[10px] text-slate-400 dark:text-slate-600 text-center mt-6'>
                    Data lokasi dari OpenStreetMap. Jarak dihitung garis lurus.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
