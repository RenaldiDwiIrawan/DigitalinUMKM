# Design Spec: WhatsApp Multi-Select & Lead Outreach

## Overview
Implement a "Selection Mode" in the Lead Generation Dashboard that allows users to select multiple business leads and initiate outreach via WhatsApp using a pre-filled professional template.

## Goals
- Enable bulk outreach to potential clients.
- Provide a professional message template for website development services.
- Improve workflow efficiency for lead conversion.

## Architecture & Components

### 1. State Management (`DashboardContext.tsx`)
- **`selectionMode` (boolean)**: Tracks whether the dashboard is in "Selection Mode".
- **`selectedLeadNames` (string[])**: Stores the names (or unique identifiers) of currently selected leads.
- **Action creators**: `toggleSelectionMode`, `toggleLeadSelection`, `clearSelection`.

### 2. UI Components
- **`src/components/dashboard/LeadsGrid.tsx`**:
    - Add a "Selection Mode" toggle button in the header.
    - Update `LeadCard` to support a "selected" visual state and click-to-toggle logic when selection mode is active.
- **`src/components/dashboard/OutreachBar.tsx`** (New):
    - A floating, sticky bar at the bottom of the screen.
    - Displays the count of selected leads.
    - Contains the "Direct to WhatsApp" action button.

### 3. Outreach Logic
- **WhatsApp URL Generator**: A utility to generate `wa.me` links with encoded messages.
- **Template**:
    ```text
    Halo *[Nama Bisnis]*, saya melihat bisnis Anda di *[Lokasi]*. 
    
    Saya ingin menawarkan jasa pembuatan website profesional untuk membantu meningkatkan visibilitas dan omzet bisnis Anda secara digital. 
    
    Apakah Anda tertarik untuk melihat contoh website premium yang kami buat khusus untuk kategori bisnis Anda?
    ```
- **Execution**: Loop through `selectedLeadNames`, find their phone numbers, and call `window.open(url, '_blank')`.

## Implementation Plan

### Step 1: Update DashboardContext
Add selection state and persistence to `localStorage`.

### Step 2: Update LeadsGrid & LeadCard
Implement the toggle and selection UI.

### Step 3: Create OutreachBar
Build the floating action component with WhatsApp logic.

## Testing Criteria
- Selection mode correctly toggles card behavior.
- Selected leads are visually highlighted.
- Floating bar appears/disappears correctly based on selection count.
- WhatsApp links correctly include the business name and professional message.
- "Reset" correctly clears all selection state.
