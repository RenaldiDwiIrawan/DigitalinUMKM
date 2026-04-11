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
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digitalin_leads')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [selectedLead, setSelectedLead] = useState<Lead | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digitalin_selected_lead')
      return saved ? JSON.parse(saved) : null
    }
    return null
  })
  const [form, setForm] = useState<{
    query: string;
    location: string;
    limit: string | number;
    radius: string | number;
  }>(() => {
    const defaultForm = {
      query: '',
      location: '',
      limit: '',
      radius: ''
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digitalin_form')
      return saved ? JSON.parse(saved) : defaultForm
    }
    return defaultForm
  })

  // Persistence Effects
  React.useEffect(() => {
    localStorage.setItem('digitalin_leads', JSON.stringify(leads))
  }, [leads])

  React.useEffect(() => {
    localStorage.setItem('digitalin_selected_lead', JSON.stringify(selectedLead))
  }, [selectedLead])

  React.useEffect(() => {
    localStorage.setItem('digitalin_form', JSON.stringify(form))
  }, [form])

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
