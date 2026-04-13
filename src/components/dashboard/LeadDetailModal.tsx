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
      <Card className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-300 border-none">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewingLead(null)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100/50 hover:bg-gray-100 text-gray-500 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="p-8 pb-4 text-center border-b border-gray-50">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm border border-blue-100/50">
                {viewingLead.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2 px-4">{viewingLead.name}</h2>
            {viewingLead.distance && (
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-500" /> {viewingLead.distance} dari lokasi Anda
              </div>
            )}
          </div>

          <div className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              {/* Contact Grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Phone */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{viewingLead.phone || 'N/A'}</div>
                      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Telepon</div>
                    </div>
                  </div>
                  {viewingLead.phone && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(viewingLead.phone!, 'Nomor')}
                        className="w-8 h-8 text-gray-400 hover:text-blue-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-green-500 hover:bg-green-50"
                      >
                        <a href={formatWA(viewingLead.phone)} target="_blank" rel="noopener noreferrer">
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${viewingLead.email ? 'text-gray-900' : 'text-gray-400'}`}>
                        {viewingLead.email || 'Email tidak ditemukan'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Email</div>
                    </div>
                  </div>
                  {viewingLead.email && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-indigo-500 hover:bg-indigo-50"
                      >
                        <a href={`mailto:${viewingLead.email}`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-blue-600 truncate hover:underline">
                        {viewingLead.website ? (
                          <a href={viewingLead.website} target="_blank" rel="noopener noreferrer">
                            {viewingLead.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Website</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button
                onClick={() => {
                  setSelectedLead(viewingLead);
                  setViewingLead(null);
                  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant={selectedLead?.name === viewingLead.name ? "outline" : "default"}
                className={`w-full h-12 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedLead?.name === viewingLead.name
                    ? 'border-gray-200 text-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {selectedLead?.name === viewingLead.name ? 'Sudah Terpilih' : 'Pilih Bisnis Ini'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAllInfo}
                className="text-[10px] text-gray-400 font-medium hover:text-gray-600 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3 h-3" />
                Salin Semua Informasi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
