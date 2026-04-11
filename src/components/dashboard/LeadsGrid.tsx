'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Eye, Star, Trash2, Zap, Download } from "lucide-react"
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
}

export function LeadCard({ lead, selectedLead, setSelectedLead, setViewingLead, onOpenTemplates }: {
  lead: Lead,
  selectedLead: Lead | null,
  setSelectedLead: (lead: Lead) => void,
  setViewingLead: (lead: Lead) => void,
  onOpenTemplates: () => void
}) {
  return (
    <Card
      onClick={() => setViewingLead(lead)}
      className="group bg-white/40 hover:bg-white hover:border-blue-600 hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between border-white/20 hover:scale-[1.02] rounded-[1.5rem] h-full"
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center text-base font-black group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
            {lead.name.charAt(0)}
          </div>
          {lead.distance ? (
            <Badge variant="secondary" className="bg-white/60 backdrop-blur-sm text-blue-600 border border-white/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
              {lead.distance}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50/50 text-gray-400 border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              ± 2.5 km
            </Badge>
          )}
        </div>

        <div className="text-left mb-4 flex-1 flex flex-col">
          <h3 className="text-base font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight min-h-[2.25rem] flex items-center tracking-tight">
            {lead.name}
          </h3>

          <div className="space-y-2.5 mt-auto">
            {lead.phone && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-600 hover:text-blue-600 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0 shadow-sm">
                  <Phone className="w-2.5 h-2.5" />
                </div>
                <span className="tracking-tight break-all">{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-600 hover:text-blue-600 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0 shadow-sm">
                  <Globe className="w-2.5 h-2.5" />
                </div>
                <span className="tracking-tight break-all">{lead.website.replace(/^https?:\/\//, '').split('/')[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[10px] font-bold transition-colors">
              <div className="w-7 h-7 rounded-lg bg-white/50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0 shadow-sm">
                <Mail className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600" />
              </div>
              <span className={`tracking-tight break-all ${lead.email ? 'text-gray-600 hover:text-blue-600' : 'text-gray-300 italic font-normal'}`}>
                {lead.email || 'Email tidak ditemukan'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/20 group-hover:border-blue-50 transition-colors shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLead(lead);
              onOpenTemplates();
            }}
            variant={selectedLead?.name === lead.name ? "premium" : "ghost"}
            className={`w-full text-[9px] font-black uppercase tracking-[0.2em] h-9 rounded-lg transition-all ${
              selectedLead?.name === lead.name
                ? "shadow-xl shadow-blue-600/20"
                : "bg-white/40 text-gray-400 hover:bg-blue-600 hover:text-white border border-white/20"
            }`}
          >
            {selectedLead?.name === lead.name ? "TERPILIH" : 'Pilih'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsGrid({ leads, selectedLead, setSelectedLead, setViewingLead, onReset, onOpenTemplates }: LeadsGridProps) {
  return (
    <div className="lg:col-span-8 xl:col-span-9">
      <div className="glass p-6 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border-white/20 min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 text-center md:text-left">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Hasil Pencarian</h2>
            <p className="text-gray-400 text-base mt-2 font-medium tracking-tight">
              Ditemukan <span className="text-blue-600 font-black">{leads.length}</span> bisnis potensial yang siap dikonversi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {leads.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(leads, `leads_${new Date().toISOString().split('T')[0]}`)}
                  className="bg-white/50 border-white/40 text-blue-600 hover:bg-blue-600 hover:text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onReset();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 transition-all"
                >
                  Reset Data
                </Button>
              </>
            )}
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-center px-10">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 text-gray-200">
              <Zap className="w-10 h-10 fill-current" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Belum Ada Data</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed font-medium">
              Gunakan filter di samping untuk mencari leads dari Google Maps secara real-time dan mulai transformasi digital Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {leads.map((lead, index) => (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both flex flex-col h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <LeadCard
                  lead={lead}
                  selectedLead={selectedLead}
                  setSelectedLead={setSelectedLead}
                  setViewingLead={setViewingLead}
                  onOpenTemplates={onOpenTemplates}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
