import { chromium as playwright, BrowserContext, Page, Browser } from 'playwright-core';

// We'll dynamically import playwright and @sparticuz/chromium based on environment
async function getBrowser(): Promise<Browser> {
  // Option 1: Remote Browser (Recommended for Production)
  if (process.env.BROWSER_WS_ENDPOINT) {
    console.log('Connecting to remote browser...');
    return await playwright.connectOverCDP(process.env.BROWSER_WS_ENDPOINT);
  }

  // Option 2: Vercel / Serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('Detected serverless environment (Vercel/Lambda).');
    try {
      const chromium = (await import('@sparticuz/chromium-min')).default;

      // Try to find executable path.
      // We'll try to use a known stable version if the default fails.
      let executablePath: string;
      try {
        executablePath = await chromium.executablePath();
      } catch {
        console.log('Default executable path failed, trying with remote pack...');
        executablePath = await chromium.executablePath(
          'https://github.com/sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar'
        );
      }

      console.log('Launching playwright-core with executablePath:', executablePath);
      return await playwright.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    } catch (error: any) {
      console.error('CRITICAL: Failed to launch serverless chromium:', error);

      // Provide fallback to connection if endpoint exists
      if (process.env.BROWSER_WS_ENDPOINT) {
        return await playwright.connectOverCDP(process.env.BROWSER_WS_ENDPOINT);
      }

      // Throw a more descriptive error so the user can see what's wrong
      throw new Error(`Browser launch failed: ${error.message || 'Unknown error'}. Check Vercel logs for stack trace.`);
    }
  }

  // Option 3: Local environment
  console.log('Launching browser in local environment...');
  try {
    // Attempt to use local playwright installation
    // We try to import the full 'playwright' package if available locally for convenience
    const { chromium } = await import('playwright');
    return await chromium.launch({ headless: true });
  } catch (error) {
    // Fallback to playwright-core if 'playwright' is not installed
    return await playwright.launch({ headless: true });
  }
}

export interface ScrapeResult {
  name: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  distance: string | null;
}

export interface ScrapeOptions {
  query: string;
  location: string;
  limit?: number;
  radius?: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Extracts coordinates from a Google Maps URL.
 */
function extractCoordsFromUrl(url: string): Coordinates | null {
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };
  }
  return null;
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula.
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Tries to find an email address on a given website URL.
 */
async function findEmailFromWebsite(context: BrowserContext, url: string): Promise<string | null> {
  if (!url) return null;

  const page = await context.newPage();
  // Block unnecessary resources to speed up loading
  await page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2,ttf,otf,ico,pdf,zip}', (route) => route.abort());

  const searchEmails = async (targetUrl: string) => {
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const found = await page.evaluate(() => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        // Search in text but exclude common noise
        const text = document.body.innerText;
        const matches = text.match(emailRegex);
        if (!matches) return null;

        return Array.from(new Set(matches)).find(email => {
          const lower = email.toLowerCase();
          return !lower.includes('sentry') && !lower.includes('example') && !lower.includes('.png') && !lower.includes('.jpg');
        });
      });
      return found;
    } catch {
      return null;
    }
  };

  try {
    let email = await searchEmails(url);

    // If not found on home page, try common contact subpages
    if (!email) {
      const baseUrl = new URL(url).origin;
      const contactUrls = [`${baseUrl}/contact`, `${baseUrl}/kontak`, `${baseUrl}/about`].filter(u => u !== url);

      for (const contactUrl of contactUrls) {
        email = await searchEmails(contactUrl);
        if (email) break;
      }
    }

    await page.close();
    return email || null;
  } catch (error) {
    await page.close();
    return null;
  }
}

/**
 * Handles scrolling in the Google Maps results panel to load more items.
 */
async function scrollResults(page: Page, limit: number): Promise<void> {
  const scrollContainerSelector = 'div[role="feed"], div[aria-label^="Results"], .m6qeH.tL9Q4c';
  const maxScrollAttempts = 20;
  let scrollAttempts = 0;

  console.log(`Mulai scrolling untuk mencari hingga ${limit} data...`);

  while (scrollAttempts < maxScrollAttempts) {
    const itemsCount = (await page.$$('div[role="article"]')).length;
    if (itemsCount >= limit * 1.5) break;

    const isEndReached = await page.evaluate(() => {
      const endText = document.body.innerText;
      return endText.includes("You've reached the end of the list.") ||
             endText.includes("Hasil akhir daftar") ||
             endText.includes("Tidak ada hasil lagi");
    });

    if (isEndReached) break;

    await page.evaluate((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.scrollTop += 1500;
      } else {
        window.scrollBy(0, 1500);
      }
    }, scrollContainerSelector);

    await page.waitForTimeout(2000);
    scrollAttempts++;
  }
}

/**
 * Extracts basic details for a single lead from the Google Maps interface.
 */
