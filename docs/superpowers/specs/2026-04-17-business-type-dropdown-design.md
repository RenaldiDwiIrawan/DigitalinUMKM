# Design Spec: Business Type Dropdown for Dashboard

## Overview
Change the "Jenis Bisnis" (Business Type) text input in the Lead Generation Dashboard to a dropdown with predefined options and an "Other" option for custom input.

## Goals
- Improve user experience by providing common business categories.
- Maintain flexibility by allowing custom business types.
- Ensure visual consistency with the existing dashboard UI.

## Architecture & Components

### 1. UI Components
- **`src/components/ui/select.tsx`**: New component based on Radix UI / Shadcn UI patterns. This will provide the dropdown interface.
- **`src/components/dashboard/ScraperForm.tsx`**: Update this component to:
    - Replace the `<Input />` for "Jenis Bisnis" with the new `<Select />` component.
    - Add logic to show a conditional text input when "Other" is selected.

### 2. State Management
- Continue using `form.query` from `DashboardContext` as the source of truth for the search query.
- Add local state in `ScraperForm` to track if the current selection is a predefined option or "Other".

## Data Flow
1. User clicks the "Jenis Bisnis" dropdown.
2. User selects an option (e.g., "Cafe").
3. `form.query` is updated with the selected value.
4. If user selects "Other":
    - A text input appears below the dropdown.
    - `form.query` is updated as the user types in this text input.

## Implementation Plan

### Step 1: Add Select Component
Install `@radix-ui/react-select` (if not present) and create `src/components/ui/select.tsx`.

### Step 2: Update ScraperForm
- Import `Select` components.
- Define constants for predefined options: `['Cafe', 'Petshop', 'Klinik', 'Bengkell']`.
- Implement conditional rendering for the custom input.

## Testing Criteria
- Selecting a predefined option correctly updates the search query.
- Selecting "Other" shows the custom text input.
- Typing in the custom text input correctly updates the search query.
- Resetting the form clears both the dropdown and the custom input.
- Selection persists after page refresh (via existing `DashboardContext` logic).
