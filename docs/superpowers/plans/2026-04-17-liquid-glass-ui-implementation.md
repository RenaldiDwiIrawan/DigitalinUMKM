# Liquid Glass UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DigitalinUMKM dashboard into a premium SaaS experience with Glassmorphism aesthetics and fluid micro-interactions.

**Architecture:** Use global CSS variables for the palette, `backdrop-filter` for glass effects, and `framer-motion` for spring-physics and staggered animations.

**Tech Stack:** Next.js (React), Tailwind CSS, Framer Motion, Lucide React.

---

### Task 1: Foundation & Typography

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Define CSS Variables**
Add the new Liquid Glass palette to `globals.css`.
```css
:root {
  --color-primary: #7C3AED;
  --color-secondary: #6366F1;
  --color-accent: #EC4899;
  --color-background: #FAF5FF;
  --color-glass-border: rgba(124, 58, 237, 0.1);
}
```

- [ ] **Step 2: Install Poppins Font**
Import Poppins and Open Sans in `layout.tsx` via `next/font`.

- [ ] **Step 3: Commit**
`git commit -m "style: define liquid glass palette and typography"`

### Task 2: Glass Navigation

**Files:**
- Modify: `src/components/dashboard/Navigation.tsx`

- [ ] **Step 1: Refactor Navigation Styling**
Apply `backdrop-blur-xl` and `bg-white/70`. Add thin iridescent border.

- [ ] **Step 2: Animate Logo Glow**
Add a subtle pulse animation to the Zap icon container.

- [ ] **Step 3: Commit**
`git commit -m "ui: implement glassmorphic sticky navigation"`

### Task 3: Dynamic Glass Header

**Files:**
- Modify: `src/components/dashboard/Header.tsx`

- [ ] **Step 1: Update Typography**
Use Poppins-Bold for query text. Increase size/weight.

- [ ] **Step 2: Add Animated Gradient Underline**
Implement a CSS/Framer Motion underline that expands when the query changes.

- [ ] **Step 3: Commit**
`git commit -m "ui: enhance header with dynamic glass aesthetics"`

### Task 4: Glass Leads Grid & Card

**Files:**
- Modify: `src/components/dashboard/LeadCard.tsx`
- Modify: `src/components/dashboard/LeadsGrid.tsx`

- [ ] **Step 1: Implement Glass LeadCard**
Update card base to `bg-white/40`, `backdrop-blur-md`, and `border-glass-border`.

- [ ] **Step 2: Staggered Entrance**
Wrap LeadCards in `framer-motion` `AnimatePresence`. Use `staggerChildren: 0.05`.

- [ ] **Step 3: Spring Hover States**
Add 400ms spring-easing `whileHover={{ y: -5, scale: 1.02 }}` to LeadCard.

- [ ] **Step 4: Commit**
`git commit -m "ui: implement glassmorphic cards with staggered motion"`

### Task 5: Interactive Feedback & Shimmers

**Files:**
- Modify: `src/components/dashboard/LeadsGrid.tsx`
- Create: `src/components/dashboard/LeadCardSkeleton.tsx`

- [ ] **Step 1: Create Skeleton Component**
Build a shimmering skeleton that mirrors the LeadCard layout.

- [ ] **Step 2: Integrated Loading State**
Update `LeadsGrid` to show the skeleton cards instead of a generic spinner.

- [ ] **Step 3: Commit**
`git commit -m "ux: add premium skeletal shimmers for loading states"`

### Task 6: Final Polish & UX Validation

- [ ] **Step 1: Scale Feedback**
Add `whileTap={{ scale: 0.98 }}` to all buttons.

- [ ] **Step 2: Performance Audit**
Verify 60fps on mobile browser. Check for layout shifts.

- [ ] **Step 3: Commit**
`git commit -m "ux: final interactions and performance polish"`
