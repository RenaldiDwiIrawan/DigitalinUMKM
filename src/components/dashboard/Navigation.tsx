'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Zap } from 'lucide-react'

interface NavigationProps {
  onOpenTemplates: () => void
}

export function Navigation({ onOpenTemplates }: NavigationProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-3 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md shadow-blue-600/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              DigitalinUMKM
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600/60 -mt-0.5">
              Go Digital Tanpa Drama
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <Button size="sm" className="px-5 h-8 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            Scraper
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTemplates}
            className="px-5 h-8 rounded-lg text-gray-500 hover:text-blue-600 font-bold uppercase tracking-wider text-[10px]"
          >
            Templates
          </Button>
        </div>
      </div>
    </nav>
  )
}
