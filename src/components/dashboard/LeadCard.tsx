'use client'

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, Zap, Loader2, Check } from "lucide-react"
import { Lead } from "./LeadsGrid"
import { useDashboard } from "@/context/DashboardContext"

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
  const { processingLeads } = useDashboard();
  const [isEnriching, setIsEnriching] = useState(false);
  const [isEnrichingWebsite, setIsEnrichingWebsite] = useState(false);

  const isAutoEnriching = processingLeads.includes(lead.name);

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
      className={`group bg-white/70 backdrop-blur-xl border border-[var(--color-glass-border)] hover:border-primary/30 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden flex flex-col justify-between rounded-2xl h-full hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] ${
        isSelected ? "border-primary shadow-lg ring-4 ring-primary/10" : ""
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 bg-primary text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
          <Check className="w-3 h-3" />
        </div>
      )}
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-primary/10">
            {lead.name.charAt(0)}
          </div>
          {lead.distance ? (
            <div className="bg-white/50 backdrop-blur-sm text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[var(--color-glass-border)]">
              {lead.distance}
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-sm text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent">
              ± 2.5 km
            </div>
          )}
        </div>

        <div className="text-left mb-4 flex-1 flex flex-col">
          <h3 className="text-sm font-heading font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem] flex items-start tracking-tight">
            {lead.name}
          </h3>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-500">
              <div className="flex items-center gap-2 truncate">
                <Phone className={`w-3 h-3 ${isAutoEnriching ? 'text-primary animate-pulse' : 'text-primary/60'}`} />
                <span className={`truncate ${lead.phone ? '' : 'italic opacity-60'} ${isAutoEnriching ? 'text-primary font-bold' : ''}`}>
                  {isAutoEnriching ? 'Mencari Telp...' : (lead.phone || 'Telepon N/A')}
                </span>
              </div>
              {!lead.phone && !isAutoEnriching && (
                <button
                  onClick={enrichWebsite}
                  disabled={isEnrichingWebsite}
                  className="shrink-0 text-[9px] font-bold text-white bg-primary hover:bg-primary/90 px-2 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1 not-italic transition-all shadow-sm shadow-primary/20 active:scale-95"
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
                <Globe className="w-3 h-3 text-primary/60" />
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
                  className="shrink-0 text-[9px] font-bold text-white bg-primary hover:bg-primary/90 px-2 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1 not-italic transition-all shadow-sm shadow-primary/20 active:scale-95"
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
                  className="shrink-0 text-[9px] font-bold text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-1 transition-colors"
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

        <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)] shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(lead);
              onOpenTemplates();
            }}
            variant={isCurrent ? "default" : "outline"}
            className={`w-full text-[10px] font-bold uppercase tracking-wider h-9 rounded-xl transition-all ${
              isCurrent
                ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                : "text-gray-400 border-[var(--color-glass-border)] bg-white/50 hover:bg-white hover:text-primary hover:border-primary/30"
            }`}
          >
            {isCurrent ? "Terpilih" : 'Pilih Bisnis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
});

export function LeadCardSkeleton() {
  return (
    <Card className="bg-white/70 backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl h-full shadow-sm animate-shimmer overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="w-10 h-10 bg-gray-200/50 rounded-xl animate-pulse"></div>
          <div className="w-12 h-4 bg-gray-200/50 rounded-full animate-pulse"></div>
        </div>

        <div className="text-left mb-4 flex-1 flex flex-col">
          <div className="w-3/4 h-4 bg-gray-200/50 rounded animate-pulse mb-3"></div>
          <div className="w-1/2 h-3 bg-gray-200/30 rounded animate-pulse mb-2"></div>

          <div className="space-y-3 mt-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-3 h-3 bg-gray-200/40 rounded-full animate-pulse"></div>
                  <div className="w-full h-2 bg-gray-200/20 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)] shrink-0">
          <div className="w-full h-9 bg-gray-200/40 rounded-xl animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}

LeadCard.displayName = 'LeadCard';
