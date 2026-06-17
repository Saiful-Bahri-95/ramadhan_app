'use client';

import { Sparkles, ArrowRight, Scale, Heart, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * RamaTalkCard — CTA card menuju fitur AI chat RamaTalk.
 * Menampilkan contoh pertanyaan (chip) yang langsung mengisi mode + pertanyaan
 * di halaman /ramatalk agar pengguna terdorong untuk bertanya.
 */

const SAMPLE_QUESTIONS = [
  {
    label: 'Hukum qadha puasa?',
    mode: 'fiqih',
    q: 'Bagaimana hukum dan cara mengqadha puasa yang tertinggal?',
    icon: Scale,
  },
  {
    label: 'Doa biar hati tenang',
    mode: 'doa',
    q: 'Doa agar hati tenang dan tidak mudah gelisah',
    icon: Heart,
  },
  {
    label: 'Makna Surah Al-Ikhlas',
    mode: 'surah',
    q: 'Jelaskan makna dan kandungan Surah Al-Ikhlas',
    icon: BookOpen,
  },
];

const RamaTalkCard = () => {
  const router = useRouter();

  const goTo = (path) => router.push(path);

  const askSample = (e, item) => {
    e.stopPropagation();
    goTo(`/ramatalk?mode=${item.mode}&q=${encodeURIComponent(item.q)}`);
  };

  return (
    <div
      onClick={() => goTo('/ramatalk')}
      className='relative rounded-[2rem] p-6 md:p-7 lg:p-7 overflow-hidden text-white bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 hover:-translate-y-1 group cursor-pointer h-full flex flex-col'
    >
      {/* Dekorasi cahaya */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.14),transparent_60%)]' />
      <div className='absolute -bottom-20 -right-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -top-16 -left-10 w-44 h-44 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none' />

      <div className='relative z-10 flex flex-col h-full'>
        {/* Eyebrow */}
        <div className='flex items-center gap-2 mb-3'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
          </span>
          <Sparkles size={15} className='text-indigo-200 animate-pulse' />
          <p className='text-[10px] md:text-xs uppercase tracking-[0.3em] text-indigo-200 font-bold'>
            Ramatalk AI
          </p>
        </div>

        {/* Headline + ajakan */}
        <h3 className='text-xl md:text-2xl lg:text-2xl font-bold bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2 leading-tight'>
          Bingung soal ibadah? Tanya aja, gratis 🤍
        </h3>
        <p className='text-sm text-indigo-100/85 leading-relaxed mb-4'>
          Dari hukum puasa, doa harian, makna ayat, sampai sekadar curhat —
          Ramatalk siap menemani 24 jam tanpa bikin sungkan. Tak ada pertanyaan
          yang terlalu kecil.
        </p>

        {/* Chip contoh pertanyaan */}
        <div className='flex flex-wrap gap-2 mb-5'>
          {SAMPLE_QUESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={(e) => askSample(e, item)}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-indigo-50 backdrop-blur-sm transition-all active:scale-95'
              >
                <Icon size={13} className='text-indigo-200' />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className='mt-auto flex items-center gap-2 text-sm font-bold text-white'>
          <span>Mulai bertanya sekarang</span>
          <ArrowRight
            size={18}
            className='transition-transform duration-300 group-hover:translate-x-1.5'
          />
        </div>
      </div>
    </div>
  );
};

export default RamaTalkCard;
