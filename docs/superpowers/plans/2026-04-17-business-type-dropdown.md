# Business Type Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Jenis Bisnis" text input with a dropdown containing predefined options (Cafe, Petshop, Klinik, Bengkell) and an "Other" option that reveals a custom text input.

**Architecture:** Use Radix UI Select primitive for the dropdown. Manage "Other" state locally within `ScraperForm.tsx` while syncing the actual search query to the global `form.query` state.

**Tech Stack:** Next.js, React, Tailwind CSS, Radix UI Select.

---

### Task 1: Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Radix UI Select**

Run: `npm install @radix-ui/react-select`
Expected: Success message from npm.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @radix-ui/react-select dependency"
```

---

### Task 2: UI Component - Select

**Files:**
- Create: `src/components/ui/select.tsx`

- [ ] **Step 1: Create the Select component**
Implement the standard Shadcn UI Select component using Radix primitives.

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-950 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-8 pr-2 text-sm font-bold text-gray-900 outline-none focus:bg-blue-50 focus:text-blue-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/select.tsx
git commit -m "feat: add Select UI component"
```

---

### Task 3: Update ScraperForm

**Files:**
- Modify: `src/components/dashboard/ScraperForm.tsx`

- [ ] **Step 1: Import Select components**
Add imports for the new Select component.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

- [ ] **Step 2: Implement "Other" logic and Dropdown**
Update the "Jenis Bisnis" section to use the dropdown.

```tsx
// Inside ScraperForm component
const businessOptions = ["Cafe", "Petshop", "Klinik", "Bengkell"];
const [isOther, setIsOther] = useState(!businessOptions.includes(form.query) && form.query !== "");

// Handle dropdown change
const handleSelectChange = (value: string) => {
  if (value === "other") {
    setIsOther(true);
    setForm({ ...form, query: "" });
  } else {
    setIsOther(false);
    setForm({ ...form, query: value });
  }
};

// ... in the JSX replacing the Input ...
<Select 
  value={isOther ? "other" : (businessOptions.includes(form.query) ? form.query : "")} 
  onValueChange={handleSelectChange}
>
  <SelectTrigger className="h-12 pl-11">
    <SelectValue placeholder="Pilih Jenis Bisnis" />
  </SelectTrigger>
  <SelectContent>
    {businessOptions.map((opt) => (
      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
    ))}
    <SelectItem value="other">Lainnya (Isi sendiri)</SelectItem>
  </SelectContent>
</Select>

{isOther && (
  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
    <Input
      type="text"
      value={form.query}
      onChange={(e) => setForm({ ...form, query: e.target.value })}
      placeholder="Masukkan jenis bisnis..."
      required
      className="h-12"
    />
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ScraperForm.tsx
git commit -m "feat: implement business type dropdown with other option"
```

---

### Task 4: Verification

- [ ] **Step 1: Test predefined options**
Select "Cafe" from the dropdown. Verify `form.query` updates and the search works.

- [ ] **Step 2: Test "Other" option**
Select "Other" from the dropdown. Verify text input appears. Type "Restoran". Verify `form.query` updates.

- [ ] **Step 3: Test Persistence**
Select an option or type in "Other", then refresh the page. Verify the selection is preserved.

- [ ] **Step 4: Test Reset**
Click the "Reset" button. Verify the dropdown and custom input are cleared.
