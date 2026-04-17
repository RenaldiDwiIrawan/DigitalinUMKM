# WhatsApp Multi-Select & Outreach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to select multiple business leads and initiate outreach via WhatsApp using a pre-filled professional template.

**Architecture:** Use global state in `DashboardContext` to track selected leads and a new floating `OutreachBar` component for bulk actions.

**Tech Stack:** Next.js, React, Tailwind CSS, Lucide React icons.

---

### Task 1: Update DashboardContext

**Files:**
- Modify: `src/context/DashboardContext.tsx`

- [ ] **Step 1: Update state interface**
Add selection-related properties and methods to `DashboardState`.

```tsx
interface DashboardState {
  // ... existing ...
  selectionMode: boolean
  setSelectionMode: (mode: boolean) => void
  selectedLeadNames: string[]
  toggleLeadSelection: (name: string) => void
  clearSelection: () => void
}
```

- [ ] **Step 2: Implement selection logic**
Initialize state and provide methods in `DashboardProvider`.

```tsx
const [selectionMode, setSelectionMode] = useState(false)
const [selectedLeadNames, setSelectedLeadNames] = useState<string[]>([])

const toggleLeadSelection = (name: string) => {
  setSelectedLeadNames(prev => 
    prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
  )
}

const clearSelection = () => {
  setSelectedLeadNames([])
  setSelectionMode(false)
}

// Update resetDashboard to include clearSelection
const resetDashboard = () => {
  // ... existing ...
  clearSelection()
}
```

- [ ] **Step 3: Add Persistence**
Ensure selection state survives page refreshes.

```tsx
// Load from localStorage
const savedSelectionMode = localStorage.getItem('digitalin_selection_mode')
if (savedSelectionMode) setSelectionMode(JSON.parse(savedSelectionMode))

const savedSelectedLeadNames = localStorage.getItem('digitalin_selected_lead_names')
if (savedSelectedLeadNames) setSelectedLeadNames(JSON.parse(savedSelectedLeadNames))

// Save to localStorage in useEffect
localStorage.setItem('digitalin_selection_mode', JSON.stringify(selectionMode))
localStorage.setItem('digitalin_selected_lead_names', JSON.stringify(selectedLeadNames))
```

- [ ] **Step 4: Commit**

```bash
git add src/context/DashboardContext.tsx
git commit -m "feat: add selection state to DashboardContext"
```

---

### Task 2: Update LeadsGrid & LeadCard

**Files:**
- Modify: `src/components/dashboard/LeadsGrid.tsx`

- [ ] **Step 1: Add Selection Mode Toggle**
Add a button in the `LeadsGrid` header to toggle selection mode.

```tsx
const { selectionMode, setSelectionMode, selectedLeadNames, toggleLeadSelection } = useDashboard()

// ... in the header buttons area ...
<Button
  variant={selectionMode ? "default" : "outline"}
  size="sm"
  onClick={() => setSelectionMode(!selectionMode)}
  className={`h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
    selectionMode ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-gray-200 text-gray-600"
  }`}
>
  <CheckSquare className="w-3 h-3" />
  {selectionMode ? "Selesai Pilih" : "Pilih Massal"}
</Button>
```

- [ ] **Step 2: Update LeadCard click behavior**
Modify `LeadCard` to handle selection when mode is active.

```tsx
const isSelected = selectedLeadNames.includes(lead.name)

// Update Card onClick
onClick={() => {
  if (selectionMode) {
    toggleLeadSelection(lead.name)
  } else {
    setViewingLead(lead)
  }
}}

// Update visual state (blue border if selected)
className={`group bg-white hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between border-2 rounded-2xl h-full shadow-sm ${
  isSelected ? "border-blue-500 shadow-lg ring-4 ring-blue-500/10" : "border-gray-100"
}`}

// Add a checkmark indicator when selected
{isSelected && (
  <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
    <Check className="w-3 h-3" />
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/LeadsGrid.tsx
git commit -m "feat: implement selection UI in LeadsGrid and LeadCard"
```

---

### Task 3: Create OutreachBar Component

**Files:**
- Create: `src/components/dashboard/OutreachBar.tsx`

- [ ] **Step 1: Implement the floating bar**
Create a component that sticky stays at the bottom and handles WhatsApp logic.

```tsx
import { MessageCircle, X, ExternalLink } from "lucide-react"
// ... imports ...

export function OutreachBar() {
  const { selectedLeadNames, leads, clearSelection, selectionMode } = useDashboard()
  if (!selectionMode || selectedLeadNames.length === 0) return null

  const handleDirectWA = () => {
    selectedLeadNames.forEach(name => {
      const lead = leads.find(l => l.name === name)
      if (lead?.phone) {
        // Format message
        const message = `Halo *${lead.name}*, saya melihat bisnis Anda. Saya ingin menawarkan jasa pembuatan website profesional untuk membantu meningkatkan omzet Anda. Apakah Anda tertarik?`
        const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
      }
    })
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
            {selectedLeadNames.length}
          </div>
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-wider">Bisnis Terpilih</p>
            <p className="text-gray-400 text-[10px] font-medium">Siap untuk dihubungi via WhatsApp</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={clearSelection} variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
            <X className="w-4 h-4" />
          </Button>
          <Button onClick={handleDirectWA} className="h-10 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-500/20">
            <MessageCircle className="w-4 h-4" />
            Hubungi WA
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/OutreachBar.tsx
git commit -m "feat: add floating OutreachBar for WhatsApp bulk actions"
```

---

### Task 4: Integration & Verification

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add OutreachBar to the main page**
Import and place the `OutreachBar` at the bottom of the layout.

- [ ] **Step 2: Verification**
1. Click "Pilih Massal".
2. Click several business cards. Verify they highlight and the bar appears.
3. Verify the count in the bar matches your selection.
4. Click "Hubungi WA". Verify tabs open with the correct message.
5. Click "Reset" or "Clear". Verify all state is reset.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate OutreachBar into dashboard page"
```
