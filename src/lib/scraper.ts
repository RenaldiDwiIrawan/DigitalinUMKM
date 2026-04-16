import { chromium as playwright, BrowserContext, Page, Browser, Locator } from 'playwright-core';
import { getBrowser } from './browser';

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
  lat?: number;
  lng?: number;
  limit?: number;
  radius?: number;
  offset?: number;
  onLeadFound?: (lead: ScrapeResult) => void;
  shouldScrapeEmail?: boolean;
}

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Extracts coordinates from a Google Maps URL.
 * Handles both @lat,lng and !3dlat!4dlng formats.
 */
function extractCoordsFromUrl(url: string): Coordinates | null {
  // Format 1: @lat,lng
  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1) {
    return {
      lat: parseFloat(match1[1]),
      lng: parseFloat(match1[2])
    };
  }

  // Format 2: !3dlat!4dlng (often used in business/place URLs)
  const latMatch = url.match(/!3d(-?\d+\.\d+)/);
  const lngMatch = url.match(/!4d(-?\d+\.\d+)/);
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[2])
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
export async function findEmailFromWebsite(context: BrowserContext, url: string): Promise<string | null> {
  if (!url) return null;

  const page = await context.newPage();
  // Block unnecessary resources to speed up loading
  await page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2,ttf,otf,ico,pdf,zip}', (route) => route.abort());

  const searchEmails = async (targetUrl: string) => {
    try {
      // Increased timeout and changed waitUntil for better compatibility
      await page.goto(targetUrl, { waitUntil: 'load', timeout: 20000 });
      // Small delay for dynamic content
      await page.waitForTimeout(1000);

      const found = await page.evaluate(() => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        // Search in text and in href="mailto:..."
        const text = document.body.innerText;
        const html = document.body.innerHTML;
        const combinedText = text + ' ' + html;
        const matches = combinedText.match(emailRegex);
        if (!matches) return null;

        return Array.from(new Set(matches)).find(email => {
          const lower = email.toLowerCase();
          // Exclude noise
          return (
            !lower.includes('sentry') &&
            !lower.includes('example') &&
            !lower.includes('wix.com') &&
            !lower.includes('.png') &&
            !lower.includes('.jpg') &&
            !lower.includes('.jpeg') &&
            !lower.includes('.svg')
          );
        });
      });
      return found;
    } catch (error) {
      console.log(`Failed to scrape ${targetUrl}:`, error);
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
    if (!page.isClosed()) await page.close();
    return null;
  }
}

/**
 * Handles scrolling in the Google Maps results panel to load more items.
 */
async function scrollResults(page: Page, limit: number): Promise<boolean> {
  const scrollContainerSelector = 'div[role="feed"], div[aria-label^="Results"], .m6qeH.tL9Q4c';
  const maxScrollAttempts = 25; // Increased to handle larger limits
  let scrollAttempts = 0;
  let lastCount = 0;
  let stagnantAttempts = 0;
  let reachedEnd = false;

  console.log(`Turbo Scrolling: mencari hingga ${limit} data...`);

  while (scrollAttempts < maxScrollAttempts) {
    const itemsCount = (await page.$$('div[role="article"]')).length;
    if (itemsCount >= limit) break;

    // Detect if we are stuck
    if (itemsCount === lastCount) {
      stagnantAttempts++;
      if (stagnantAttempts > 3) break; // Stop if no new items after 3 scrolls
    } else {
      stagnantAttempts = 0;
    }
    lastCount = itemsCount;

    reachedEnd = await page.evaluate(() => {
      const endText = document.body.innerText;
      return endText.includes("reached the end") ||
             endText.includes("Hasil akhir") ||
             endText.includes("Tidak ada hasil lagi") ||
             !!document.querySelector('.HlvSq'); // End of results indicator
    });

    if (reachedEnd) break;

    await page.evaluate((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.scrollTop += 3000; // Slightly less aggressive to trigger lazy load reliably
      } else {
        window.scrollBy(0, 3000);
      }
    }, scrollContainerSelector);

    // Wait slightly longer for content to load
    await page.waitForTimeout(600);
    scrollAttempts++;
  }

  return reachedEnd;
}

/**
 * Extracts basic details for a single lead from the Google Maps interface.
 */
