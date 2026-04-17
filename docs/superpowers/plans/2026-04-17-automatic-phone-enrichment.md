# Automatic Background Phone Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically fetch missing phone numbers for search results in the background.

**Architecture:** A queue-based worker manages sequential enrichment requests to `/api/enrich` whenever new leads with missing phone numbers are detected. The UI reflects the "Searching..." state for each card being processed.

**Tech Stack:** Next.js (App Router), React Context, Playwright (Backend Scraper).

---

### Task 1: Update DashboardContext State

**Files:**
- Modify: `src/context/DashboardContext.tsx`

- [ ] **Step 1: Add `processingLeads` to the Dashboard state**

Add `processingLeads` (a Set or array of names) to the `DashboardState` interface and provider.

```typescript
// src/context/DashboardContext.tsx

interface DashboardState {
  // ... existing fields
  processingLeads: string[];
  setProcessingLeads: React.Dispatch<React.SetStateAction<string[]>>;
  updateLead: (oldLead: Lead, updatedLead: Lead) => void;
}

// In DashboardProvider:
const [processingLeads, setProcessingLeads] = useState<string[]>([]);

const updateLead = (oldLead: Lead, updatedLead: Lead) => {
  setLeads(prev => prev.map(l => l.name === oldLead.name ? updatedLead : l));
};
```

- [ ] **Step 2: Commit**

```bash
git add src/context/DashboardContext.tsx
git commit -m "feat(context): add processingLeads state for background enrichment"
```

---

### Task 2: Create useAutoEnrichment Hook

**Files:**
- Create: `src/hooks/useAutoEnrichment.ts`

- [ ] **Step 1: Implement the automatic enrichment logic**

This hook will watch `leads`, identify those missing `phone`, and process them one-by-one.

```typescript
// src/hooks/useAutoEnrichment.ts
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
  }, [leads]);

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
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAutoEnrichment.ts
git commit -m "feat(hooks): implement useAutoEnrichment for background phone lookups"
```

---

### Task 3: Update LeadCard UI

**Files:**
- Modify: `src/components/dashboard/LeadCard.tsx`

- [ ] **Step 1: Reflect the "Searching..." state in the card**

Update `LeadCard` to check if its name is in `processingLeads`.

```tsx
// src/components/dashboard/LeadCard.tsx

// Inside LeadCard component:
const { processingLeads } = useDashboard();
const isAutoEnriching = processingLeads.includes(lead.name);

// Update phone display:
<div className="flex items-center gap-2 truncate">
  <Phone className={`w-3 h-3 ${isAutoEnriching ? 'text-blue-600 animate-pulse' : 'text-blue-400'}`} />
  <span className={`truncate ${lead.phone ? '' : 'italic opacity-60'} ${isAutoEnriching ? 'text-blue-600 font-bold' : ''}`}>
    {isAutoEnriching ? 'Mencari Telp...' : (lead.phone || 'Telepon N/A')}
  </span>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/LeadCard.tsx
git commit -m "ui(dashboard): show searching state in LeadCard during auto-enrichment"
```

---

### Task 4: Integration and Final Polish

**Files:**
- Modify: `src/components/dashboard/LeadsGrid.tsx`

- [ ] **Step 1: Integrate the hook in LeadsGrid**

```tsx
// src/components/dashboard/LeadsGrid.tsx
import { useAutoEnrichment } from '@/hooks/useAutoEnrichment';

export const LeadsGrid = () => {
  useAutoEnrichment(); // Start the background worker
  // ... rest of component
}
```

- [ ] **Step 2: Verify functionality**
1. Run `npm run dev`.
2. Perform a search.
3. Observe leads without phone numbers automatically triggering the enrichment process.
4. Verify that numbers "pop-in" as they are found.

- [ ] **Step 3: Final Commit**

```bash
git add src/components/dashboard/LeadsGrid.tsx
git commit -m "feat: integrate automatic background enrichment into LeadsGrid"
```
