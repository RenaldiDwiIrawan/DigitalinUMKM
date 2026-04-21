# Scraper Enhancements: Strict Radius & Paginated Dashboard

**Date**: 2026-04-22  
**Status**: Draft  
**Topic**: Enhancing Google Maps scraper accuracy and dashboard UI pagination.

## 1. Executive Summary
This spec outlines the implementation of strict radius filtering and a paginated dashboard view. It aims to solve two primary user issues:
1. Results appearing outside the requested search radius.
2. The dashboard showing a single long list instead of manageable pages, while hitting a hard limit of 10 results due to Vercel timeouts.

## 2. Technical Architecture

### 2.1 Backend: Strict Radius Filtering (`src/lib/scraper.ts`)
Currently, the scraper relies on Google Maps' `radius:` query parameter, which is often treated as a suggestion rather than a hard limit.
- **Change**: Implement a post-scrape filter using the Haversine distance formula.
- **Logic**:
  - Extract coordinates for every lead found.
  - Calculate distance from the search center (`lat`, `lng`).
  - Discard any lead where `distance > requestedRadius`.
  - The scraper will continue to "dig deeper" (scroll/extract) until the `limit` of *valid* leads is reached or a 10s timeout is imminent.

### 2.2 API: Batching & Vercel Stability (`src/app/api/scrape/route.ts`)
- **Change**: Maintain the 10-item `safeLimit` per request to prevent Vercel Free tier timeouts (10s).
- **Change**: Improve streaming response (NDJSON) to provide real-time updates to the frontend.

### 2.3 Frontend: Paginated UI (`src/components/dashboard/LeadsGrid.tsx`)
- **Change**: Implement client-side pagination.
- **Logic**:
  - `ITEMS_PER_PAGE = 10`.
  - State: `currentPage`.
  - `displayedLeads = leads.slice((currentPage - 1) * 10, currentPage * 10)`.
- **UI Elements**:
  - Pagination bar with "Liquid Glass" styling.
  - "Previous" and "Next" buttons.
  - Page number indicators.
  - Dynamic status showing "Showing X-Y of Z leads".

### 2.4 State Management (`src/context/DashboardContext.tsx`)
- **Change**: Ensure `setLeads` deduplicates incoming leads by `name` and `phone` to prevent Page 1/Page 2 collisions.

## 3. User Experience (UX)
1. User enters a query, location, and radius (e.g., 5km) and limit (e.g., 30).
2. The system starts searching.
3. Page 1 (first 10 valid leads) fills up.
4. The system automatically continues in the background to find Page 2 and Page 3.
5. User can click through pages even while the search is ongoing.
6. Only leads strictly within 5km are shown.

## 4. Error Handling
- **Timeout**: If a batch request times out, the frontend will retry with the current offset.
- **No Results**: If strict filtering discards all results in a batch, the scraper will recursively try the next batch until the limit is met or no more results exist on Google Maps.

## 5. Success Criteria
- [ ] Results show a distance value and are all within the requested radius.
- [ ] Dashboard displays exactly 10 items per page.
- [ ] Total items found can exceed 10 (up to the user's requested limit).
- [ ] No duplicates between pages.
- [ ] App remains stable on Vercel without 504 Gateway Timeouts.
