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
  onLeadFound?: (lead: ScrapeResult) => void;
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
async function findEmailFromWebsite(context: BrowserContext, url: string): Promise<string | null> {
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
async function scrollResults(page: Page, limit: number): Promise<void> {
  const scrollContainerSelector = 'div[role="feed"], div[aria-label^="Results"], .m6qeH.tL9Q4c';
  const maxScrollAttempts = 15; // Reduced for speed
  let scrollAttempts = 0;

  console.log(`Mulai scrolling untuk mencari hingga ${limit} data...`);

  while (scrollAttempts < maxScrollAttempts) {
    const itemsCount = (await page.$$('div[role="article"]')).length;
    if (itemsCount >= limit * 1.2) break; // Early break if we have enough items

    const isEndReached = await page.evaluate(() => {
      const endText = document.body.innerText;
      return endText.includes("You've reached the end of the list.") ||
             endText.includes("Hasil akhir daftar") ||
             endText.includes("Tidak ada hasil lagi") ||
             endText.includes("Gak ada hasil lagi");
    });

    if (isEndReached) break;

    await page.evaluate((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.scrollTop += 2000; // Increased scroll distance
      } else {
        window.scrollBy(0, 2000);
      }
    }, scrollContainerSelector);

    // Dynamic wait: wait less if we are on a remote browser
    await page.waitForTimeout(1000);
    scrollAttempts++;
  }
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
      // Improved Indonesian phone regex
      const phoneMatch = text.match(/(?:\+62|62|0)8[1-9][0-9]{7,11}/) || text.match(/(\+62|08)\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4}/);
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
        // Helper to find by data-item-id patterns
        const findByItemId = (pattern: string) => {
          const el = Array.from(document.querySelectorAll('[data-item-id]')).find(el =>
            (el.getAttribute('data-item-id') || '').includes(pattern)
          );
          return el ? (el as HTMLElement).innerText.trim() : null;
        };

        // 1. Find phone
        let phone = findByItemId('phone:tel:');
        if (!phone) {
          const phoneLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
          phone = phoneLinks.length > 0 ? (phoneLinks[0] as HTMLAnchorElement).href.replace('tel:', '').trim() : null;
        }

        if (!phone) {
          const phoneBtn = Array.from(document.querySelectorAll('button, a, span')).find(el => {
            const text = (el as HTMLElement).innerText || '';
            return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(text.replace(/[\s\-]/g, ''));
          });
          phone = phoneBtn ? (phoneBtn as HTMLElement).innerText.trim() : null;
        }

        // 2. Find website
        const webEl = document.querySelector('[data-item-id="authority"]');
        let website = webEl ? (webEl as HTMLAnchorElement).href : null;

        if (!website) {
          const webBtn = document.querySelector('a[aria-label*="Website"], a[aria-label*="Situs"], a[data-tooltip*="Situs"], a[data-tooltip*="website"]');
          website = webBtn ? (webBtn as HTMLAnchorElement).href : null;
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

/**
 * Main function to scrape Google Maps leads.
 */
export async function scrapeGoogleMaps(options: ScrapeOptions): Promise<ScrapeResult[]> {
  const {
    query,
    location,
    lat,
    lng,
    limit = 10,
    radius,
    onLeadFound
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
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const searchQuery = radius ? `${query} near ${location} radius:${radius}km` : `${query} ${location}`;
  let searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

  if (lat && lng) {
    searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${lat},${lng},15z`;
  }

  try {
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });
    try {
      await page.waitForSelector('div[role="article"]', { timeout: 15000 });
    } catch (e) {
      console.log('Menunggu elemen hasil lebih lama...');
      await page.waitForSelector('div[role="article"]', { timeout: 15000 });
    }

    // Enhanced base coordinate detection
    let baseCoords: Coordinates | null = null;
    console.log(`Mencari titik acuan lokasi untuk: ${location}...`);

    for (let i = 0; i < 8; i++) { // Increased wait for map to center
      baseCoords = extractCoordsFromUrl(page.url());
      // Check if coordinates are found and they are not the default Jakarta center if we are searching elsewhere
      if (baseCoords && (baseCoords.lat !== -6.1751 || baseCoords.lng !== 106.8272)) {
        console.log(`Titik acuan lokasi ditemukan: ${baseCoords.lat}, ${baseCoords.lng}`);
        break;
      }
      await page.waitForTimeout(1000);
    }

    if (!baseCoords) {
      baseCoords = { lat: -6.1751, lng: 106.8272 };
      console.log('Peringatan: Tidak dapat mendeteksi koordinat lokasi spesifik dari URL. Menggunakan koordinat pusat Jakarta sebagai fallback.');
    }

    // Initial scroll
    await scrollResults(page, limit);

    const leads: ScrapeResult[] = [];
    const seenNames = new Set<string>();
    const itemsLocator = page.locator('div[role="article"]');

    let processedIndex = 0;
    let consecutiveFailures = 0;
    const maxItemsToProcess = radius ? 150 : 100; // Process more items if we are filtering by radius

    console.log(`Mulai memproses hasil pencarian (Radius: ${radius ? radius + 'km' : 'Tidak dibatasi'})...`);

    while (leads.length < limit && processedIndex < maxItemsToProcess) {
      let currentCount = await itemsLocator.count();

      if (processedIndex >= currentCount) {
        console.log(`Mencapai akhir hasil yang dimuat (${currentCount}), mencoba scroll lebih banyak...`);
        await scrollResults(page, limit);
        const newCount = await itemsLocator.count();
        if (newCount <= currentCount) break;
        currentCount = newCount;
      }

      const item = itemsLocator.nth(processedIndex);
      const lead = await extractLeadDetails(page, item, baseCoords);

      if (lead) {
        consecutiveFailures = 0;

        // --- Radius Filtering Logic ---
        if (radius && lead.distance) {
          // Parse numeric distance from string (e.g., "1.5 km" or "800 m")
          const distMatch = lead.distance.match(/(\d+([.,]\d+)?)\s*(km|m)/i);
          if (distMatch) {
            let distVal = parseFloat(distMatch[1].replace(',', '.'));
            const unit = distMatch[3].toLowerCase();
            if (unit === 'm') distVal = distVal / 1000;

            if (distVal > radius) {
              console.log(`Melompati ${lead.name} karena jaraknya ${distVal.toFixed(1)}km (melebihi radius ${radius}km)`);
              processedIndex++;
              continue;
            }
          }
        }
        // ------------------------------

        if (!seenNames.has(lead.name)) {
          seenNames.add(lead.name);

          // Enrich with email immediately if website exists
          if (lead.website) {
            console.log(`Mencari email untuk ${lead.name} di ${lead.website}...`);
            lead.email = await findEmailFromWebsite(context, lead.website);
          }

          leads.push(lead);
          console.log(`Berhasil mengambil (${leads.length}/${limit}): ${lead.name} (${lead.distance || 'jarak N/A'})`);

          // Call streaming callback
          if (onLeadFound) {
            onLeadFound(lead);
          }
        }
      } else {
        consecutiveFailures++;
        if (consecutiveFailures >= 5) break;
      }

      processedIndex++;

      // Early exit if no results found within radius after checking initial candidates
      if (radius && leads.length === 0 && processedIndex >= 15) {
        throw new Error(`Tidak ditemukan "${query}" dalam radius ${radius}km di "${location}". Coba perbesar radius atau gunakan kata kunci lain.`);
      }
    }

    if (leads.length === 0) {
      throw new Error(`Tidak ditemukan hasil valid untuk "${query}" di "${location}".`);
    }

    await browser.close();
    return leads;

  } catch (error: any) {
    console.error('Terjadi kesalahan saat scraping:', error.message);
    await browser.close();
    throw error;
  }
}
