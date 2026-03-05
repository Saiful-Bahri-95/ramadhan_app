'use client';

import { useState, useEffect } from 'react';
import { WiDayCloudy } from 'react-icons/wi';
import { MdSunny } from 'react-icons/md';
import { FaCloudMoon } from "react-icons/fa";
import { TbSunset2 } from "react-icons/tb";
import { LuCalendarDays } from "react-icons/lu";

/**
 * HeroCard — kartu hero utama yang menampilkan countdown berbuka,
 * mode berbuka, tarawih, tahajud, dll.
 * Menerima objek `hero` dari hook useHeroMode.
 */
const HeroCard = ({ hero, userCity, onOpenSchedule }) => {
  const [showLabel, setShowLabel] = useState(true);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLabel((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generatedStars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 2}s`,
      duration: `${Math.random() * 2 + 1.5}s`,
    }));
    setStars(generatedStars);
  }, []);

  if (!hero) {
    return (
      <div className='min-h-[300px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse' />
    );
  }

  let BackgroundIcon = FaCloudMoon;
  const isNightTime = ['tahajud', 'tarawih', 'subuh-dimulai'].includes(hero.mode);

  switch (hero.mode) {
    case 'puasa-dimulai':
    case 'dzuhur':
      BackgroundIcon = MdSunny;
      break;
    case 'ashar':
      BackgroundIcon = WiDayCloudy;
      break;
    case 'buka':
      BackgroundIcon = TbSunset2;
      break;
    default:
      BackgroundIcon = FaCloudMoon;
  }

  return (
    <div
      className={`relative flex flex-col min-h-[300px] md:min-h-[320px] lg:min-h-[340px] rounded-[2.5rem] p-7 md:p-9 lg:p-10 text-white overflow-hidden group bg-gradient-to-br ${hero.gradient} transition-all duration-500 hover:-translate-y-1`}
      style={{ boxShadow: hero.shadow }}
    >
      {/* Overlay & glow effects (Layer Dasar) */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none z-0' />
      <div className='absolute -top-20 -right-20 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none z-0' />
      <div className='absolute -bottom-24 -left-24 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none z-0' />

      {/* Efek Bintang Berkedip (Khusus Malam Hari) - Layer 1 */}
      {isNightTime && (
        <div className='absolute inset-0 pointer-events-none z-[1]'>
          {stars.map((star) => (
            <div
              key={star.id}
              className='absolute bg-white rounded-full animate-pulse opacity-80'
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* Dekoratif Background Icon - Layer 2 (Di atas bintang) */}
      <BackgroundIcon
        size={214}
        className={`
          absolute pointer-events-none z-[2] transition-all duration-[4000ms] ease-in-out
          ${
            hero.mode === 'dzuhur'
              ? 'top-1 left-1 animate-spin [animation-duration:20s] scale-80 opacity-90 text-amber-400'
              : hero.mode === 'ashar'
              ? 'top-1/2 -translate-y-1/2 -right-12 scale-90 opacity-90 text-slate-900/10'
              : hero.mode === 'tahajud' || hero.mode === 'tarawih'
              ? 'top-1 left-1 text-white/20 scale-80'
              : hero.mode === 'subuh-dimulai'
              ? 'top-1/2 -translate-y-1/2 -right-14 text-white/20 scale-80'
              : hero.mode === 'puasa-dimulai'
              ? 'absolute top-29 -right-12 animate-spin [animation-duration:20s] scale-70 opacity-90 text-slate-900/30'
              : '-bottom-14 -right-14 text-white/20 scale-80'
          }
        `}
      />

      {/* --- KONTEN UTAMA (Layer Paling Atas: z-10) --- */}

      {/* Top bar: kota & tombol jadwal */}
      <div className='relative z-10 flex justify-between items-center w-full'>
        <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10'>
          <span
            className={`text-[10px] md:text-xs lg:text-xs uppercase tracking-widest font-bold ${hero.accent}`}
          >
            {userCity}
          </span>
        </div>
        <button
          onClick={onOpenSchedule}
          className='p-2.5 hover:bg-white/20 rounded-full border border-white/20 transition-colors backdrop-blur-md'
        >
          <LuCalendarDays
            size={18}
            className={`${hero.accent} cursor-pointer md:w-5 md:h-5`}
          />
        </button>
      </div>

      {/* Konten tengah: label & countdown */}
      <div className='relative z-10 flex-1 flex flex-col justify-center text-center mt-4 md:mt-6'>
        <p
          className={`text-[10px] md:text-xs lg:text-xs uppercase font-bold tracking-[0.3em] ${hero.accent} mb-2`}
        >
          {hero.countdownLabel || hero.label}
        </p>

        {hero.timeLeft ? (
          <>
            <h2 className={`text-[4rem] md:text-[4.5rem] lg:text-[5.5rem] font-black tracking-[-0.05em] tabular-nums ${hero.accent} drop-shadow-xl leading-none -mt-1 md:-mt-2`}>
              {hero.timeLeft}
            </h2>
            
            {/* PERBAIKAN: Menggunakan Grid, Scale GPU Acceleration, dan menghapus invisible */}
            <div className="grid mt-2 md:mt-3 items-center justify-center w-full">
               <p
                className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out text-sm md:text-base lg:text-base font-medium ${hero.accent} ${
                  showLabel 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                }`}
              >
                {hero.label}
              </p>
              <p
                className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out text-sm md:text-base lg:text-base font-medium ${hero.accent} ${
                  !showLabel 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                }`}
              >
                {hero.sublabel}
              </p>
            </div>
          </>
        ) : (
          /* PERBAIKAN UNTUK TEKS BESAR SAAT BERBUKA/TIDAK ADA TIMER */
          <div className="grid mt-0 md:mt-1 items-center justify-center w-full min-h-[6rem]">
            <h2
              className={`col-start-1 row-start-1 w-full transition-all duration-700 ease-in-out text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-black bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-xl leading-tight ${
                showLabel 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
              }`}
            >
              {hero.label}
            </h2>
            <h2
              className={`col-start-1 row-start-1 w-full px-4 transition-all duration-700 ease-in-out text-[1.25rem] md:text-[1.75rem] lg:text-[2rem] font-bold text-white drop-shadow-lg leading-tight ${
                !showLabel 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
              }`}
            >
              {hero.sublabel}
            </h2>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {hero.progress && (
        <div className='relative z-10 w-full max-w-2xl mx-auto mt-auto pt-6'>
          <div
            className={`flex justify-between text-[9px] md:text-[10px] lg:text-[10px] uppercase tracking-widest ${hero.accent} opacity-100 mb-2`}
          >
            <span>{hero.progress.startLabel}</span>
            <span>{hero.progress.endLabel}</span>
          </div>
          <div className='relative h-3 lg:h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm'>
            <div
              className='h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 ease-out'
              style={{ width: `${hero.progress.value}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCard;