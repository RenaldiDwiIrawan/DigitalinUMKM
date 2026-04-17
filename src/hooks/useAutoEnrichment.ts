import { useEffect, useRef } from 'react';
import { useDashboard, Lead } from '@/context/DashboardContext';

export function useAutoEnrichment() {
  const { leads, processingLeads, setProcessingLeads, updateLead, form } = useDashboard();
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // 1. Identify leads that need enrichment
    const needsEnrichment = leads
      .filter(l => !l.phone)
      .map(l => l.name)
      .filter(name => !processingLeads.includes(name) && !queueRef.current.includes(name));

    if (needsEnrichment.length > 0) {
      queueRef.current = [...queueRef.current, ...needsEnrichment];
      processQueue();
    }
  }, [leads, processingLeads, form.location]);

  const processQueue = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const nextName = queueRef.current.shift();
    if (!nextName) {
      isProcessingRef.current = false;
      return;
    }

    setProcessingLeads(prev => [...prev, nextName]);

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextName,
          location: form.location,
          type: 'details'
        }),
      });

      if (response.ok) {
        const details = await response.json();
        const lead = leads.find(l => l.name === nextName);
        if (lead && details.phone) {
          updateLead(lead, { ...lead, ...details });
        }
      }
    } catch (err) {
      console.error(`Failed to auto-enrich ${nextName}:`, err);
    } finally {
      setProcessingLeads(prev => prev.filter(n => n !== nextName));
      isProcessingRef.current = false;
      // Process next in queue
      setTimeout(processQueue, 500);
    }
  };
}
