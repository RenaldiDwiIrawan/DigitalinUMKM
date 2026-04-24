# Design Spec: Enhanced Scraper Logic for Vercel

This document outlines the design for improving phone number extraction and distance calculation accuracy, specifically optimized for serverless execution on Vercel.

## 1. Problem Statement

The current scraper implementation suffers from two primary issues when running on Vercel:
1.  **Inaccurate Distance**: The `runScraper` action lacks latitude/longitude inputs, causing it to default to Jakarta coordinates. This leads to incorrect distance calculations for any search outside Jakarta.
2.  **Missing Phone Numbers**: The extraction logic relies on a single panel selector (`.DUwDvf`) and a visibility check (`offsetParent !== null`) that can be inconsistent due to the high-latency, headless environment of Vercel.

## 2. Proposed Changes

### 2.1. Explicit Geo-Context (Accuracy Fix)
*   **Action Update**: Modify `runScraper` in `src/app/actions.ts` to accept `lat?: number` and `lng?: number`.
*   **Interface Update**: Update `ScrapeOptions` in `src/lib/scraper.ts` to ensure `lat` and `lng` are prioritized over URL-based coordinate extraction.
*   **Coordinate Stability**: When `lat` and `lng` are provided, the scraper will use them as the fixed "Zero Point" for all distance calculations using the Haversine formula.

### 2.2. Enhanced Phone Extraction (Reliability Fix)
*   **Robust Selectors**: Expand phone extraction to target multiple attributes:
    *   `[data-item-id*="phone:tel:"]` (Primary)
    *   `a[href^="tel:"]` (Fallback 1)
    *   `button[aria-label*="Phone"], button[aria-label*="Telepon"]` (Fallback 2)
*   **Deep Content Scan**: If specific selectors fail, perform a `page.evaluate` scan of the entire detail panel's text content using the `extractBestPhone` utility.
*   **Improved Wait Conditions**: Replace `page.waitForSelector('.DUwDvf')` with an `anyOf` wait condition that proceeds once either the phone, website, or address container is detected.

### 2.3. Vercel-Specific Optimizations
*   **Viewport Consistency**: Set a fixed, large viewport (1280x800) during browser launch to ensure "visibility" checks (`offsetParent`) work consistently in headless mode.
*   **URL Timing**: Implement a retry loop for `extractCoordsFromUrl` to account for the delay in Google Maps URL updates after a business is clicked.

## 3. Data Flow

1.  **Frontend**: Detects user location or uses map center -> calls `runScraper(query, location, limit, radius, shouldScrapeEmail, lat, lng)`.
2.  **Server Action**: Passes `lat`/`lng` to `scrapeGoogleMaps`.
3.  **Scraper**:
    *   Launches Playwright (Optimized for Vercel).
    *   Performs search.
    *   Extracts leads.
    *   For each lead:
        *   Extracts coordinates from the URL/metadata.
        *   Calculates distance from the **provided** `lat`/`lng`.
        *   If phone is missing from list view, clicks to detail panel.
        *   Uses "Robust Scan" to find the phone number in the panel.
4.  **Frontend**: Receives accurate leads with reliable contact info and correct distance.

## 4. Success Criteria

*   **Distance Accuracy**: Distance for searches outside Jakarta (e.g., Bandung) must match the actual distance from the search center.
*   **Phone Recovery**: At least 20% increase in phone number capture rate for listings that have numbers available on Google Maps.
*   **Vercel Stability**: 0% "Coordinate Extraction" failures in serverless logs.
