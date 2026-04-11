'use client'

import React, { useEffect } from 'react'
import { Lead } from './LeadsGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Copy,
  MapPin,
  ExternalLink,
  Send,
  Star
} from 'lucide-react'

interface LeadDetailModalProps {
  viewingLead: Lead | null
  setViewingLead: (lead: Lead | null) => void
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead) => void
}

export function LeadDetailModal({ viewingLead, setViewingLead, selectedLead, setSelectedLead }: LeadDetailModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setViewingLead(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [setViewingLead]);

  if (!viewingLead) return null

  const formatWA = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1)
    }
    return `https://wa.me/${cleaned}`
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
  }

  const copyAllInfo = () => {
    if (!viewingLead) return;
    const info = `
Nama Bisnis: ${viewingLead.name}
Telepon: ${viewingLead.phone || 'N/A'}
Email: ${viewingLead.email || 'N/A'}
Website: ${viewingLead.website || 'N/A'}
Jarak: ${viewingLead.distance || 'N/A'}
    `.trim();
    navigator.clipboard.writeText(info);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={() => setViewingLead(null)}
      />
      <Card className="glass w-full max-w-xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-500 border-white/20">
        <div className="absolute top-8 right-8 flex gap-3 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAllInfo}
            className="h-10 px-4 bg-white/50 hover:bg-white text-blue-600 rounded-xl transition-all border border-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy All
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewingLead(null)}
            className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-gray-500 rounded-xl transition-all border border-white/40"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl mb-6 ring-8 ring-white/10">
                {viewingLead.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-black leading-tight tracking-tighter mb-4">{viewingLead.name}</h2>
              {viewingLead.distance && (
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <MapPin className="w-3 h-3" /> {viewingLead.distance} dari lokasi Anda
                </div>
              )}
            </div>
          </div>

          <div className="p-10 space-y-8 bg-white/40 backdrop-blur-md">
            <div className="grid grid-cols-1 gap-6">
              {/* Telepon Section */}
              <div className="group">
                <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.3em] mb-4 px-1">Kontak Telepon</label>
                <div className="flex items-center justify-between p-6 bg-white/60 rounded-[2rem] border border-white/40 group-hover:bg-white group-hover:border-blue-200 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-600/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-xl tracking-tight">{viewingLead.phone || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Nomor Bisnis</div>
                    </div>
                  </div>
                  {viewingLead.phone && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(viewingLead.phone!, 'Nomor')}
                        className="h-10 px-4 bg-white border border-gray-100 rounded-lg hover:text-blue-600 hover:border-blue-200 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Copy
                      </Button>
                      <Button
                        asChild
                        variant="premium"
                        size="sm"
                        className="h-10 px-4 rounded-lg shadow-xl shadow-blue-600/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        <a
                          href={formatWA(viewingLead.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Section */}
              <div className="group">
                <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.3em] mb-4 px-1">Alamat Email</label>
                <div className="flex items-center justify-between p-6 bg-white/60 rounded-[2rem] border border-white/40 group-hover:bg-white group-hover:border-blue-200 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-600/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-black text-xl break-all tracking-tight ${viewingLead.email ? 'text-gray-900' : 'text-gray-400 italic font-normal'}`}>
                        {viewingLead.email || 'Email tidak ditemukan'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Surel Bisnis</div>
                    </div>
                  </div>
                  {viewingLead.email && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(viewingLead.email!, 'Email')}
                        className="h-10 px-4 bg-white border border-gray-100 rounded-lg hover:text-blue-600 hover:border-blue-200 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Copy
                      </Button>
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xl shadow-indigo-600/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        <a href={`mailto:${viewingLead.email}`}>
                          Email
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Website Section */}
              <div className="group">
                <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.3em] mb-4 px-1">Situs Web</label>
                <div className="flex items-center justify-between p-6 bg-white/60 rounded-[2rem] border border-white/40 group-hover:bg-white group-hover:border-indigo-200 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-600/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-blue-600 text-xl break-all tracking-tight">
                        {viewingLead.website ? (
                          <a href={viewingLead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {viewingLead.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-gray-900">N/A</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">URL Resmi</div>
                    </div>
                  </div>
                  {viewingLead.website && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-10 px-4 bg-white border border-gray-100 rounded-lg hover:text-indigo-600 hover:border-indigo-200 shadow-sm shrink-0 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      <a href={viewingLead.website} target="_blank" rel="noopener noreferrer">
                        Visit Site
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => {
                  setSelectedLead(viewingLead);
                  setViewingLead(null);
                  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant={selectedLead?.name === viewingLead.name ? "outline" : "premium"}
                className="w-full h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20"
              >
                {selectedLead?.name === viewingLead.name ? 'SUDAH TERPILIH' : 'PILIH BISNIS INI'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
