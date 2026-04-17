# Spec: Liquid Glass UI/UX Enhancement - DigitalinUMKM

## 1. Vision & Strategy
Combine high-end **Glassmorphism** aesthetics with **Fluid Micro-interactions** to create a "premium SaaS" experience. The goal is to make every interaction feel smooth, intentional, and high-quality, reflecting the power of the underlying AI and scraping technology.

## 2. Visual Design System (Liquid Glass)
- **Palette**:
  - Primary: `#7C3AED` (AI Purple)
  - Secondary: `#6366F1` (Indigo Flow)
  - Accent: `#EC4899` (Generation Pink)
  - Background: `#FAF5FF` (Soft Lavender tint)
- **Aesthetics**:
  - `backdrop-filter: blur(20px)` on all primary containers (Nav, Sidebar, Cards).
  - Subtle semi-transparent borders (`rgba(124, 58, 237, 0.1)`).
  - Soft, expansive shadows for depth.
- **Typography**:
  - Primary: **Poppins** (Headings, Buttons).
  - Secondary: **Open Sans** (Body, Data).

## 3. Component Specifications

### 3.1 Navigation & Layout
- **Glass Header**: Sticky position with a dynamic blur effect.
- **Iridescent Logo**: Zap icon with a soft purple glow/pulse.
- **Smooth Page Transitions**: Morphing backgrounds when switching between dashboard and templates.

### 3.2 Search & Header
- **Dynamic Headlines**: Search queries highlighted with animated gradient underlines.
- **Typography Hierarchy**: Use bold Poppins for high-impact status messages.

### 3.3 Leads Grid & LeadCard
- **Entrance Animation**: Staggered fade-and-slide entry (50ms delay per card).
- **Spring Motion**: 400ms duration with `spring` easing for hover lifts.
- **Glassmorphic Cards**: White semi-transparent base with soft shadows.
- **Skeleton Shimmers**: Custom skeletal loaders that match the exact shape of LeadCards during data fetching.

## 4. Interaction Patterns
- **Physical Feedback**: 0.98x scale-down on button/card click.
- **State Continuity**: Smooth transitions between "Searching", "Enriching", and "Completed" states using cross-fades.
- **Responsive Targets**: Minimum 44px hit areas for all interactive elements.

## 5. Implementation Roadmap
1. **Global Styles**: Update `globals.css` with color tokens and Poppins font.
2. **Layout Foundation**: Refactor `Navigation.tsx` and `Header.tsx` for glass effects.
3. **Motion Integration**: Add `framer-motion` for staggered grid entrance and hover states.
4. **Component Polish**: Refactor `LeadCard.tsx` and `LeadsGrid.tsx` with new aesthetics and shimmers.

## 6. Success Criteria
- [ ] Dashboard feels "premium" and fast.
- [ ] Animations are smooth (60fps) and non-blocking.
- [ ] Light/Dark mode contrast meets WCAG 4.5:1 for primary text.
- [ ] No layout shifts during state transitions.
