'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Lead } from './LeadsGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { X, Palette, ExternalLink, FileText, Sparkles, ArrowRight } from 'lucide-react'

interface TemplateCardProps {
  id: string
  title: string
  name: string
  description: string
  emoji: string
  bgColor: string
  accentColor: string
  hoverBgColor: string
  hoverTextColor: string
  selectedLead: Lead | null
  promptUrl: string
}

function TemplateCard({
  id,
  title,
  name,
  description,
  emoji,
  bgColor,
  accentColor,
  hoverBgColor,
  hoverTextColor,
  selectedLead,
  promptUrl
}: TemplateCardProps) {
  return (
    <Card className={`group glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/5 border-white/20 hover:shadow-blue-600/20 transition-all duration-700 flex flex-col h-full hover:scale-[1.02]`}>
      <div className={`h-56 ${bgColor} flex items-center justify-center relative overflow-hidden transition-transform duration-700`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="text-[8rem] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 select-none z-10 drop-shadow-2xl">
          {emoji}
        </div>
        <div className={`absolute top-6 right-6 ${accentColor} text-white text-[8px] font-black px-4 py-1.5 rounded-full tracking-[0.3em] uppercase shadow-2xl z-20`}>
          {title}
        </div>
      </div>

      <CardContent className="p-8 text-center flex-1 flex flex-col bg-white/40 backdrop-blur-md">
        <h3 className={`text-2xl font-black text-gray-900 mb-4 ${hoverTextColor} transition-colors tracking-tighter`}>
          {name}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 mx-auto max-sm font-medium tracking-tight">
          {description}
        </p>
        <div className="mt-auto flex flex-col gap-4">
          <Button
            asChild
            variant="premium"
            className={`w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] ${accentColor} ${hoverBgColor} shadow-2xl shadow-blue-900/10`}
          >
            <Link href={`/templates/${id}${selectedLead ? `?name=${encodeURIComponent(selectedLead.name)}` : ''}`}>
              Demo Live
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-white/50 bg-white/30 text-gray-500 hover:text-blue-600 hover:bg-white transition-all text-[11px] font-black uppercase tracking-[0.3em]"
          >
            <a
              href={promptUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat Prompt
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLead: Lead | null
}

export function TemplateModal({ isOpen, onClose, selectedLead }: TemplateModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null

  const cafeName = selectedLead?.name || "Aroma Senja";
  const petshopName = selectedLead?.name || "Cibitung Petshop";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-3xl animate-in fade-in duration-700"
        onClick={onClose}
      />
      <div className="glass w-full max-w-5xl rounded-[3.5rem] shadow-[0_50px_150px_rgba(0,0,0,0.4)] overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-700 max-h-[90vh] flex flex-col border border-white/20">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/50 shadow-2xl hover:bg-white text-gray-500 rounded-xl transition-all z-20 transform hover:rotate-90 border border-white/40"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="overflow-y-auto p-10 md:p-16 custom-scrollbar flex-1">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
              Pilih Desain <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-gradient-x">Premium</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Tampilkan potensi terbaik <span className="text-gray-900 font-black tracking-tight">{selectedLead?.name || 'bisnis klien'}</span> dengan template website modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <TemplateCard
              id="cafe"
              title="Cafe & Resto"
              name={cafeName}
              emoji="☕"
              bgColor="bg-[#FDFBF7]/80"
              accentColor="bg-amber-900"
              hoverBgColor="hover:bg-amber-950"
              hoverTextColor="group-hover:text-amber-900"
              description="Desain estetik dengan nuansa kayu. Sangat cocok untuk cafe yang ingin menonjolkan suasana dan menu andalan."
              selectedLead={selectedLead}
              promptUrl="/docs/templates/cafe/PROMPT.md"
            />
            <TemplateCard
              id="petshop"
              title="Pet Care & Shop"
              name={petshopName}
              emoji="🐾"
              bgColor="bg-blue-50/80"
              accentColor="bg-blue-600"
              hoverBgColor="hover:bg-blue-700"
              hoverTextColor="group-hover:text-blue-600"
              description="Ceria, bersih, dan terpercaya. Ideal untuk jasa grooming dan penitipan hewan yang ingin tampil profesional."
              selectedLead={selectedLead}
              promptUrl="/docs/templates/petshop/PROMPT.md"
            />
          </div>

          <div className="mt-28 text-center">
            <div className="inline-flex items-center gap-4 px-10 py-5 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-xl hover:bg-white hover:scale-105 transition-all group cursor-pointer">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] group-hover:text-blue-600">Request Custom Template</span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
