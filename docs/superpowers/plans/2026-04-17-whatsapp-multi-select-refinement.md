# WhatsApp Multi-Select (Refinement & Queue) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the multi-select WhatsApp feature by fixing browser popup blocking (using a queue), enhancing phone number formatting for Indonesia, and optimizing UI performance.

**Architecture:** Use a queue-based outreach in `OutreachBar` to bypass popup blocks. Optimize `LeadsGrid` rendering to handle large result sets.

**Tech Stack:** Next.js, React, Tailwind CSS.

---

### Task 1: Phone Formatting & Performance Optimization

**Files:**
- Modify: `src/lib/utils.ts`
- Modify: `src/components/dashboard/LeadsGrid.tsx`

- [x] **Step 1: Add phone formatting helper**
Add a robust formatter in `src/lib/utils.ts` to handle Indonesian country codes.

```tsx
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}
```

- [x] **Step 2: Optimize LeadsGrid rendering**
Pass only necessary props to `LeadCard` to prevent full grid re-renders on every selection change.

```tsx
// Inside LeadsGrid.tsx
{leads.map((lead, index) => (
  <LeadCard
    key={lead.name} // Use name as key
    lead={lead}
    isSelected={selectedLeadNames.includes(lead.name)}
    selectionMode={selectionMode}
    onToggle={() => toggleLeadSelection(lead.name)}
    // ... other props ...
  />
))}
```

- [x] **Step 3: Commit**

```bash
git add src/lib/utils.ts src/components/dashboard/LeadsGrid.tsx
git commit -m "perf: optimize lead grid rendering and add phone formatter"
```

---

### Task 2: Implement "Send Next" Queue in OutreachBar

**Files:**
- Modify: `src/components/dashboard/OutreachBar.tsx`

- [x] **Step 1: Implement Queue state and logic**
Update `OutreachBar` to track the current index and provide a "Send Next" workflow.

```tsx
const [currentIndex, setCurrentIndex] = useState(0);

// Reset index if selection changes significantly
useEffect(() => {
  if (currentIndex >= selectedLeadNames.length) {
    setCurrentIndex(0);
  }
}, [selectedLeadNames.length]);

const handleSendNext = () => {
  const name = selectedLeadNames[currentIndex];
  const lead = leads.find(l => l.name === name);
  if (lead?.phone) {
    const phone = formatPhoneNumber(lead.phone);
    const message = `Halo *${lead.name}*, saya melihat bisnis Anda di *${form.location}*. Saya ingin menawarkan jasa pembuatan website profesional untuk membantu meningkatkan omzet Anda. Apakah Anda tertarik?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Advance queue
    if (currentIndex < selectedLeadNames.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }
};
```

- [x] **Step 2: Update UI for Queue**
Show "1 of 5" and a prominent "Hubungi [Nama]" button.

```tsx
<div className="flex-1">
  <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">
    Queue Outreach ({currentIndex + 1} dari {selectedLeadNames.length})
  </p>
  <p className="text-blue-400 text-xs font-bold truncate">
    Penerima: {selectedLeadNames[currentIndex]}
  </p>
</div>

<Button onClick={handleSendNext} className="...">
  {currentIndex === selectedLeadNames.length - 1 ? 'Kirim Terakhir' : 'Kirim & Lanjut'}
</Button>
```

- [x] **Step 3: Commit**

```bash
git add src/components/dashboard/OutreachBar.tsx
git commit -m "feat: implement outreach queue to prevent browser popup blocking"
```

---

### Task 3: Final Verification

- [x] **Step 1: Test Queue Workflow**
1. Select 3 leads.
2. Click "Kirim & Lanjut". Verify the correct WA tab opens.
3. Verify the bar updates to "2 dari 3" and shows the next business name.
4. Verify all 3 can be sent sequentially.

- [x] **Step 2: Verify Phone Formatting**
Ensure a number starting with `0812...` becomes `62812...` in the WhatsApp link.

- [x] **Step 3: Commit**

```bash
git commit -m "test: verify outreach queue and phone formatting"
```
