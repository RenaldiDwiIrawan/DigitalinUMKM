# Enhanced Vercel Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve phone number extraction reliability and distance calculation accuracy for serverless execution on Vercel.

**Architecture:** Update the server action to accept coordinates from the frontend, prioritize these coordinates in the scraper's distance logic, and implement a multi-selector fallback system for phone extraction in the Google Maps detail panel.

**Tech Stack:** Next.js (Server Actions), Playwright (playwright-core), TypeScript.

---

### Task 1: Update Server Action Signature

**Files:**
- Modify: `src/app/actions.ts`

- [ ] **Step 1: Update `runScraper` to accept `lat` and `lng`**

```typescript
// src/app/actions.ts

export async function runScraper(
  query: string, 
  location: string, 
  limit: number = 10, 
  radius?: number, 
  shouldScrapeEmail: boolean = false,
  lat?: number,
  lng?: number
) {
  try {
    const results = await scrapeGoogleMaps({ query, location, limit, radius, shouldScrapeEmail, lat, lng });
    // ... rest of logic
```

- [ ] **Step 2: Commit**

```bash
git add src/app/actions.ts
git commit -m "feat: add lat/lng support to runScraper server action"
```

---

### Task 2: Refine Phone Extraction Regex

**Files:**
- Modify: `src/lib/utils/phone.ts`

- [ ] **Step 1: Update `extractBestPhone` regex**
Improve the regex to handle numbers with spaces between every digit (common in some listings).

```typescript
// src/lib/utils/phone.ts

export const extractBestPhone = (input: string): string | null => {
  if (!input) return null;
  
  // Refined regex to handle Indonesian formats and spaced-out numbers
  const phoneRegex = /(?:\+62|62|0)(?:\d{2,4})[\s.-]?(?:\d{3,5})[\s.-]?(?:\d{3,5})|(?:\+62|62|0)8[1-9][0-9]{7,11}|(\d\s?){10,13}/g;
  // ... rest of logic
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils/phone.ts
git commit -m "refactor: improve phone extraction regex for Indonesian formats"
```

---

### Task 3: Enhance Scraper Distance Logic

**Files:**
- Modify: `src/lib/scraper.ts`

- [ ] **Step 1: Update `ScrapeOptions` interface**
Add `lat` and `lng` to the options.

- [ ] **Step 2: Prioritize provided coordinates**
Modify `scrapeGoogleMaps` to use passed-in `lat`/`lng` instead of guessing from the URL.

```typescript
// src/lib/scraper.ts

// Inside scrapeGoogleMaps
let baseCoords: Coordinates = (lat !== undefined && lng !== undefined) 
  ? { lat, lng } 
  : { lat: -6.1751, lng: 106.8272 };

// Only try to extract from URL if lat/lng were NOT provided
if (lat === undefined) {
  const urlCoords = extractCoordsFromUrl(page.url());
  if (urlCoords) baseCoords = urlCoords;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/scraper.ts
git commit -m "feat: prioritize explicit coordinates for distance calculation"
```

---

### Task 4: Robust Detail Panel Extraction

**Files:**
- Modify: `src/lib/scraper.ts`

- [ ] **Step 1: Improve `waitForSelector` logic**
Wait for any indicator that the panel has loaded.

```typescript
// src/lib/scraper.ts:200
await page.waitForSelector('.DUwDvf, [data-item-id*="phone:tel:"], a[href^="tel:"]', { timeout: 10000 });
```

- [ ] **Step 2: Implement "Deep Content Scan" for phone numbers**
If the primary selector fails, scan the whole panel text.

```typescript
// src/lib/scraper.ts:214
const panelDetails = await page.evaluate(() => {
  // Existing selectors...
  let phone = ...;
  
  // Deep scan fallback
  if (!phone) {
    const detailPanel = document.querySelector('.bJzY7c, .m6qeH');
    if (detailPanel) {
      phone = window.extractBestPhone((detailPanel as HTMLElement).innerText);
    }
  }
  // ...
});
```

- [ ] **Step 3: Increase Viewport for Visibility Checks**
Ensure `offsetParent` works correctly in headless mode.

```typescript
// src/lib/scraper.ts:289
viewport: { width: 1280, height: 800 }
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scraper.ts
git commit -m "feat: implement robust phone extraction and Vercel-optimized viewport"
```

---

### Task 5: Verification and Final Polish

**Files:**
- Modify: `src/lib/scraper.ts`

- [ ] **Step 1: Implement coordinate extraction retry loop**
Wait for the Google Maps URL to update before extracting business coordinates.

```typescript
// src/lib/scraper.ts:202
let leadCoords: Coordinates | null = null;
for (let i = 0; i < 5; i++) { // Increased retries
  leadCoords = extractCoordsFromUrl(page.url());
  if (leadCoords) break;
  await page.waitForTimeout(1000); // 1s delay
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scraper.ts
git commit -m "feat: add retry loop for business coordinate extraction"
```
