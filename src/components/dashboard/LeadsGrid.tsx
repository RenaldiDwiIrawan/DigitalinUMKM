'use client'

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Eye, Star, Trash2, Zap, Download, Loader2, CheckSquare, Check } from "lucide-react"
import { exportToCSV } from "@/lib/utils"
import { useDashboard } from "@/context/DashboardContext"
import { LeadCard } from "./LeadCard"
import { useAutoEnrichment } from "@/hooks/useAutoEnrichment"

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

export function LeadsGrid({ leads, selectedLead, setSelectedLead, setViewingLead, onReset, onOpenTemplates, isProcessing, onUpdateLead, location }: LeadsGridProps) {
  useAutoEnrichment()
  const { selectionMode, setSelectionMode, selectedLeadNames, toggleLeadSelection } = useDashboard()

  const handleToggleSelection = useCallback((name: string) => {
    toggleLeadSelection(name)
  }, [toggleLeadSelection])

  const handleSelect = useCallback((lead: Lead) => {
    setSelectedLead(lead)
  }, [setSelectedLead])

  const handleView = useCallback((lead: Lead) => {
    setViewingLead(lead)
  }, [setViewingLead])

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
                  variant={selectionMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectionMode(!selectionMode)}
                  className={`h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    selectionMode ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  <CheckSquare className="w-3 h-3" />
                  {selectionMode ? "Selesai Pilih" : "Pilih Massal"}
                </Button>
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
            {leads.map((lead, index) => {
              const isSelected = selectedLeadNames.includes(lead.name)
              const isCurrent = selectedLead?.name === lead.name

              return (
                <div
                  key={lead.name}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both flex flex-col h-full"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <LeadCard
                    lead={lead}
                    isSelected={isSelected}
                    isCurrent={isCurrent}
                    selectionMode={selectionMode}
                    onToggleSelection={handleToggleSelection}
                    onSelect={handleSelect}
                    onView={handleView}
                    onOpenTemplates={onOpenTemplates}
                    onUpdateLead={onUpdateLead}
                    location={location}
                  />
                </div>
              )
            })}
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
