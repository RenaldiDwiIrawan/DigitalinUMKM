'use client'

import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  query?: string;
  location?: string;
}

export function Header({ query, location }: HeaderProps) {
  return (
    <header className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
      <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[1.05] tracking-tighter max-w-5xl mx-auto mb-8">
        {query && location ? (
          <>
            Leads <span className="text-blue-600 underline decoration-blue-100 underline-offset-12">{query}</span> <br className="hidden md:block" /> di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-gradient-x">{location}</span>
          </>
        ) : (
          <>
            Lead Generation <br className="hidden md:block" /> <span className="text-blue-600 tracking-tighter">&</span> Site Builder
          </>
        )}
      </h1>

      <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
        {query && location
          ? `Daftar bisnis potensial untuk ${query} di wilayah ${location} yang siap Anda transformasikan.`
          : "Cari data UMKM potensial, dapatkan kontak mereka, dan tawarkan website modern dalam hitungan menit."}
      </p>

    </header>
  )
}
