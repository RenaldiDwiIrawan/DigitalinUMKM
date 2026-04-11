'use client'

import { useTransition, useState } from 'react'
import { runScraper } from './actions'
import { Navigation } from '@/components/dashboard/Navigation'
import { Header } from '@/components/dashboard/Header'
import { ScraperForm } from '@/components/dashboard/ScraperForm'
import { LeadsGrid, Lead } from '@/components/dashboard/LeadsGrid'
import { TemplateModal } from '@/components/dashboard/TemplateModal'
import { LeadDetailModal } from '@/components/dashboard/LeadDetailModal'
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

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      // Convert empty strings to undefined to use server-side defaults
      const limit = form.limit === '' ? undefined : Number(form.limit)
      const radius = form.radius === '' ? undefined : Number(form.radius)

      const result = await runScraper(form.query, form.location, limit, radius)
      if (result.success && result.data) {
        setLeads(result.data as Lead[])
      } else {
        setError(result.error || 'Terjadi kesalahan saat scraping.')
      }
    })
  }

  const handleReset = () => {
    resetDashboard()
    setError(null)
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
              isPending={isPending}
              error={error}
              onReset={handleReset}
            />
          </div>

          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <LeadsGrid
              leads={leads}
              selectedLead={selectedLead}
              setSelectedLead={setSelectedLead}
              setViewingLead={setViewingLead}
              onReset={handleReset}
              onOpenTemplates={() => setIsTemplateModalOpen(true)}
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
    </div>
  )
}
