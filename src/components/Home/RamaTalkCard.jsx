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
      <div className='absolute -bottom-20 -right-16 w-64 h-64 bg-blue-400/20 rounded