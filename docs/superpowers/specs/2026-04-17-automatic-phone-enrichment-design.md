# Spec: Automatic Background Phone Enrichment

**Date:** 2026-04-17
**Status:** Draft
**Topic:** Automatic fetching of missing phone numbers in search results.

## Overview
The goal is to automatically find missing phone numbers for businesses in the search results dashboard. Currently, if a phone number is not found during the initial "Fast Pass" scrape, the user must manually click "Cari Telp". This spec proposes a background enrichment system that triggers automatically.

## Requirements
1. **Zero-Click:** Missing phone numbers should start loading as soon as the business card appears.
2. **Immediate Display:** Business name and distance must show immediately; phone numbers can follow a few seconds later.
3. **Accuracy:** The enriched phone number must be verified against the business name and location.
4. **Reliability:** The system should handle network errors and rate limiting gracefully.

## Architecture

### 1. Global Queue Management (`DashboardContext`)
We will add state to manage the automatic enrichment process.
- `enrichmentQueue`: Array of business names currently waiting for enrichment.
- `processingLeads`: Set of lead names currently being processed.

### 2. Automatic Enrichment Hook (`useAutoEnrichment`)
A new hook will manage the background processing logic.
- **Trigger:** Fires whenever the `leads` array in `DashboardContext` is updated.
- **Logic:** 
  - Filters leads where `phone === null` and they aren't already in the queue or processed.
  - Adds them to the queue.
  - Processes the queue sequentially (FIFO) to avoid overwhelming the server.
  - Calls `/api/enrich` with `type: 'details'`.

### 3. UI Implementation (`LeadCard`)
- Update the phone number display area to show a "Searching..." state (pulsing text or small loader) when `processingLeads` contains the current business name.
- Transition smoothly from "Searching..." to the found number.

## Data Flow
1. User performs a search.
2. `scrapeGoogleMaps` returns a list of leads (some may have `phone: null`).
3. `DashboardContext` updates, triggering `useAutoEnrichment`.
4. `useAutoEnrichment` starts processing the first lead in the queue.
5. `POST /api/enrich` is called.
6. The backend performs a "Deep Search" for that specific business.
7. The result is returned and `onUpdateLead` updates the global state.
8. The UI re-renders with the new phone number.

## Performance Considerations
- **Concurrency:** We will process only **1 lead at a time** initially. We can increase this to 2-3 if testing shows the server handles it well.
- **Timeout:** Each enrichment call should have a reasonable timeout (e.g., 20s).
- **Persistence:** Enriched data will be saved to `localStorage` along with the original leads.

## Verification Plan
1. Search for a query known to have many results without immediate phone numbers (e.g., "Cafe" in a remote area).
2. Verify that cards appear immediately with "Telepon N/A" or "Searching...".
3. Verify that phone numbers begin to appear one-by-one.
4. Verify that manual "Cari Telp" still works and integrates with the queue.
