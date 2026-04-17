'use client'

import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  query?: string;
  location?: string;
}

export function Header({ query, location }: HeaderProps) {
  return (
    <header className="mb-12 text-center p-8 md:p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-[var(--color-glass-border)] shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-1000 group">
      <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 leading-tight tracking-tight max-w-4xl mx-auto mb-6">
        {query && location ? (
          <>
            Leads{" "}
            <span className="relative inline-block text-primary">
              {query}
              <span className="absolute bottom-1 left-0 w-full h-1 bg-linear-to-r from-primary to-accent bg-[length:0%_100%] bg-no-repeat group-hover:bg-[length:100%_100%] transition-all duration-700 ease-out rounded-full opacity-60"></span>
            </span>{" "}
            <br className="hidden md:block" /> di{" "}
            <span className="text-primary">{location}</span>
          </>
        ) : (
          <>
            Lead Generation <br className="hidden md:block" />{" "}
            <span className="text-primary">&</span> Site Builder
          </>
        )}
      </h1>

      <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
        {query && location
          ? `Daftar bisnis potensial untuk ${query} di wilayah ${location} yang siap Anda transformasikan.`
          : "Cari data UMKM potensial, dapatkan kontak mereka, dan tawarkan website modern dalam hitungan menit."}
      </p>

    </header>
  )
}
