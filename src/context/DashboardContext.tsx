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
  setLeads: (leads: Lead[]) => void
  form: {
    query: string
    location: string
    limit: number | string
    radius: number | string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    query: string;
    location: string;
    limit: string | number;
    radius: string | number;
  }>>
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  resetDashboard: () => void
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [form, setForm] = useState<{
    query: string;
    location: string;
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

  const resetDashboard = () => {
    console.log('Resetting dashboard data...');
    setLeads([])
    setForm({
      query: '',
      location: '',
      limit: '',
      radius: ''
    })
    setSelectedLead(null)
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
        resetDashboard
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