async function extractLeadDetails(page: Page, item: Locator, baseCoords: Coordinates | null): Promise<ScrapeResult | null> {
  try {
    // Playwright Locators handle auto-retrying for basic attributes
    const name = (await item.getAttribute('aria-label')) || 'Unknown';

    // Get fallback details from list view before clicking
    const listDetails = await item.evaluate((el: HTMLElement) => {
      const text = el.innerText;
      const ariaLabel = el.getAttribute('aria-label') || '';
      const fullContent = ariaLabel + ' ' + text;

      // Robust Indonesian phone regex including mobile and landline
      const phoneRegex = /(?:\+62|62|0)(?:\d{2,4})[\s.-]?(?:\d{3,5})[\s.-]?(?:\d{3,5})|(?:\+62|62|0)8[1-9][0-9]{7,11}/g;
      const matches = fullContent.match(phoneRegex);
      let phoneMatch = null;

      if (matches) {
        // Priority matching to avoid metadata garbage
        const prioritizedMatches = matches.sort((a, b) => {
          const score = (s: string) => {
            const digits = s.replace(/[^\d]/g, '');
            if (s.startsWith('+62') || s.startsWith('62')) return 100;
            if (s.startsWith('08')) return 90;
            if (digits.length >= 10) return 80;
            return digits.length;
          };
          return score(b) - score(a);
        });

        phoneMatch = prioritizedMatches.find(m => {
          const digits = m.replace(/[^\d]/g, '');
          return digits.length >= 7 && !/^19\d{2}$|^20\d{2}$/.test(digits);
        }) || null;
      }

      const distanceMatch = text.match(/\d+([.,]\d+)?\s*(km|m)\b/i);

      // Extract website ONLY if it looks like a dedicated website button (globe icon link)
      // We look for links with specific aria-labels that Google uses in the list view
      const webBtn = el.querySelector('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-value="Website"]');
      let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;

      if (website && (
        website.includes('google.com/maps') ||
        website.includes('google.com/search') ||
        website.includes('javascript:') ||
        website.includes('arenacorp.com') // Specifically exclude portal domains as requested
      )) {
        website = null;
      }

      return {
        phone: phoneMatch ? phoneMatch[0] : null,
        website,
        distance: distanceMatch ? distanceMatch[0] : null
      };
    }).catch(err => {
      console.warn(`Evaluation failed for ${name}:`, err.message);
      return { phone: null, website: null, distance: null };
    });

    // OPTIMIZATION: If we already have phone and website from the list view,
    // we can skip the expensive click and panel wait to save time on Vercel.
    if (listDetails.phone && listDetails.website) {
      console.log(`[Fast Pass] Found details in list view for ${name}`);
      return {
        name,
        phone: listDetails.phone,
        website: listDetails.website,
        distance: listDetails.distance,
        email: null
      };
    }

    // Ensure element is visible before clicking
    await item.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});

    // Click and wait for detail panel
    // Using force: true to avoid "intercepted" errors, though Locator.click usually handles this
    await item.click({ timeout: 5000 }).catch(err => {
      console.warn(`Click failed for ${name}: ${err.message}. Re-trying with dispatch...`);
      return item.dispatchEvent('click');
    });

    try {
      // Wait for the detail panel to appear
      await page.waitForSelector('.DUwDvf', { timeout: 8000 });

      // Verify that the detail panel matches the lead we clicked
      // This prevents "data leakage" from the previous lead's side panel
      let panelName = '';
      for (let i = 0; i < 5; i++) {
        panelName = await page.locator('.DUwDvf').first().innerText().catch(() => '');
        if (panelName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(panelName.toLowerCase())) {
          break;
        }
        await page.waitForTimeout(500);
      }

      // Small delay for panel content to settle
      await page.waitForTimeout(500);

      let leadCoords: Coordinates | null = null;
      for (let i = 0; i < 3; i++) {
        leadCoords = extractCoordsFromUrl(page.url());
        if (leadCoords) break;
        await page.waitForTimeout(800);
      }

      let distance = listDetails.distance;
      if (baseCoords && leadCoords) {
        const distKm = calculateDistance(baseCoords, leadCoords);
        distance = distKm < 1
          ? `${(distKm * 1000).toFixed(0)} m`
          : `${distKm.toFixed(1)} km`;
      }

      const panelDetails = await page.evaluate(() => {
        // Find phone
        const phoneEl = Array.from(document.querySelectorAll('[data-item-id]')).find(el =>
          (el.getAttribute('data-item-id') || '').includes('phone:tel:') &&
          (el as HTMLElement).offsetParent !== null
        );
        let phone = phoneEl ? (phoneEl as HTMLElement).innerText.trim() : null;

        if (!phone) {
          const phoneLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'))
            .filter(el => (el as HTMLElement).offsetParent !== null);
          phone = phoneLinks.length > 0 ? (phoneLinks[0] as HTMLAnchorElement).href.replace('tel:', '').trim() : null;
        }

        // Find website
        const webEl = Array.from(document.querySelectorAll('[data-item-id="authority"]'))
          .find(el => (el as HTMLElement).offsetParent !== null);
        let website = webEl ? (webEl as HTMLAnchorElement).href : null;

        if (!website) {
          const webBtn = Array.from(document.querySelectorAll('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-tooltip*="Situs"], a[data-tooltip*="website"]'))
            .find(el => (el as HTMLElement).offsetParent !== null);
          website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
        }

        if (!phone) {
          const phoneBtn = Array.from(document.querySelectorAll('button, a, span')).find(el => {
            if ((el as HTMLElement).offsetParent === null) return false;
            const text = (el as HTMLElement).innerText || '';
            return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(text.replace(/[\s\-]/g, ''));
          });
          phone = phoneBtn ? (phoneBtn as HTMLElement).innerText.trim() : null;
        }

        if (phone) phone = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();

        if (website) {
          const lowerWeb = website.toLowerCase();
          if (
            lowerWeb.includes('google.com/maps') ||
            lowerWeb.includes('google.com/search') ||
            lowerWeb.includes('javascript:') ||
            lowerWeb.includes('arenacorp.com') ||
            lowerWeb.includes('facebook.com/pages') ||
            lowerWeb.includes('instagram.com/explore')
          ) {
            website = null;
          }
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
    } catch (e) {
      console.warn(`Gagal mengambil detail mendalam untuk ${name}, menggunakan data list view.`);
      return { name, ...listDetails, email: null };
    }
  } catch (error: any) {
    if (error.message?.includes('detached')) {
      console.error(`Item detached from DOM for item, skipping...`);
    } else {
      console.error(`Error processing item:`, error.message);
    }
    return null;
  }
}

export interface ScrapeResponse {
  leads: ScrapeResult[];
  isDone: boolean;
}

/**
 * Main function to scrape Google Maps leads.
 * OPTIMIZED: Now only extracts data from the list view to stay under Vercel's 10s limit.
 * Expensive deep scraping (clicking) is now moved to a manual process.
 */
export async function scrapeGoogleMaps(options: ScrapeOptions): Promise<ScrapeResponse> {
  const {
    query,
    location,
    lat,
    lng,
    limit = 10,
    radius,
    offset = 0,
    onLeadFound,
    shouldScrapeEmail = false
  } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    geolocation: (lat !== undefined && lng !== undefined)
      ? { latitude: lat, longitude: lng }
      : { longitude: 106.8272, latitude: -6.1751 },
    permissions: ['geolocation'],
    viewport: { width: 800, height: 600 } // Smaller viewport for faster rendering
  });

  const page = await context.newPage();

  // TURBO MODE: Block unnecessary resources
  await page.route('**/*', (route) => {
    const request = route.request();
    const type = request.resourceType();
    const url = request.url();

    // Block images, media, and third-party trackers
    // NOTE: Keep fonts and stylesheets to avoid layout issues that break scraping
    if (['image', 'media'].includes(type) ||
        url.includes('google-analytics') ||
        url.includes('analytics') ||
        url.includes('doubleclick') ||
        url.includes('googleadservices')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const searchQuery = radius ? `${query} near ${location} radius:${radius}km` : `${query} ${location}`;
  let searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

  if (lat && lng) {
    searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${lat},${lng},15z`;
  }

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
      await page.waitForSelector('div[role="article"]', { timeout: 8000 });
    } catch (e) {
      console.log('Menunggu elemen hasil...');
      await page.waitForSelector('div[role="article"]', { timeout: 5000 }).catch(() => {});
    }

    // --- RESTORED: Base coordinate detection for accurate distance ---
    let baseCoords: Coordinates | null = (lat !== undefined && lng !== undefined) ? { lat, lng } : null;

    // If no coordinates provided in options, detect from URL
    if (!baseCoords) {
      for (let i = 0; i < 3; i++) {
        baseCoords = extractCoordsFromUrl(page.url());
        if (baseCoords && (baseCoords.lat !== -6.1751 || baseCoords.lng !== 106.8272)) break;
        await page.waitForTimeout(400);
      }
    }

    if (!baseCoords) baseCoords = { lat: -6.1751, lng: 106.8272 };
    // -----------------------------------------------------------------

    // --- NEW: Fast Bulk Extraction Only ---
    // We scroll once to get enough items, then extract all at once.
    // If radius is active, we scroll more aggressively to find enough matching results.
    const scrollTarget = radius ? offset + (limit * 3) + 10 : offset + limit + 5;
    const reachedEnd = await scrollResults(page, scrollTarget);

    const leads: ScrapeResult[] = [];
    const seenNames = new Set<string>();

    const allVisibleLeads = await page.evaluate((base: Coordinates | null) => {
      const items = Array.from(document.querySelectorAll('div[role="article"]'));

      return items.map(el => {
        const ariaLabel = el.getAttribute('aria-label') || '';
        const titleEl = el.querySelector('.qBF1Pd, .fontHeadlineSmall');
        const name = titleEl ? (titleEl as HTMLElement).innerText : (ariaLabel.split(' · ')[0] || ariaLabel || 'Unknown');
        const text = (el as HTMLElement).innerText || '';
        const fullContent = ariaLabel + ' ' + text;

        // 1. Better Phone Extraction
        const telLink = el.querySelector('a[href^="tel:"]');
        let phone = telLink ? (telLink as HTMLAnchorElement).href.replace('tel:', '').trim() : null;

        if (!phone) {
          // Robust Indonesian phone regex including mobile and landline
          const phoneRegex = /(?:\+62|62|0)(?:\d{2,4})[\s.-]?(?:\d{3,5})[\s.-]?(?:\d{3,5})|(?:\+62|62|0)8[1-9][0-9]{7,11}/g;
          const matches = fullContent.match(phoneRegex);
          if (matches) {
            // Priority matching to avoid metadata garbage like "50 2 01 07 1900"
            const prioritizedMatches = matches.sort((a, b) => {
              const score = (s: string) => {
                const digits = s.replace(/[^\d]/g, '');
                if (s.startsWith('+62') || s.startsWith('62')) return 100;
                if (s.startsWith('08')) return 90;
                if (digits.length >= 10) return 80;
                return digits.length;
              };
              return score(b) - score(a);
            });

            phone = prioritizedMatches.find(m => {
              const digits = m.replace(/[^\d]/g, '');
              // Filter out obvious garbage like years or short sequences
              return digits.length >= 7 && !/^19\d{2}$|^20\d{2}$/.test(digits);
            }) || null;
          }
        }

        if (!phone) {
          const possibleElements = Array.from(el.querySelectorAll('span, div, button'));
          for (const subEl of possibleElements) {
            const subText = (subEl as HTMLElement).innerText || '';
            if (/(?:\+62|62|0)8[1-9][0-9]{7,11}/.test(subText.replace(/[\s.-]/g, ''))) {
              phone = subText.trim();
              break;
            }
          }
        }

        if (phone) {
          phone = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();
          if (phone.length < 7) phone = null;
        }

        // 2. Accurate Distance - Inlined Haversine to avoid __name transpiler issue
        const distTextMatch = text.match(/\d+([.,]\d+)?\s*(km|m)\b/i);
        let distance = distTextMatch ? distTextMatch[0] : null;

        const link = el.querySelector('a[href*="/maps/place/"]');
        if (link && base) {
          const href = (link as HTMLAnchorElement).href;
          const coordMatch = href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            const lat2 = parseFloat(coordMatch[1]);
            const lng2 = parseFloat(coordMatch[2]);
            const R = 6371;
            const dLat = (lat2 - base.lat) * (Math.PI / 180);
            const dLng = (lng2 - base.lng) * (Math.PI / 180);
            const a = Math.sin(dLat/2)**2 + Math.cos(base.lat*(Math.PI/180)) * Math.cos(lat2*(Math.PI/180)) * Math.sin(dLng/2)**2;
            const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
          }
        }

        // 3. Website Extraction
        const webBtn = el.querySelector('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-value="Website"], a[data-tooltip*="Situs"], a[data-tooltip*="website"]');
        let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
        if (website && (website.includes('google.com') || website.includes('search') || website.includes('javascript:'))) website = null;

        return {
          name,
          phone: phone || null,
          website: website || null,
          distance,
          email: null
        };
      });
    }, baseCoords);

    console.log(`Berhasil mengekstrak ${allVisibleLeads.length} data dari list view.`);

    // Skip items before offset
    const newLeads = allVisibleLeads.slice(offset);

    for (const lead of newLeads) {
      if (leads.length >= limit) break;
      if (seenNames.has(lead.name)) continue;

      // Apply radius filtering
      if (radius && lead.distance) {
        const distMatch = lead.distance.match(/(\d+([.,]\d+)?)\s*(km|m)/i);
        if (distMatch) {
          let distVal = parseFloat(distMatch[1].replace(',', '.'));
          if (distMatch[3].toLowerCase() === 'm') distVal /= 1000;
          if (distVal > radius) continue;
        }
      }

      seenNames.add(lead.name);
      leads.push(lead);

      // Call streaming callback
      if (onLeadFound) {
        onLeadFound(lead);
      }

      console.log(`[Extracted] ${lead.name} (${lead.phone || 'No Phone'})`);
    }

    if (leads.length === 0 && offset === 0 && reachedEnd) {
      throw new Error(`Tidak ditemukan hasil valid untuk "${query}" di "${location}".`);
    }

    await browser.close();
    // We are done if we reached the actual end of Google Maps results
    // or if we found enough leads to satisfy the limit.
    return {
      leads,
      isDone: reachedEnd || leads.length >= limit
    };

  } catch (error: any) {
    console.error('Terjadi kesalahan saat scraping:', error.message);
    await browser.close();
    throw error;
  }
}

/**
 * NEW: Scrapes deep details for a SINGLE lead by clicking its list item.
 * Used for manual enrichment of website and phone if missing.
 */
export async function scrapeLeadDetailsByName(name: string, location: string): Promise<Partial<ScrapeResult>> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const searchQuery = `${name} ${location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    console.log(`Mencari detail untuk: ${name}...`);
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });

    // 1. Wait for either the results list OR the direct business panel
    // The panel has the class .DUwDvf or data-item-id="title"
    const resultsOrPanel = await Promise.race([
      page.waitForSelector('div[role="article"]', { timeout: 15000 }).then(() => 'list'),
      page.waitForSelector('.DUwDvf', { timeout: 15000 }).then(() => 'panel'),
      page.waitForSelector('[data-item-id="title"]', { timeout: 15000 }).then(() => 'panel')
    ]).catch(() => 'timeout');

    if (resultsOrPanel === 'timeout') {
      console.error(`Timeout mencari ${name}: Tidak ada hasil atau panel yang muncul.`);
      await browser.close();
      return {};
    }

    if (resultsOrPanel === 'list') {
      const items = page.locator('div[role="article"]');
      const count = await items.count();

      let targetItem = null;
      for (let i = 0; i < Math.min(count, 5); i++) {
        const ariaLabel = await items.nth(i).getAttribute('aria-label');
        if (ariaLabel?.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(ariaLabel?.toLowerCase() || '')) {
          targetItem = items.nth(i);
          break;
        }
      }

      if (targetItem) {
        await targetItem.click();
        await page.waitForSelector('.DUwDvf', { timeout: 10000 }).catch(() => {});
      } else {
        // If not matched, maybe it's still correct but name is slightly different
        // Let's try the first one as a fallback
        await items.first().click();
        await page.waitForSelector('.DUwDvf', { timeout: 10000 }).catch(() => {});
      }
    }

    // Small wait for panel content to settle
    await page.waitForTimeout(1000);

    // 2. Extract from panel
    const details = await page.evaluate(() => {
      // Find phone
      const phoneEl = Array.from(document.querySelectorAll('[data-item-id]')).find(el =>
        (el.getAttribute('data-item-id') || '').includes('phone:tel:') &&
        (el as HTMLElement).offsetParent !== null
      );
      let phone = phoneEl ? (phoneEl as HTMLElement).innerText.trim() : null;

      if (!phone) {
        const phoneLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'))
          .filter(el => (el as HTMLElement).offsetParent !== null);
        phone = phoneLinks.length > 0 ? (phoneLinks[0] as HTMLAnchorElement).href.replace('tel:', '').trim() : null;
      }

      // Find website
      const webEl = Array.from(document.querySelectorAll('[data-item-id="authority"]'))
        .find(el => (el as HTMLElement).offsetParent !== null);
      let website = webEl ? (webEl as HTMLAnchorElement).href : null;

      if (!website) {
        const webBtn = Array.from(document.querySelectorAll('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-tooltip*="Situs"], a[data-tooltip*="website"]'))
          .find(el => (el as HTMLElement).offsetParent !== null);
        website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
      }

      if (website && (website.includes('google.com') || website.includes('search'))) website = null;
      if (phone) phone = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();

      return { phone, website };
    });

    console.log(`Berhasil mendapatkan detail untuk ${name}:`, details);
    await browser.close();
    return details;
  } catch (error) {
    console.error(`Error scraping details for ${name}:`, error);
    await browser.close();
    return {};
  }
}
