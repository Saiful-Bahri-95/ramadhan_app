'use client';

import { Compass, ChevronRight, MapPin } from 'lucide-react';

/**
 * NearbyMosqueCard — card CTA di beranda untuk membuka pencarian
 * masjid/musholla terdekat via GPS.
 */
const NearbyMosqueCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className='relative rounded-[2rem] p-5 md:p-6 overflow-hidden text-white bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 shadow-[0_20px_45px_-15px_rgba(16,185,129,0.55)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer'
    >
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.18),transparent_60%)]' />
      <div className='absolute -bottom-16 -right-12 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none' />

      <div className='relative z-10 flex items-center gap-4'>
        <div className='w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center'>
          <Compass size={26} />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1.5 mb-1'>
            <MapPin size={12} className='text-emerald-100' />
            <p className='text-[10px] uppercase tracking-[0.2em] text-emerald-100 font-bold'>
              Lokasi Ibadah
            </p>
          </div>
          <h3 className='text-lg md:text-xl font-bold leading-tight'>
            Masjid Terdekat
          </h3>
          <p className='text-xs text-emerald-50/80 mt-0.5'>
            Temukan masjid di sekitarmu pakai GPS
          </p>
        </div>

        <ChevronRight size={22} className='shrink-0 text-white/70' />
      </div>
    </div>
  );
};

export default NearbyMosqueCard;
