'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Eye, Star, Trash2, Zap, Download, Loader2 } from "lucide-react"
import { exportToCSV } from "@/lib/utils"

export interface Lead {
  name: string
  phone: string | null
  website: string | null
  email: string | null
  distance: string | null
}

interface LeadsGridProps {
  leads: Lead[]
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead) => void
  setViewingLead: (lead: Lead) => void
  onReset: () => void
  onOpenTemplates: () => void
  onUpdateLead?: (oldLead: Lead, updatedLead: Lead) => void
  isProcessing?: boolean
  location?: string // Added location for enrichment
}

export function LeadCard({ lead, selectedLead, setSelectedLead, setViewingLead, onOpenTemplates, onUpdateLead, location }: {
  lead: Lead,
  selectedLead: Lead | null,
  setSelectedLead: (lead: Lead) => void,
  setViewingLead: (lead: Lead) => void,
  onOpenTemplates: () => void,
  onUpdateLead?: (oldLead: Lead, updatedLead: Lead) => void,
  location?: string
}) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [isEnrichingWebsite, setIsEnrichingWebsite] = useState(false);

  const enrichLead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.website || isEnriching) return;

    setIsEnriching(true);
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lead.website, type: 'email' }),
      });

      if (response.ok) {
        const { email } = await response.json();
        if (email && onUpdateLead) {
          onUpdateLead(lead, { ...lead, email });
        }
      }
    } catch (err) {
      console.error('Failed to enrich lead:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  const enrichWebsite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.website || isEnrichingWebsite || !location) return;

    setIsEnrichingWebsite(true);
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, location, type: 'details' }),
      });

      if (response.ok) {
        const details = await response.json();
        if (onUpdateLead) {
          onUpdateLead(lead, { ...lead, ...details });
        }
      }
    } catch (err) {
      console.error('Failed to enrich website:', err);
    } finally {
      setIsEnrichingWebsite(false);
    }
  };
  return (
    <Card
      onClick={() => setViewingLead(lead)}
      className="group bg-white hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between border-gray-100 rounded-2xl h-full shadow-sm"
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            {lead.name.charAt(0)}
          </div>
          {lead.distance ? (
            <div className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-gray-100">
              {lead.distance}
            </div>
          ) : (
            <div className="bg-gray-50/50 text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent">
              ± 2.5 km
            </div>
          )}
        </div>

        <div className="text-left mb-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight min-h-[2.5rem] flex items-start tracking-tight">
            {lead.name}
          </h3>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-500">
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3 h-3 text-blue-400" />
                <span className={`truncate ${lead.phone ? '' : 'italic opacity-60'}`}>
                  {lead.phone || 'Telepon N/A'}
                </span>
              </div>
              {!lead.phone && (
                <button
                  onClick={enrichWebsite}
                  disabled={isEnrichingWebsite}
                  className="shrink-0 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1 not-italic transition-all shadow-sm shadow-blue-200 active:scale-95"
                >
                  {isEnrichingWebsite ? (
                    <Loader2 className="w-2 h-2 animate-spin" />
                  ) : (
                    <Zap className="w-2 h-2" />
                  )}
                  {isEnrichingWebsite ? '...' : 'Cari Telp'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-500">
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-3 h-3 text-blue-400" />
                {lead.website ? (
                  <span className="truncate">{lead.website.replace(/^https?:\/\//, '').split('/')[0]}</span>
                ) : (
                  <span className="italic opacity-60">Website N/A</span>
                )}
              </div>
              {!lead.website && (
                <button
                  onClick={enrichWebsite}
                  disabled={isEnrichingWebsite}
                  className="shrink-0 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1 not-italic transition-all shadow-sm shadow-blue-200 active:scale-95"
                >
                  {isEnrichingWebsite ? (
                    <Loader2 className="w-2 h-2 animate-spin" />
                  ) : (
                    <Globe className="w-2 h-2" />
                  )}
                  {isEnrichingWebsite ? '...' : 'Cari Web'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-500">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className={`truncate ${lead.email ? '' : 'italic opacity-60'}`}>
                  {lead.email || 'Email N/A'}
                </span>
              </div>
              {!lead.email && lead.website && (
                <button
                  onClick={enrichLead}
                  disabled={isEnriching}
                  className="shrink-0 text-[9px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {isEnriching ? (
                    <Loader2 className="w-2 h-2 animate-spin" />
                  ) : (
                    <Zap className="w-2 h-2" />
                  )}
                  {isEnriching ? '...' : 'Cari Email'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLead(lead);
              onOpenTemplates();
            }}
            variant={selectedLead?.name === lead.name ? "default" : "outline"}
            className={`w-full text-[10px] font-bold uppercase tracking-wider h-9 rounded-xl transition-all ${
              selectedLead?.name === lead.name
                ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                : "text-gray-400 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
            }`}
          >
            {selectedLead?.name === lead.name ? "Terpilih" : 'Pilih Bisnis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsGrid({ leads, selectedLead, setSelectedLead, setViewingLead, onReset, onOpenTemplates, isProcessing, onUpdateLead, location }: LeadsGridProps) {
  return (
    <div className="lg:col-span-8 xl:col-span-9">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Hasil Pencarian</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Sedang mencari... <span className="text-blue-600 font-bold">{leads.length}</span> ditemukan sejauh ini.
                </span>
              ) : (
                <>Ditemukan <span className="text-blue-600 font-bold">{leads.length}</span> bisnis potensial yang siap dikonversi.</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => exportToCSV(leads, `leads_${new Date().toISOString().split('T')[0]}`)}
                  className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 px-4 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.preventDefault();
                    onReset();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 px-4 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {leads.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-10">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-200">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Belum Ada Data</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-xs leading-relaxed">
              Gunakan filter di samping untuk mencari leads dari server secara real-time.
            </p>
          </div>
        ) : leads.length === 0 && isProcessing ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-10">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-3xl border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Menghubungkan ke Server</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-xs leading-relaxed animate-pulse">
              Memulai sesi browser aman untuk mengambil data terbaru...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leads.map((lead, index) => (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both flex flex-col h-full"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <LeadCard
                  lead={lead}
                  selectedLead={selectedLead}
                  setSelectedLead={setSelectedLead}
                  setViewingLead={setViewingLead}
                  onOpenTemplates={onOpenTemplates}
                  onUpdateLead={onUpdateLead}
                  location={location}
                />
              </div>
            ))}
            {isProcessing && (
              <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/30 min-h-[300px] animate-pulse">
                <div className="w-10 h-10 rounded-full border-2 border-blue-100 border-t-blue-500 animate-spin mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mencari Data Berikutnya...</p>
                <p className="text-[10px] text-gray-300 mt-2">Menunggu respons dari server</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
