import React from 'react';
import Link from 'next/link';

export default function CafeTemplate({ businessName }: { businessName?: string }) {
  const displayTitle = businessName || 'AROMA SENJA';
  const displayHero = businessName ? `Seduhan Hangat di ${businessName}` : 'Seduhan Hangat di Ujung Senja';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-serif selection:bg-[#EADCC3] selection:text-[#4A3728]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-[#EADCC3]/30">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-[#6F4E37] w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#6F4E37]/20 group-hover:rotate-12 transition-all">
            <span className="text-xl">☕</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-[#4A3728] uppercase">{displayTitle}</h1>
        </div>
        <div className="hidden md:flex items-center gap-10 font-sans text-[11px] font-black uppercase tracking-[0.2em] text-[#8B5E3C]">
          <a href="#" className="hover:text-[#4A3728] transition-colors">Menu</a>
          <a href="#" className="hover:text-[#4A3728] transition-colors">Tentang Kami</a>
          <a href="#" className="hover:text-[#4A3728] transition-colors">Lokasi</a>
          <Link href="/" className="bg-[#6F4E37] text-white px-6 py-2.5 rounded-full hover:bg-[#4A3728] transition-all shadow-xl shadow-[#6F4E37]/10">Dashboard</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#EADCC3] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4C3A1] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
          <span className="inline-block px-5 py-2 mb-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#8B5E3C] bg-[#EADCC3]/30 rounded-full backdrop-blur-sm">
            Est. {new Date().getFullYear()} • Premium Coffee
          </span>
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-[#4A3728] leading-[0.9] tracking-tighter">
            {displayHero}
          </h2>
          <p className="text-lg md:text-xl font-sans text-[#6F4E37]/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Temukan ketenangan dalam setiap cangkir kopi pilihan. Dipanggang dengan cinta, disajikan dengan hati untuk menemani setiap cerita Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-[#6F4E37] text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#4A3728] transition-all shadow-2xl shadow-[#6F4E37]/20 transform hover:scale-105">
              Pesan Sekarang ➔
            </button>
            <button className="bg-white border-2 border-[#EADCC3] text-[#6F4E37] px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#EADCC3]/20 transition-all">
              Lihat Menu
            </button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-32 bg-white px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-5xl font-black mb-6 tracking-tighter">Menu Unggulan</h3>
            <div className="w-16 h-1.5 bg-[#6F4E37] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { emoji: "🥛", name: "Signature Senja", desc: "Espresso dengan gula aren organik.", price: "25k" },
              { emoji: "⚗️", name: "V60 Specialty", desc: "Single origin manual brew.", price: "30k" },
              { emoji: "🥐", name: "Butter Croissant", desc: "Pastry renyah panggang harian.", price: "18k" }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-[#FDFBF7]/50 border border-[#EADCC3]/50 rounded-[2.5rem] hover:bg-white hover:border-[#6F4E37]/20 hover:shadow-2xl hover:shadow-[#6F4E37]/5 transition-all duration-500 text-center">
                <div className="text-5xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 drop-shadow-xl">
                  {item.emoji}
                </div>
                <h4 className="text-2xl font-black mb-3 tracking-tight">{item.name}</h4>
                <p className="font-sans text-sm text-[#8B5E3C] mb-6 leading-relaxed">{item.desc}</p>
                <div className="inline-block px-6 py-2 bg-white rounded-full font-sans font-black text-[#6F4E37] text-lg shadow-sm border border-[#EADCC3]/30">
                  Rp {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-[#4A3728] text-[#EADCC3] px-8 text-center font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <span className="text-3xl">☕</span>
            </div>
            <p className="text-3xl font-serif mb-6 font-black tracking-tighter text-white">{displayTitle}</p>
            <div className="space-y-4 text-base opacity-80 font-medium tracking-tight">
              <p className="flex items-center justify-center gap-3">📍 Jl. Kenangan No. 12, Bekasi Timur</p>
              <p className="flex items-center justify-center gap-3">🕒 Setiap Hari: 09:00 — 22:00</p>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
              © {new Date().getFullYear()} {displayTitle} • Dibuat dengan DigitalinUMKM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
