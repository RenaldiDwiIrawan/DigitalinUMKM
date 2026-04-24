import { chromium as playwright, BrowserContext, Page, Browser, Locator } from 'playwright-core';
import { getBrowser } from './browser';
import { extractBestPhone, extractCoordsFromUrl, calculateDistance, formatDistance, Coordinates } from './utils';

// Stringified versions of utilities for browser injection
const PHONE_UTIL_SCRIPT = `window.extractBestPhone = ${extractBestPhone.toString()};`;
const GEO_UTIL_SCRIPT = `window.calculateDistance = ${calculateDistance.toString()};`;

// Extend window interface for injected utilities
declare global {
  interface Window {
    extractBestPhone: (input: string) => string | null;
    calculateDistance: (coord1: Coordinates, coord2: Coordinates) => number;
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
  lat?: number;
  lng?: number;
  limit?: number;
  radius?: number;
  offset?: number;
  onLeadFound?: (lead: ScrapeResult) => void;
  shouldScrapeEmail?: boolean;
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
      await page.goto(targetUrl, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1000);

      const found = await page.evaluate(() => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const text = document.body.innerText;
        const html = document.body.innerHTML;
        const combinedText = text + ' ' + html;
        const matches = combinedText.match(emailRegex);
        if (!matches) return null;

        return Array.from(new Set(matches)).find(email => {
          const lower = email.toLowerCase();
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
async function scrollResults(page: Page, limit: number, radius?: number): Promise<boolean> {
  const scrollContainerSelector = 'div[role="feed"], div[aria-label^="Results"], .m6qeH.tL9Q4c';
  const maxScrollAttempts = 40;
  let scrollAttempts = 0;
  let lastCount = 0;
  let stagnantAttempts = 0;
  let reachedEnd = false;

  console.log(`Turbo Scrolling: mencari hingga ${limit} data${radius ? ` dalam radius ${radius}km` : ''}...`);

  while (scrollAttempts < maxScrollAttempts) {
    const itemsCount = (await page.$$('div[role="article"]')).length;
    if (itemsCount >= limit) break;

    if (itemsCount === lastCount) {
      stagnantAttempts++;
      if (stagnantAttempts > 3) break;
    } else {
      stagnantAttempts = 0;
    }
    lastCount = itemsCount;

    reachedEnd = await page.evaluate(() => {
      const endText = document.body.innerText;
      return endText.includes("reached the end") ||
             endText.includes("Hasil akhir") ||
             endText.includes("Tidak ada hasil lagi") ||
             !!document.querySelector('.HlvSq');
    });

    if (reachedEnd) break;

    await page.evaluate((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.scrollTop += 3000;
      } else {
        window.scrollBy(0, 3000);
      }
    }, scrollContainerSelector);

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
    const name = (await item.getAttribute('aria-label')) || 'Unknown';

    const listDetails = await item.evaluate((el: HTMLElement) => {
      const text = el.innerText;
      const ariaLabel = el.getAttribute('aria-label') || '';
      const fullContent = ariaLabel + ' ' + text;

      const phoneMatch = window.extractBestPhone(fullContent);
      const distanceMatch = text.match(/\d+([.,]\d+)?\s*(km|m)\b/i);

      const webBtn = el.querySelector('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-value="Website"]');
      let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;

      if (website && (
        website.includes('google.com/maps') ||
        website.includes('google.com/search') ||
        website.includes('javascript:') ||
        website.includes('arenacorp.com')
      )) {
        website = null;
      }

      return {
        phone: phoneMatch || null,
        website,
        distance: distanceMatch ? distanceMatch[0] : null
      };
    }).catch(err => {
      console.warn(`Evaluation failed for ${name}:`, err.message);
      return { phone: null, website: null, distance: null };
    });

    if (listDetails.phone && listDetails.website) {
      return {
        name,
        phone: listDetails.phone,
        website: listDetails.website,
        distance: listDetails.distance,
        email: null
      };
    }

    await item.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
    await item.click({ timeout: 5000 }).catch(() => item.dispatchEvent('click'));

    try {
      await page.waitForSelector('.DUwDvf, [data-item-id*="phone:tel:"], a[href^="tel:"]', { timeout: 10000 });
      let leadCoords: Coordinates | null = null;
      for (let i = 0; i < 5; i++) { // Increased retries
        leadCoords = extractCoordsFromUrl(page.url());
        if (leadCoords) break;
        await page.waitForTimeout(1000); // 1s delay
      }

      let distance = listDetails.distance;
      if (baseCoords && leadCoords) {
        const distKm = calculateDistance(baseCoords, leadCoords);
        distance = formatDistance(distKm);
      }

      const panelDetails = await page.evaluate(() => {
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

        if (!phone) {
          const phoneBtn = Array.from(document.querySelectorAll('button, a, span')).find(el => {
            if ((el as HTMLElement).offsetParent === null) return false;
            const text = (el as HTMLElement).innerText || '';
            return !!window.extractBestPhone(text);
          });
          if (phoneBtn) phone = window.extractBestPhone((phoneBtn as HTMLElement).innerText);
        }

        if (phone) phone = window.extractBestPhone(phone);

        // Deep scan fallback if primary selectors fail
        if (!phone) {
          const detailPanel = document.querySelector('.bJzY7c, .m6qeH');
          if (detailPanel) {
            phone = window.extractBestPhone((detailPanel as HTMLElement).innerText);
          }
        }

        const webEl = Array.from(document.querySelectorAll('[data-item-id="authority"]'))
          .find(el => (el as HTMLElement).offsetParent !== null);
        let website = webEl ? (webEl as HTMLAnchorElement).href : null;

        if (!website) {
          const webBtn = Array.from(document.querySelectorAll('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-tooltip*="Situs"], a[data-tooltip*="website"]'))
            .find(el => (el as HTMLElement).offsetParent !== null);
          website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
        }

        if (website) {
          const lowerWeb = website.toLowerCase();
          if (lowerWeb.includes('google.com') || lowerWeb.includes('search') || lowerWeb.includes('facebook.com/pages')) website = null;
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
      return { name, ...listDetails, email: null };
    }
  } catch (error: any) {
    return null;
  }
}

export interface ScrapeResponse {
  leads: ScrapeResult[];
  isDone: boolean;
}

/**
 * Main function to scrape Google Maps leads.
 */
export async function scrapeGoogleMaps(options: ScrapeOptions): Promise<ScrapeResponse> {
  const { query, location, lat, lng, limit = 10, radius, offset = 0, onLeadFound } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    geolocation: (lat !== undefined && lng !== undefined) ? { latitude: lat, longitude: lng } : { longitude: 106.8272, latitude: -6.1751 },
    permissions: ['geolocation'],
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  await page.addInitScript(PHONE_UTIL_SCRIPT);
  await page.addInitScript(GEO_UTIL_SCRIPT);

  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    const url = route.request().url();
    if (['image', 'media', 'font', 'stylesheet', 'other'].includes(type) || url.includes('analytics') || url.includes('doubleclick')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const searchQuery = radius ? `${query} near ${location} radius:${radius}km` : `${query} ${location}`;
  let searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
  if (lat && lng) searchUrl += `/@${lat},${lng},15z`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('div[role="article"]', { timeout: 10000 }).catch(() => {});

    let baseCoords: Coordinates = (lat !== undefined && lng !== undefined) ? { lat, lng } : { lat: -6.1751, lng: 106.8272 };
    if (lat === undefined) {
      const urlCoords = extractCoordsFromUrl(page.url());
      if (urlCoords) baseCoords = urlCoords;
    }

    const scrollTarget = offset + limit + 5;
    const reachedEnd = await scrollResults(page, scrollTarget, radius);

    const allVisibleLeads = await page.evaluate((base: Coordinates) => {
      const items = Array.from(document.querySelectorAll('div[role="article"]'));
      return items.map(el => {
        const ariaLabel = el.getAttribute('aria-label') || '';
        const name = el.querySelector('.qBF1Pd, .fontHeadlineSmall')?.textContent || ariaLabel.split(' · ')[0] || 'Unknown';
        const text = (el as HTMLElement).innerText || '';
        const fullContent = ariaLabel + ' ' + text;

        let phone = window.extractBestPhone(fullContent);
        if (!phone) {
          const subEl = el.querySelector('a[href^="tel:"]');
          if (subEl) phone = (subEl as HTMLAnchorElement).href.replace('tel:', '').trim();
        }
        if (phone) phone = window.extractBestPhone(phone);

        let distance = text.match(/\d+([.,]\d+)?\s*(km|m)\b/i)?.[0] || null;
        const link = el.querySelector('a[href*="/maps/place/"]')?.getAttribute('href');
        if (link) {
          const coordMatch = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            const d = window.calculateDistance(base, { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
          }
        }

        const webBtn = el.querySelector('a[aria-label*="Website"], a[aria-label*="Situs"]');
        let website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
        if (website && (website.includes('google.com') || website.includes('search'))) website = null;

        return { name, phone, website, distance, email: null };
      });
    }, baseCoords);

    const leads: ScrapeResult[] = [];
    const seenNames = new Set<string>();

    for (const lead of allVisibleLeads.slice(offset)) {
      if (leads.length >= limit) break;
      if (seenNames.has(lead.name)) continue;

      // Strict radius filtering: discard results outside the requested radius
      if (radius) {
        if (!lead.distance) {
          // If we can't determine distance and radius is strict, skip to be safe
          continue;
        }

        try {
          const distStr = lead.distance.toLowerCase().replace(',', '.');
          let distKm = 0;
          if (distStr.includes('km')) {
            distKm = parseFloat(distStr.replace('km', '').trim());
          } else if (distStr.includes('m')) {
            distKm = parseFloat(distStr.replace('m', '').trim()) / 1000;
          }

          if (distKm > radius) {
            console.log(`Skipping ${lead.name} - outside radius: ${lead.distance} > ${radius}km`);
            continue;
          }
        } catch (e) {
          console.warn(`Failed to parse distance for ${lead.name}: ${lead.distance}`);
          continue; // Skip if we can't parse but radius is required
        }
      }

      seenNames.add(lead.name);
      leads.push(lead);
      if (onLeadFound) onLeadFound(lead);
    }

    await browser.close();
    return { leads, isDone: reachedEnd || leads.length >= limit };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Scrapes deep details for a SINGLE lead.
 */
export async function scrapeLeadDetailsByName(name: string, location: string): Promise<Partial<ScrapeResult>> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.addInitScript(PHONE_UTIL_SCRIPT);

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + location)}`;
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('.DUwDvf, div[role="article"]', { timeout: 15000 }).catch(() => {});

    const details = await page.evaluate(() => {
      const phoneEl = Array.from(document.querySelectorAll('[data-item-id*="phone:tel:"]')).find(el => (el as HTMLElement).offsetParent !== null);
      let phone = phoneEl ? (phoneEl as HTMLElement).innerText.trim() : null;
      if (!phone) phone = window.extractBestPhone(document.body.innerText);
      if (phone) phone = window.extractBestPhone(phone);

      const webEl = document.querySelector('[data-item-id="authority"], a[aria-label*="Website"]');
      let website = webEl ? (webEl as HTMLAnchorElement).href : null;
      if (website && website.includes('google.com')) website = null;

      return { phone, website };
    });

    await browser.close();
    return details;
  } catch (error) {
    await browser.close();
    return {};
  }
}