async function extractLeadDetails(page: Page, item: any, baseCoords: Coordinates | null): Promise<ScrapeResult | null> {
  try {
    const name = (await item.getAttribute('aria-label')) || 'Unknown';

    // Get fallback details from list view before clicking
    const listDetails = await item.evaluate((el: HTMLElement) => {
      const text = el.innerText;
      const phoneMatch = text.match(/(\+62|08)\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4}/);
      // Try to get distance from text (e.g. "1.2 km")
      const distanceMatch = text.match(/\d+([.,]\d+)?\s*(km|m)\b/i);

      const webBtn = el.querySelector('a[href*="http"]');
      let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
      if (website && (website.includes('google.com/maps') || website.includes('javascript:'))) {
        website = null;
      }

      return {
        phone: phoneMatch ? phoneMatch[0] : null,
        website,
        distance: distanceMatch ? distanceMatch[0] : null
      };
    });

    await item.click();

    // Wait for the detail panel to update and URL to contain coordinates
    try {
      await page.waitForSelector('h1.DUwDvf', { timeout: 5000 });
      // Small delay to allow URL to update with place coordinates
      await page.waitForTimeout(1000);
    } catch (e) {
      return { name, ...listDetails, email: null };
    }

    const currentUrl = page.url();
    const leadCoords = extractCoordsFromUrl(currentUrl);

    let distance = listDetails.distance;
    if (baseCoords && leadCoords) {
      const distKm = calculateDistance(baseCoords, leadCoords);
      distance = distKm < 1
        ? `${(distKm * 1000).toFixed(0)} m`
        : `${distKm.toFixed(1)} km`;
    }

    const panelDetails = await page.evaluate(() => {
      const phoneBtn = Array.from(document.querySelectorAll('button, a, span')).find(el => {
        const label = (el as HTMLElement).getAttribute('aria-label') || '';
        const text = (el as HTMLElement).innerText || '';
        const itemId = (el as HTMLElement).getAttribute('data-item-id') || '';

        return (
          /phone|telepon/i.test(label) ||
          /phone|telepon/i.test(itemId) ||
          /^[\d\s\-\+\(\)]{10,}$/.test(text.replace(/\s/g, ''))
        );
      });

      const webBtn = document.querySelector('a[data-item-id="authority"], a[aria-label*="Website"], a[aria-label*="Situs"], a[href*="http"]');

      let phone = phoneBtn ? (phoneBtn as HTMLElement).innerText.trim() : null;
      // Clean phone number from strange characters like \uE0B0
      if (phone) {
        phone = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();
      }

      let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
      if (website && (website.includes('google.com/maps') || website.includes('javascript:'))) {
        website = null;
      }

      return { phone, website };
    });

    return {
      name,
      phone: panelDetails.phone || listDetails.phone,
      website: panelDetails.website || listDetails.website,
      distance,
      email: null
    };
  } catch (error) {
    console.error(`Error processing item:`, error);
    return null;
  }
}

/**
 * Main function to scrape Google Maps leads.
 */
export async function scrapeGoogleMaps({
  query,
  location,
  limit = 10,
  radius
}: ScrapeOptions): Promise<ScrapeResult[]> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  const searchQuery = radius ? `${query} near ${location} radius:${radius}km` : `${query} ${location}`;
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

  try {
    await page.goto(searchUrl);
    await page.waitForSelector('div[role="article"]', { timeout: 15000 });

    // Try to get base coordinates from the initial search URL
    // We wait a bit to ensure the map center is updated
    await page.waitForTimeout(2000);
    const baseCoords = extractCoordsFromUrl(page.url());
    if (baseCoords) {
      console.log(`Titik acuan lokasi ditemukan: ${baseCoords.lat}, ${baseCoords.lng}`);
    }

    await scrollResults(page, limit);

    const items = await page.$$('div[role="article"]');
    if (items.length === 0) {
      throw new Error(`Tidak ditemukan hasil untuk "${query}" di "${location}".`);
    }

    const leads: ScrapeResult[] = [];
    const seenNames = new Set<string>();

    for (const item of items) {
      if (leads.length >= limit) break;

      const lead = await extractLeadDetails(page, item, baseCoords);
      if (lead && !seenNames.has(lead.name)) {
        seenNames.add(lead.name);
        leads.push(lead);
      }
    }

    // Phase 2: Enrich with emails in parallel
    const concurrencyLimit = 3;
    for (let i = 0; i < leads.length; i += concurrencyLimit) {
      const batch = leads.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map(async (lead) => {
        if (lead.website) {
          lead.email = await findEmailFromWebsite(context, lead.website);
        }
      }));
    }

    await browser.close();
    return leads;

  } catch (error: any) {
    console.error('Terjadi kesalahan saat scraping:', error.message);
    await browser.close();
    throw error;
  }
}
