'use client'

import { useTransition, useState } from 'react'
import { Navigation } from '@/components/dashboard/Navigation'
import { Header } from '@/components/dashboard/Header'
import { ScraperForm } from '@/components/dashboard/ScraperForm'
import { LeadsGrid, Lead } from '@/components/dashboard/LeadsGrid'
import { TemplateModal } from '@/components/dashboard/TemplateModal'
import { LeadDetailModal } from '@/components/dashboard/LeadDetailModal'
import { OutreachBar } from '@/components/dashboard/OutreachBar'
import { useDashboard } from '@/context/DashboardContext'

export default function ScraperDashboard() {
  const {
    leads,
    setLeads,
    form,
    setForm,
    selectedLead,
    setSelectedLead,
    resetDashboard
  } = useDashboard()

  const [viewingLead, setViewingLead] = useState<Lead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [partialWarning, setPartialWarning] = useState<string | null>(null)
  const [canContinue, setCanContinue] = useState(false)

  const handleScrape = async (e?: React.FormEvent, isContinuation = false) => {
    if (e) e.preventDefault()
    setError(null)

    if (!isContinuation) {
      setLeads([]) // Clear existing leads only for new search
      setPartialWarning(null)
    } else {
      setPartialWarning(` Server Terputus, Melanjutkan pencarian otomatis (${leads.length} data ditemukan)...`);
    }

    setCanContinue(false)
    setIsProcessing(true)

    const limitValue = parseInt(String(form.limit));
    const limitRequested = isNaN(limitValue) ? 10 : limitValue;
    const currentOffset = isContinuation ? leads.length : 0;

    const radiusValue = parseInt(String(form.radius));
    const radius = isNaN(radiusValue) ? undefined : radiusValue;

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: form.query,
          location: form.location,
          lat: form.lat,
          lng: form.lng,
          limit: limitRequested,
          radius,
          offset: currentOffset
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal menghubungi server scraping.')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('ReadableStream tidak didukung di browser ini.')

      const textDecoder = new TextDecoder()
      let buffer = ''
      let newLeadsCount = 0
      let serverIsDone = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += textDecoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const payload = JSON.parse(line)
            if (payload.type === 'lead') {
              setLeads(prev => [...prev, payload.data])
              newLeadsCount++
            } else if (payload.type === 'done') {
              serverIsDone = payload.isDone || false
            } else if (payload.type === 'error') {
              setError(payload.message)
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e)
          }
        }
      }

      const totalLeads = currentOffset + newLeadsCount;

      // Auto-continuation logic
      // We continue if:
      // 1. We haven't reached the requested limit
      // 2. The server hasn't signaled that it reached the absolute end of results
      if (totalLeads < limitRequested && !serverIsDone) {
        // If we found NO leads in this batch, but aren't done, we MUST continue
        // to find results that might be further down (especially with radius filtering)
        const statusMsg = newLeadsCount > 0
          ? `Mengambil batch berikutnya (${totalLeads}/${limitRequested} data)...`
          : `Mencari lebih dalam pada peta... (${totalLeads} data ditemukan)`;

        setPartialWarning(statusMsg);
        setTimeout(() => handleScrape(undefined, true), 500);
      } else {
        setPartialWarning(null);
        if (totalLeads > 0 && totalLeads < limitRequested && serverIsDone) {
          setPartialWarning(`Pencarian selesai. Ditemukan ${totalLeads} data (hasil maksimal di lokasi/radius ini).`);
        }
      }

    } catch (err: any) {
      // If we already have some leads, allow continuing despite error (likely timeout)
      if (leads.length > 0 || currentOffset > 0) {
        setPartialWarning(`Koneksi terputus. Mencoba melanjutkan otomatis...`);
        setTimeout(() => handleScrape(undefined, true), 1500);
      } else {
        setError(err.message || 'Terjadi kesalahan saat scraping.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    resetDashboard()
    setError(null)
    setPartialWarning(null)
    setIsProcessing(false)
  }

  const handleUpdateLead = (oldLead: Lead, updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.name === oldLead.name ? updatedLead : l));
    if (selectedLead?.name === oldLead.name) {
      setSelectedLead(updatedLead);
    }
  }

  return (
    <div className="min-h-screen bg-mesh font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navigation onOpenTemplates={() => setIsTemplateModalOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <Header query={form.query} location={form.location} />

        <div className="flex flex-col gap-10 mb-32">
          <div className="w-full max-w-4xl mx-auto">
            <ScraperForm
              form={form}
              setForm={setForm}
              handleScrape={handleScrape}
              isPending={isProcessing}
              error={error}
              onReset={handleReset}
            />
          </div>

          {partialWarning && (
            <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in duration-300">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 text-amber-800 text-sm shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-amber-600">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <p className="font-medium">{partialWarning}</p>
                </div>

                {canContinue && (
                  <button
                    onClick={() => handleScrape(undefined, true)}
                    disabled={isProcessing}
                    className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                    {isProcessing ? 'Mencari Sisanya...' : 'Lanjutkan Cari'}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <LeadsGrid
              leads={leads}
              selectedLead={selectedLead}
              setSelectedLead={setSelectedLead}
              setViewingLead={setViewingLead}
              onReset={handleReset}
              onOpenTemplates={() => setIsTemplateModalOpen(true)}
              onUpdateLead={handleUpdateLead}
              isProcessing={isProcessing}
              location={form.location}
            />
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-4">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 fill-current"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} • DIGITALINUMKM
          </div>
        </div>
      </footer>

      <LeadDetailModal
        viewingLead={viewingLead}
        setViewingLead={setViewingLead}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        selectedLead={selectedLead}
      />

      <OutreachBar />
    </div>
  )
}
