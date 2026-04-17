'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Lead {
  name: string
  phone: string | null
  website: string | null
  email: string | null
  distance: string | null
}

interface DashboardState {
  leads: Lead[]
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>
  form: {
    query: string
    location: string
    lat?: number
    lng?: number
    limit: number | string
    radius: number | string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    query: string;
    location: string;
    lat?: number;
    lng?: number;
    limit: string | number;
    radius: string | number;
  }>>
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  selectionMode: boolean
  setSelectionMode: (mode: boolean) => void
  selectedLeadNames: string[]
  toggleLeadSelection: (name: string) => void
  clearSelection: () => void
  resetDashboard: () => void
  processingLeads: string[]
  setProcessingLeads: React.Dispatch<React.SetStateAction<string[]>>
  updateLead: (oldLead: Lead, updatedLead: Lead) => void
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedLeadNames, setSelectedLeadNames] = useState<string[]>([])
  const [processingLeads, setProcessingLeads] = useState<string[]>([])

  const updateLead = (oldLead: Lead, updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.name === oldLead.name ? updatedLead : l))
  }

  const toggleLeadSelection = (name: string) => {
    setSelectedLeadNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const clearSelection = () => {
    setSelectedLeadNames([])
    setSelectionMode(false)
  }

  const [form, setForm] = useState<{
    query: string;
    location: string;
    lat?: number;
    lng?: number;
    limit: string | number;
    radius: string | number;
  }>({
    query: '',
    location: '',
    limit: '',
    radius: ''
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // Load initial data from localStorage
  React.useEffect(() => {
    try {
      const savedLeads = localStorage.getItem('digitalin_leads')
      if (savedLeads) setLeads(JSON.parse(savedLeads))

      const savedLead = localStorage.getItem('digitalin_selected_lead')
      if (savedLead) setSelectedLead(JSON.parse(savedLead))

      const savedForm = localStorage.getItem('digitalin_form')
      if (savedForm) setForm(JSON.parse(savedForm))

      const savedSelectionMode = localStorage.getItem('digitalin_selection_mode')
      if (savedSelectionMode) setSelectionMode(JSON.parse(savedSelectionMode))

      const savedSelectedLeadNames = localStorage.getItem('digitalin_selected_lead_names')
      if (savedSelectedLeadNames) setSelectedLeadNames(JSON.parse(savedSelectedLeadNames))
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Persistence Effects - only save after initial load
  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('digitalin_leads', JSON.stringify(leads))
  }, [leads, isInitialized])

  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('digitalin_selected_lead', JSON.stringify(selectedLead))
  }, [selectedLead, isInitialized])

  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('digitalin_form', JSON.stringify(form))
  }, [form, isInitialized])

  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('digitalin_selection_mode', JSON.stringify(selectionMode))
  }, [selectionMode, isInitialized])

  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('digitalin_selected_lead_names', JSON.stringify(selectedLeadNames))
  }, [selectedLeadNames, isInitialized])

  const resetDashboard = () => {
    console.log('Resetting dashboard data...');
    setLeads([])
    setForm({
      query: '',
      location: '',
      lat: undefined,
      lng: undefined,
      limit: '',
      radius: ''
    })
    setSelectedLead(null)
    clearSelection()
    localStorage.removeItem('digitalin_leads')
    localStorage.removeItem('digitalin_selected_lead')
    localStorage.removeItem('digitalin_form')
  }

  return (
    <DashboardContext.Provider
      value={{
        leads,
        setLeads,
        form,
        setForm,
        selectedLead,
        setSelectedLead,
        selectionMode,
        setSelectionMode,
        selectedLeadNames,
        toggleLeadSelection,
        clearSelection,
        resetDashboard,
        processingLeads,
        setProcessingLeads,
        updateLead
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
