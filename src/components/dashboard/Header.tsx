'use client'

import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  query?: string;
  location?: string;
}

export function Header({ query, location }: HeaderProps) {
  return (
    <header className="mb-12 text-center animate-in fade-in slide-in-from-top-2 duration-700">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight max-w-4xl mx-auto mb-6">
        {query && location ? (
          <>
            Leads <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">{query}</span> <br className="hidden md:block" /> di <span className="text-blue-600">{location}</span>
          </>
        ) : (
          <>
            Lead Generation <br className="hidden md:block" /> <span className="text-blue-600">&</span> Site Builder
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
