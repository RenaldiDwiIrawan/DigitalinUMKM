'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Zap } from 'lucide-react'

interface NavigationProps {
  onOpenTemplates: () => void
}

export function Navigation({ onOpenTemplates }: NavigationProps) {
  return (
    <nav className="glass border-b border-white/20 p-4 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-11 h-11 rounded-[14px] flex items-center justify-center group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter bg-gradient-to-br from-gray-900 via-blue-900 to-blue-600 bg-clip-text text-transparent">
              DigitalinUMKM
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60 -mt-1">
              Go Digital Tanpa Drama
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
          <Button variant="premium" size="sm" className="px-6 h-9 rounded-xl font-black uppercase tracking-widest text-[10px]">
            Scraper
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTemplates}
            className="px-6 h-9 rounded-xl text-gray-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px]"
          >
            Templates
          </Button>
        </div>
      </div>
    </nav>
  )
}
