# Phone Formatting & Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve data robustness with phone formatting and enhance dashboard performance by optimizing lead grid rendering.

**Architecture:** Add a utility for Indonesian phone formatting. Refactor `LeadsGrid.tsx` by extracting and memoizing `LeadCard` into its own file, passing only minimal boolean flags for selection states to prevent unnecessary re-renders.

**Tech Stack:** React (Next.js), Lucide React, Tailwind CSS.

---

### Task 1: Add Phone Formatter Utility

**Files:**
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Add `formatPhoneNumber` helper**

```typescript
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add phone formatting utility for Indonesian numbers"
```

### Task 2: Extract and Optimize LeadCard Component

**Files:**
- Create: `src/components/dashboard/LeadCard.tsx`
- Modify: `src/components/dashboard/LeadsGrid.tsx`

- [ ] **Step 1: Create `LeadCard.tsx` with memoization**

Move `LeadCard` from `LeadsGrid.tsx` to `src/components/dashboard/LeadCard.tsx`. Update its props to include `isSelected` and `isCurrent` booleans. Remove internal `useDashboard` call and receive necessary functions as props.

```tsx
'use client'

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, Zap, Loader2, Check } from "lucide-react"
import { Lead } from "./LeadsGrid"

interface LeadCardProps {
  lead: Lead
  isSelected: boolean // For multi-selection
  isCurrent: boolean  // For single selection (Pilih Bisnis)
  selectionMode: boolean
  onToggleSelection: (name: string) => void
  onSelect: (lead: Lead) => void
  onView: (lead: Lead) => void
  onOpenTemplates: () => void
  onUpdateLead?: (oldLead: Lead, updatedLead: Lead) => void
  location?: string
}

export const LeadCard = React.memo(({ 
  lead, 
  isSelected, 
  isCurrent,
  selectionMode,
  onToggleSelection,
  onSelect, 
  onView, 
  onOpenTemplates, 
  onUpdateLead, 
  location 
}: LeadCardProps) => {
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
      onClick={() => {
        if (selectionMode) {
          onToggleSelection(lead.name)
        } else {
          onView(lead)
        }
      }}
      className={`group bg-white hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between border-2 rounded-2xl h-full shadow-sm ${
        isSelected ? "border-blue-500 shadow-lg ring-4 ring-blue-500/10" : "border-gray-100"
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
          <Check className="w-3 h-3" />
        </div>
      )}
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
              onSelect(lead);
              onOpenTemplates();
            }}
            variant={isCurrent ? "default" : "outline"}
            className={`w-full text-[10px] font-bold uppercase tracking-wider h-9 rounded-xl transition-all ${
              isCurrent
                ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                : "text-gray-400 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
            }`}
          >
            {isCurrent ? "Terpilih" : 'Pilih Bisnis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
});

LeadCard.displayName = 'LeadCard';
```

- [ ] **Step 2: Update `LeadsGrid.tsx` to use the new `LeadCard` and optimize rendering**

Remove the `LeadCard` definition from `LeadsGrid.tsx`, import the new one, and update the rendering logic to pass boolean flags. Wrap the callbacks in `useCallback` to ensure they are stable.

```tsx
// ... imports
import { LeadCard } from "./LeadCard"
import { useCallback } from "react"

// ... types

export function LeadsGrid({ leads, selectedLead, setSelectedLead, setViewingLead, onReset, onOpenTemplates, isProcessing, onUpdateLead, location }: LeadsGridProps) {
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
    // ... grid structure
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {leads.map((lead, index) => {
        const isSelected = selectedLeadNames.includes(lead.name)
        const isCurrent = selectedLead?.name === lead.name

        return (
          <div
            key={lead.name} // Use lead.name instead of index for better reconciliation
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
      {/* ... isProcessing placeholder */}
    </div>
    // ...
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/LeadCard.tsx src/components/dashboard/LeadsGrid.tsx
git commit -m "perf: optimize lead grid rendering by memoizing LeadCard and minimizing props"
```
